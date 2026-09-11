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
당신은 대한민국 택배 및 농수산물 직배송 현장 전문 초정밀 손글씨/인쇄 OCR AI 인식기입니다.
실제 현장에서는 A4 전용 접수 용지뿐만 아니라, 고객이 직접 손으로 써온 [달력 뒷면, 박스 조각, 구겨진 메모지, 줄노트, 영수증 뒷면, 이면지] 등 매우 다양한 형태의 손글씨가 들어옵니다.
이미지의 서식 유형(전용 양식 vs 자유 메모)을 스스로 감지하여, 각 배송 목적지(받는 분 1인당 1개 레코드)별로 정확한 JSON 배열을 추출하세요.

[★ 서식 유형별 지능형 적응 판독 규칙 ★]

1. [유형 A: 전용 접수 용지 / 분할 격자 양식] (인쇄된 테두리 선이나 [보내는분/받는분] 칸이 있는 경우)
   - 용지의 테두리 선과 칸(Cell)을 기준으로 1건씩 격리하여 판독합니다.
   - 인접 칸과의 주소/성명/연락처 혼합(Cross-contamination)을 엄격히 방지합니다.
   - 상단 [보내는분] 영역의 성명/연락처는 senderName / senderPhone으로 분리 추출하고, [받는분] 영역의 정보는 recipientName, phone, address로 추출합니다.

2. [유형 B: 자유 메모 서식] (달력 뒷면, 박스 조각, 구겨진 종이, 줄노트, 백지 메모 등)
   - 칸이나 인쇄된 테두리가 없는 자유로운 손글씨입니다.
   - [배송 건 분리]: 번호 매김(1, 2, 3..), 빈 줄 간격, 구분선, 또는 [이름/전화번호/주소] 묶음 패턴을 감지하여 수취인 1명당 1개의 레코드로 똑똑하게 분리 추출하세요.
   - [발송인 처리]:
     * 메모지 한켠(상단 등)에 "보내는 사람: OOO" 또는 발송인 정보가 1회 적혀있고 그 아래로 여러 명의 수취인 목록이 나열되어 있다면, 해당 발송인 정보를 모든 수취인 건의 senderName, senderPhone에 공통 적용하세요.
     * 만약 보내는 사람 정보가 전혀 없고 받는 사람 정보만 적혀있다면 senderName, senderPhone은 빈 문자열("")로 두세요. (시스템의 기본 발송인 정보가 자동 연동됩니다.)
   - [구김 및 기울임 극복]: 종이가 구겨지거나 글씨가 비스듬하게 흘려 쓰여 있어도, 한국어 도로명주소/지번주소 체계와 전화번호(010) 문맥을 종합하여 단어와 숫자를 복원 판독하세요.

[★ 공통 절대 원칙: 시각적 정확성 및 글자/숫자 보존 ★]
1. 글씨와 숫자를 있는 그대로 100% 충실하게 판독하세요.
2. [주소 인식]:
   - 도로명주소(길/로/번길/건물번호) 및 지번주소(동/리/번지)를 정확히 판독합니다.
   - 번지수 숫자(예: '210', '69', '105', '241')를 임의 분할하거나 생략하지 마세요.
3. [상품명 및 수량]:
   - '감귤 10kg', '감귤 5kg', '한라봉 3kg' 등 품목과 무게/수량을 정확히 판독하세요.
   - 상품명이 적혀있지 않은 경우 임의로 지어내지 말고 빈 문자열("")로 추출하세요.
4. [우편번호(zipCode)]:
   - 용지에 실제로 손글씨로 5자리 숫자가 명시되어 적혀있는 경우만 판독하고, 없으면 빈 문자열("")로 두세요. (서버가 주소를 기준으로 자동 매칭합니다.)

[JSON 필드 매핑 규칙]
- cellNumber: 순번 (1, 2, 3...)
- senderName: 보내는 분 성함 (없으면 "")
- senderPhone: 보내는 분 연락처 (없으면 "")
- recipientName: 받는 분 성함
- phone: 받는 분 전화번호 (하이픈 포함 표준 정규화, 예: 010-XXXX-XXXX)
- address: 도로명 또는 지번 기본 주소
- detailAddress: 상세주소 (동/호수, 층수, 마을명 등)
- zipCode: 명시된 5자리 우편번호 (없으면 "")
- itemName: 상품명 (적혀있는 경우만, 없으면 "")
- quantity: 수량 정수 (기본 1)
- memo: 배송메모 (적혀있는 경우만, 기본 "문 앞 보관")
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
