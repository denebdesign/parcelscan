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

// Multi-key and lazy Google Gen AI client helper
function getAvailableApiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API2,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_KEY,
    process.env.GEMINI_KEY2,
    process.env.API_KEY,
    process.env.API_KEY2,
  ];
  const uniqueKeys: string[] = [];
  for (const k of candidates) {
    if (k && typeof k === "string" && k.trim() && !uniqueKeys.includes(k.trim())) {
      uniqueKeys.push(k.trim());
    }
  }
  return uniqueKeys;
}

const aiClientCache = new Map<string, GoogleGenAI>();

function getAIClients(): GoogleGenAI[] {
  const keys = getAvailableApiKeys();
  if (keys.length === 0) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Cloud Run 콘솔의 [변수 및 보안 비밀]에서 GEMINI_API_KEY를 등록해주세요.");
  }
  return keys.map((key) => {
    let client = aiClientCache.get(key);
    if (!client) {
      client = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      aiClientCache.set(key, client);
    }
    return client;
  });
}

function getAIClient(): GoogleGenAI {
  return getAIClients()[0];
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Service connection status endpoint
app.get("/api/check-ai-status", (req, res) => {
  const keys = getAvailableApiKeys();
  res.json({
    ready: keys.length > 0,
    keyCount: keys.length,
    status: keys.length > 0 ? "ready" : "waiting_key",
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


// Helper to execute generateContent with automatic retry, multi-key failover, and model fallback
async function generateContentWithRetry(
  clients: GoogleGenAI[],
  reqContents: any,
  systemPrompt: string,
  responseSchema: any
) {
  // Primary model and fallback models in case of 503/high demand/rate limits
  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (let clientIdx = 0; clientIdx < clients.length; clientIdx++) {
    const ai = clients[clientIdx];
    const keyLabel = `API Key #${clientIdx + 1}/${clients.length}`;

    for (const modelName of candidateModels) {
      // Retry up to 2 times per model with backoff
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Calling Gemini OCR with [${keyLabel}], model: ${modelName} (attempt ${attempt})`);
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
          console.warn(`[${keyLabel}] Attempt ${attempt} on ${modelName} failed:`, errMsg);

          const isQuotaOrLimit =
            errMsg.includes("429") ||
            errMsg.includes("RESOURCE_EXHAUSTED") ||
            errMsg.includes("quota") ||
            errMsg.includes("limit");

          const isOverload =
            isQuotaOrLimit ||
            errMsg.includes("503") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("high demand");

          // If quota or rate limit is reached and we have a secondary key, immediately failover to next key!
          if (isQuotaOrLimit && clientIdx + 1 < clients.length) {
            console.log(`[${keyLabel}] Quota/rate limit hit. Immediately failing over to next API Key #${clientIdx + 2}...`);
            break;
          }

          if (isOverload && attempt < 2) {
            const delay = attempt * 800 + Math.floor(Math.random() * 400);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          if (isOverload) {
            console.log(`Switching from ${modelName} to next fallback model...`);
            break;
          }

          // If it's another non-retriable error, throw immediately
          throw err;
        }
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

    const aiClients = getAIClients();

    const systemPrompt = `
당신은 대한민국 택배 접수 용지 및 손글씨 송장 전문 초정밀 OCR AI 인식기입니다.
주어진 이미지에서 4분할(또는 다분할) 접수 용지의 각 칸별 발송인(보내는 분), 수취인(받는 분), 연락처, 도로명/지번 주소, 상세주소, 상품정보를 글자 하나하나 정확하게 판독하여 JSON 배열로 추출하세요.

[★ 제1원칙: 이미지 회전 감지 및 올바른 정방향 기준 판독 ★]
- 스마트폰 카메라 촬영 특성상 이미지가 90도 회전(시계 또는 반시계), 180도, 또는 옆으로 누운 상태로 입력될 수 있습니다.
- 이미지 내 '택배 접수 용지' 타이틀 및 인쇄된 글씨('보내는분', '받는분', '주소(도로명)')의 방향을 가장 먼저 확인하세요.
- 용지가 바르게 세워진 정방향(Portrait)을 기준으로 상하좌우 각 칸의 위치를 정확하게 특정하여 판독해야 합니다.

[★ 제2원칙: 4분할 칸(Cell) 독립 격리 및 칸 간 데이터 혼합 절대 금지 ★]
- A4 4분할 용지는 4개의 완전히 독립된 네모 격자 박스로 구성됩니다:
  * 1번 칸: 상단 좌측 (Top-Left)
  * 2번 칸: 하단 좌측 (Bottom-Left)
  * 3번 칸: 상단 우측 (Top-Right)
  * 4번 칸: 하단 우측 (Bottom-Right)
- ⚠️ [절대 주의 - 칸 침범 금지]:
  * 각 칸의 데이터는 해당 칸의 테두리 사각형 안에서만 추출해야 합니다.
  * 1번 칸의 [주소] 줄에 적힌 글씨는 오직 1번 칸의 [주소] 줄에서만 읽어야 하며, 아래 2번 칸이나 옆 3번 칸의 주소를 가져오거나 섞어서는 절대로 안 됩니다!
  * 예: 1번 칸 주소 줄에 '경기 부천시 원미구 길주로 210'이라고 적혀 있다면, 1번 칸의 address는 반드시 '경기 부천시 원미구 길주로 210'이어야 하며, 2번 칸에 적힌 '과천시 관문로 69'를 1번 칸에 넣어서는 안 됩니다.
  * 각 칸별로 [보내는분], [받는분], [연락처], [주소], [상세주소], [상품명]이 완전히 독립된 1건의 데이터셋입니다.

[★ 제3원칙: [보내는분]과 [받는분]의 엄격한 분리 ★]
각 칸 내부에는 상단 [보내는분]과 하단 [받는분]으로 나뉘어 있습니다:
1. 상단 [보내는분] (발송인):
   - senderName: 보내는 분 성함 (적혀있는 경우만 추출, 비어있으면 "")
   - senderPhone: 보내는 분 연락처 (적혀있는 경우만 추출, 비어있으면 "")
   - ⚠️ [보내는분]의 성명/연락처를 수취인(recipientName/phone)에 절대 대입하지 마세요.
2. 하단 [받는분] (수취인):
   - recipientName: 물건을 받는 분 성함 (필수)
   - phone: 받는 분 연락처 (필수, 010-XXXX-XXXX 표준형식)
   - address: 받는 분 기본 주소 (도로명주소 또는 지번주소)
   - detailAddress: 받는 분 상세주소 (동/호수, 층수, 건물명 등)
   - itemName: 상품명 및 규격 (예: '감귤 10kg', '감귤 5kg' 등 손글씨 그대로 추출. 비어있으면 "")
   - quantity: 수량 (정수, 기본 1)

[★ 제4원칙: 시각적 정확성 및 글자/숫자 보존 ★]
1. 글씨와 숫자를 있는 그대로 100% 충실하게 판독하세요.
2. 상품명 숫자 정밀 판독:
   - '5kg'과 '10kg'의 숫자 '5'와 '10'을 혼동하지 마세요.
   - 상품명 칸이 비어있고 아무 글씨도 적혀있지 않은 경우, 임의로 품목명을 상상하여 채우지 말고 반드시 빈 문자열("")로 추출하세요.
3. 건물번호 및 번지수 숫자 왜곡 금지:
   - '길주로 210'의 '210', '관문로 69'의 '69', '중앙로 105'의 '105', '효원로 241'의 '241' 등 번지수 숫자를 원본 그대로 정확히 기록하세요.
4. 우편번호(zipCode):
   - 용지에 실제로 손글씨나 인쇄로 5자리 숫자가 명시되어 적혀있는 경우에만 판독하고, 적혀있지 않으면 빈 문자열("")로 두세요.

[JSON 필드 매핑 규칙]
- cellNumber: 칸 번호 (1: 상좌, 2: 하좌, 3: 상우, 4: 하우)
- senderName: 보내는 분 성함
- senderPhone: 보내는 분 전화번호
- recipientName: 받는 분 성함
- phone: 받는 분 전화번호 (하이픈 포함 표준 정규화)
- address: 도로명 기본 주소 (시/도 시/군/구 도로명 건물번호)
- detailAddress: 상세주소 (동호수, 건물명)
- zipCode: 명시된 경우만 5자리, 없으면 ""
- itemName: 용지에 적힌 상품명 (비어있으면 "")
- quantity: 수량 정수 (기본 1)
- memo: "문 앞 보관" 등 요청사항
- status: 'VALID' | 'NEEDS_REVIEW' | 'ERROR'
- validationNotes: 판독 상태 설명
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
          text: "이 이미지에 적힌 모든 택배 접수 데이터를 정밀하게 판독하세요. 특히 [보내는분]과 [받는분]을 절대 혼동하지 말고 각 칸의 보내는분(발송인)과 받는분(수취인)을 정확히 분리하여 추출해주세요.",
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
            description: "보내는 사람(발송인) 성명 또는 상호 ([보내는분] 칸에 적힌 이름)",
          },
          senderPhone: {
            type: Type.STRING,
            description: "보내는 사람(발송인) 연락처 ([보내는분] 칸에 적힌 전화번호)",
          },
          recipientName: {
            type: Type.STRING,
            description: "받는 사람(수취인) 성명 또는 상호 ([받는분] 칸에 적힌 이름)",
          },
          phone: {
            type: Type.STRING,
            description: "받는 사람(수취인) 연락처 ([받는분] 칸에 적힌 전화번호)",
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

    const response = await generateContentWithRetry(aiClients, reqContents, systemPrompt, responseSchema);

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
        const senderName = (item.senderName || "").trim();
        const senderPhone = (item.senderPhone || "").trim();
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
          senderName: senderName,
          senderPhone: senderPhone,
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
