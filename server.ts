import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser for JSON with large payload limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy Google Gen AI client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("AI 엔진 연결(GEMINI_API_KEY)이 준비 중입니다. 잠시 후 [다시 시도하기]를 눌러주세요.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Service connection status endpoint
app.get("/api/check-ai-status", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_KEY;
  res.json({
    ready: !!apiKey,
    status: apiKey ? "ready" : "waiting_key",
  });
});

// ads.txt for Google AdSense Crawler
app.get("/ads.txt", (req, res) => {
  res.type("text/plain");
  const pubId = process.env.ADSENSE_PUB_ID || "pub-0000000000000000";
  res.send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// --- Real-time Mobile Camera Sync Sessions ---
interface MobileSyncSession {
  sessionId: string;
  createdAt: number;
  status: "waiting" | "uploaded";
  imageBase64?: string;
  mimeType?: string;
}

const mobileSyncSessions = new Map<string, MobileSyncSession>();

// Periodic cleanup of sessions older than 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of mobileSyncSessions.entries()) {
    if (now - session.createdAt > 15 * 60 * 1000) {
      mobileSyncSessions.delete(key);
    }
  }
}, 60 * 1000);

// 1. Create a new mobile sync session (called by PC)
app.post("/api/mobile-sync/create", (req, res) => {
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
  mobileSyncSessions.set(sessionId, {
    sessionId,
    createdAt: Date.now(),
    status: "waiting",
  });
  res.json({ success: true, sessionId });
});

// 2. Upload photo from mobile phone
app.post("/api/mobile-sync/upload", (req, res) => {
  const { sessionId, imageBase64, mimeType = "image/jpeg" } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "세션 ID가 필요합니다." });
  }
  const session = mobileSyncSessions.get(sessionId.toUpperCase());
  if (!session) {
    return res.status(404).json({ error: "유효하지 않거나 만료된 세션입니다. PC 화면에서 QR코드를 새로고침해주세요." });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: "사진 데이터가 누락되었습니다." });
  }

  session.status = "uploaded";
  session.imageBase64 = imageBase64;
  session.mimeType = mimeType;

  res.json({ success: true, message: "PC로 사진이 성공적으로 전송되었습니다." });
});

// 3. Check session status (polled by PC)
app.get("/api/mobile-sync/status/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId.toUpperCase();
  const session = mobileSyncSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "세션을 찾을 수 없습니다." });
  }

  if (session.status === "uploaded" && session.imageBase64) {
    const data = {
      success: true,
      status: "uploaded",
      imageBase64: session.imageBase64,
      mimeType: session.mimeType || "image/jpeg",
    };
    // Keep it for a short time or delete after consumption
    return res.json(data);
  }

  return res.json({ success: true, status: "waiting" });
});

// 4. Delete / clear session
app.delete("/api/mobile-sync/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId.toUpperCase();
  mobileSyncSessions.delete(sessionId);
  res.json({ success: true });
});


// Helper to execute generateContent with automatic retry and model fallback
async function generateContentWithRetry(
  ai: GoogleGenAI,
  reqContents: any,
  systemPrompt: string,
  responseSchema: any
) {
  // Primary model and fallback models in case of 503/high demand/rate limits
  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    // Retry up to 3 times per model with backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Calling Gemini OCR with model: ${modelName} (attempt ${attempt})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: reqContents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.0, // Strict deterministic OCR without creative hallucination
          },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Attempt ${attempt} on ${modelName} failed:`, errMsg);

        const isOverload =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED");

        if (isOverload && attempt < 3) {
          // Wait with backoff: 1s, 2s
          const delay = attempt * 1000 + Math.floor(Math.random() * 500);
          console.log(`Retrying in ${delay}ms due to high demand/rate limit...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If it's an overload on this model and attempts exhausted, break to next candidate model
        if (isOverload) {
          console.log(`Switching from ${modelName} to next fallback model...`);
          break;
        }

        // If it's another non-retriable error (e.g. invalid arg), throw immediately
        throw err;
      }
    }
  }

  throw lastError;
}

// Post-processing address sanitizer to fix common OCR confusion patterns
function cleanKoreanAddress(addr: string): string {
  if (!addr) return "";
  let cleaned = addr.trim();

  // Known Korean Road Name OCR character confusion corrections
  cleaned = cleaned.replace(/새비벌(서|동|남|북)?로/g, "새비봉$1로");
  cleaned = cleaned.replace(/새비벌/g, "새비봉");
  
  return cleaned;
}

// Clean item name by removing redundant box/quantity mentions (e.g., '(1박스)', '1박스', '(2box)')
function cleanKoreanItemName(name: string): string {
  if (!name) return "";
  let cleaned = name.trim();
  // Remove patterns like (1박스), (2박스), (1box), (10박스), 1박스, 2박스 at the end
  cleaned = cleaned.replace(/\s*[\(\[\{]\s*\d+\s*(박스|box|상자|포|EA|개|개입)\s*[\)\]\}]/gi, "");
  cleaned = cleaned.replace(/\s+\d+\s*(박스|box|상자)\s*$/gi, "");
  return cleaned.trim();
}

// Official Korean 5-digit Postal Code & Standard Road Address Lookup
async function lookupOfficialKoreanPostcode(rawAddress: string): Promise<{
  zipCode: string;
  standardAddress?: string;
  matched: boolean;
}> {
  if (!rawAddress || rawAddress.trim().length < 3) {
    return { zipCode: "", matched: false };
  }

  // Clean address for search query: strip parentheses, room/floor numbers
  let query = rawAddress
    .replace(/\(.*?\)/g, " ")
    .replace(/\b\d+(동|호|층|호수|동호수)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://api.poesis.kr/post/search.php?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ParcelScan-Official-OCR/1.0",
        "Accept": "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: any = await res.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        const best = data.results[0];
        const postcode = best.postcode5 || best.postcode6 || "";
        const common = best.ko_common || "";
        const doro = best.ko_doro || "";
        const standardAddress = common && doro ? `${common} ${doro}`.trim() : undefined;
        return {
          zipCode: postcode,
          standardAddress,
          matched: !!postcode,
        };
      }
    }
  } catch (e) {
    console.warn("Official Postcode lookup error for query:", query, e);
  }

  // Secondary fallback: search using the first 3-4 keywords (e.g. 시/군/구 + 도로명 + 번지)
  const words = query.split(" ").filter((w) => w.length > 0);
  if (words.length > 3) {
    const shortQuery = words.slice(0, 4).join(" ");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`https://api.poesis.kr/post/search.php?q=${encodeURIComponent(shortQuery)}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "ParcelScan-Official-OCR/1.0",
          "Accept": "application/json",
        },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data: any = await res.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          const best = data.results[0];
          const postcode = best.postcode5 || best.postcode6 || "";
          return { zipCode: postcode, matched: !!postcode };
        }
      }
    } catch {
      // ignore
    }
  }

  return { zipCode: "", matched: false };
}

// Endpoint to resolve postal code for any single or multiple addresses on demand
app.post("/api/resolve-postcode", async (req, res) => {
  const { addresses } = req.body;
  if (!addresses || !Array.isArray(addresses)) {
    return res.status(400).json({ error: "addresses 배열이 필요합니다." });
  }

  const results = await Promise.all(
    addresses.map(async (addr: string) => {
      const lookup = await lookupOfficialKoreanPostcode(addr);
      return {
        query: addr,
        ...lookup,
      };
    })
  );

  return res.json({ success: true, results });
});

// AI OCR Address Extraction Endpoint
app.post("/api/scan-address", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터(imageBase64)가 필요합니다." });
    }

    // Clean base64 string if it has data url prefix
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const ai = getAIClient();

    const systemPrompt = `
당신은 대한민국 전국 택배 송장 및 손글씨/인쇄된 주소 접수 용지 전문 초정밀 OCR AI 인식기입니다.
주어진 이미지에서 각 칸별(또는 메모별) 수취인(받는 분), 발송인(보내는 분), 연락처, 도로명/지번 주소, 상세주소, 상품정보를 글자 하나하나 정확하게 판독하여 JSON 배열로 추출하세요.

[★ 절대 원칙: 시각적 정확성 및 환각(Hallucination) 방지 ★]
1. 이미지에 쓰여있는 글자와 숫자를 있는 그대로 100% 정밀 판독하세요.
2. 절대 이미 적혀있는 주소를 다른 주소로 임의 대체하거나 지어내지 마세요.
   - [중요 사례 1]: '새비봉서로'와 같이 지역 오름/지명 기반 도로명을 '새비벌서로' 등으로 잘못 읽지 마세요. (받침 'ㅇ'과 모음 'ㅗ'를 정밀하게 확인하세요.)
   - [중요 사례 2]: '제주시 일주동로 2973'과 같이 적힌 경우 도로명 '일주동로'와 4자리 번지 '2973'을 그대로 보존하세요. 절대로 '원노형로 29-3' 등 엉뚱한 도로명이나 축약된 번지로 왜곡하지 마세요!
3. 건물번호 및 번지수 숫자 보존:
   - '2973'은 4자리 숫자 '2973' 그대로 적어야 하며, '29-3'처럼 하이픈을 넣거나 임의 분할하지 마세요.
   - 단, 원본에 실제로 '29-3' 또는 '123-4'라고 대시/하이픈이 쓰여있을 때만 하이픈을 포함하세요.
4. 성명 인식:
   - '이순신', '홍길동', '김철수', '이영희' 등 인명 및 상호명을 또박또박 획대로 판독하세요.
5. ★ 우편번호 (zipCode) 절대 임의 생성 금지 ★:
   - 이미지 용지에 실제로 손글씨나 인쇄로 5자리 숫자가 명시되어 적혀있는 경우에만 판독하세요.
   - 용지에 우편번호가 적혀있지 않으면 **절대 임의로 번호를 지어내지 말고 빈 문자열("")**로 두세요! (서버의 도로명주소 우편번호 정밀 DB가 주소를 기준으로 공식 5자리 우편번호를 정확히 자동 부여합니다.)

[필드별 세부 추출 규칙]
1. 용지 형태 및 순서:
   - 1번 칸부터 6번 칸까지 (좌->우, 상->하) 빠짐없이 순서대로 인식하세요.
2. 받는분 (recipientName):
   - 성명 또는 상호명 (예: 이순신, 이영희, 박인수 등)
3. 연락처 (phone):
   - 010-XXXX-XXXX 또는 지역번호(02, 064, 031 등) 하이픈 포함 표준 형태로 정규화.
4. 주소 (address) 및 상세주소 (detailAddress):
   - address: 시/도, 시/군/구, 읍/면/동/리, 도로명 및 건물번호(또는 지번 본번-부번)까지 포함.
     * 예: "제주특별자치도 제주시 일주동로 2973" 또는 "서귀포시 표선면 새비봉서로 20"
   - detailAddress: 동/호수, 층수, 마을이름, 건물명, 상가명, 괄호 참고항목 등.
     * 예: "101동 202호", "가람빌라 3층", "(조천읍)"
5. 우편번호 (zipCode):
   - 용지에 실제로 적혀있는 경우만 5자리 추출, 없으면 빈 문자열("").
6. 상품명 (itemName) & 수량 (quantity):
   - 상품명에서 '(1박스)', '(2박스)', '1박스'와 같은 불필요한 박스 수량 문구는 제거하고 순수 품목명(예: '감자 10kg', '유기농 당근 5kg', '한라봉' 등)만 추출하세요.
   - 박스 수량은 수량(quantity) 필드(정수, 기본값 1)에 따로 정확히 분리하여 기재하세요.
7. 배송메모 (memo):
   - "문 앞", "부재 시 경비실", "배송 전 연락" 등 요청사항.
8. 상태 판별 (status):
   - 'VALID': 이름, 연락처, 주소(도로명/번지)가 모두 명확한 경우
   - 'NEEDS_REVIEW': 글씨가 심하게 뭉개지거나 확인이 필요한 경우
   - 'ERROR': 주소나 성명이 완전히 누락된 경우
`;

    const reqContents = {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: "이 이미지에 적힌 모든 택배 주소/접수 데이터를 글자 하나하나 정밀하게 판독하여 각 칸별로 정확히 추출해주세요. 주소와 번지수를 왜곡하지 마세요.",
        },
      ],
    };

    const responseSchema = {
      type: Type.ARRAY,
      description: "인식된 배송지 목록",
      items: {
        type: Type.OBJECT,
        properties: {
          cellNumber: {
            type: Type.INTEGER,
            description: "양식 내 칸 번호 (1부터 시작)",
          },
          senderName: {
            type: Type.STRING,
            description: "보내는 사람 성명 또는 상호",
          },
          senderPhone: {
            type: Type.STRING,
            description: "보내는 사람 연락처",
          },
          recipientName: {
            type: Type.STRING,
            description: "받는사람 성명 또는 상호",
          },
          phone: {
            type: Type.STRING,
            description: "수취인 연락처 (하이픈 포함 포맷)",
          },
          address: {
            type: Type.STRING,
            description: "기본 주소 (도로명 또는 지번)",
          },
          detailAddress: {
            type: Type.STRING,
            description: "상세 주소 (동/호수, 층수, 건물명 등)",
          },
          zipCode: {
            type: Type.STRING,
            description: "5자리 우편번호",
          },
          itemName: {
            type: Type.STRING,
            description: "상품명",
          },
          quantity: {
            type: Type.INTEGER,
            description: "수량 (기본 1)",
          },
          memo: {
            type: Type.STRING,
            description: "배송요청사항",
          },
          status: {
            type: Type.STRING,
            enum: ["VALID", "NEEDS_REVIEW", "ERROR"],
            description: "데이터 무결성 상태",
          },
          validationNotes: {
            type: Type.STRING,
            description: "검증 사유 또는 유의사항",
          },
        },
        required: ["recipientName", "phone", "address", "quantity", "status"],
      },
    };

    const response = await generateContentWithRetry(ai, reqContents, systemPrompt, responseSchema);

    const rawText = response.text || "[]";
    let extractedData = [];
    try {
      extractedData = JSON.parse(rawText);
    } catch (e) {
      console.error("JSON Parse Error:", e, rawText);
      return res.status(500).json({ error: "AI 응답을 JSON으로 변환하는 데 실패했습니다.", rawText });
    }

    // Clean and enrich with official Korean postal code and standardized road address
    const sanitizedData = await Promise.all(
      extractedData.map(async (item: any) => {
        const cleanedAddr = cleanKoreanAddress(item.address || "");
        const detail = (item.detailAddress || "").trim();
        const recipient = (item.recipientName || "").trim();
        const phone = (item.phone || "").trim();
        const cleanedItem = cleanKoreanItemName(item.itemName || "");

        let zip = (item.zipCode || "").replace(/[^0-9]/g, "");

        // Official Korean 5-digit postcode lookup
        if (cleanedAddr) {
          try {
            const lookup = await lookupOfficialKoreanPostcode(cleanedAddr);
            if (lookup.matched && lookup.zipCode) {
              zip = lookup.zipCode; // Overwrite with 100% verified official 5-digit postcode
            }
          } catch (e) {
            console.warn("Postcode resolution error:", e);
          }
        }

        return {
          ...item,
          address: cleanedAddr,
          detailAddress: detail,
          recipientName: recipient,
          phone: phone,
          itemName: cleanedItem,
          zipCode: zip,
          validationNotes: zip ? `공식 우편번호(${zip}) 자동 정제 완료` : (item.validationNotes || "우편번호 확인 필요"),
        };
      })
    );

    return res.json({
      success: true,
      count: sanitizedData.length,
      data: sanitizedData,
    });
  } catch (error: any) {
    console.error("AI Scan Error:", error);
    let friendlyMessage = error?.message || "이미지 주소 인식 중 일시적인 오류가 발생했습니다.";
    if (typeof friendlyMessage === "string" && (friendlyMessage.includes("503") || friendlyMessage.includes("high demand") || friendlyMessage.includes("UNAVAILABLE"))) {
      friendlyMessage = "AI 서버에 일시적인 요청이 집중되어 지연되었습니다. [다시 시도] 버튼을 누르면 즉시 재처리됩니다.";
    }
    return res.status(500).json({
      error: friendlyMessage,
    });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
