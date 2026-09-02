import { ParcelItem, CustomerContact, SenderProfile } from '../types';

export const DEFAULT_SENDER: SenderProfile = {
  name: '제주바람농원 (김대표)',
  phone: '010-9876-5432',
  tel: '064-782-1234',
  address: '제주특별자치도 제주시 구좌읍 세화리 1234',
  detailAddress: '농업회사법인 1층',
  zipCode: '63357',
  defaultItem: '제주 햇감자 10kg',
  defaultCourier: 'cj',
  defaultMemo: '파손주의 / 당일배송 부탁드립니다',
};

export const INITIAL_CUSTOMERS: CustomerContact[] = [
  {
    id: 'cust-1',
    name: '김철수',
    phone: '010-1234-5678',
    address: '제주시 구좌읍 세화로 123',
    detailAddress: '101동 1204호',
    zipCode: '63357',
    defaultItem: '감자 10kg',
    memo: '문 앞',
    orderCount: 14,
    lastOrderedAt: '2026-08-20',
  },
  {
    id: 'cust-2',
    name: '이영희',
    phone: '010-2345-6789',
    address: '서귀포시 성산읍 성산중앙로 45',
    detailAddress: '바다마을 202호',
    zipCode: '63641',
    defaultItem: '유기농 당근 5kg',
    memo: '부재시 경비실',
    orderCount: 8,
    lastOrderedAt: '2026-08-15',
  },
  {
    id: 'cust-3',
    name: '박인수',
    phone: '010-3456-7890',
    address: '제주시 애월읍 애월해안로 111',
    detailAddress: '302호',
    zipCode: '63047',
    defaultItem: '제주 햇감자 10kg',
    memo: '배송 전 연락바랍니다',
    orderCount: 22,
    lastOrderedAt: '2026-08-28',
  },
  {
    id: 'cust-4',
    name: '최지현',
    phone: '010-4567-8910',
    address: '서귀포시 안덕면 덕수남로 216',
    detailAddress: '덕수빌리지 B동',
    zipCode: '63526',
    defaultItem: '깐마늘 3kg',
    memo: '직접 수령',
    orderCount: 5,
    lastOrderedAt: '2026-08-10',
  },
  {
    id: 'cust-5',
    name: '정우성',
    phone: '010-9876-5432',
    address: '제주시 오라동 123-4',
    detailAddress: '오라힐스 301호',
    zipCode: '63184',
    defaultItem: '노지감귤 10kg',
    memo: '경비실 보관',
    orderCount: 3,
    lastOrderedAt: '2026-07-30',
  },
  {
    id: 'cust-6',
    name: '한라봉',
    phone: '010-1111-2222',
    address: '제주시 연동 506호',
    detailAddress: '신제주오피스텔 506호',
    zipCode: '63127',
    defaultItem: '한라봉 선물세트 3kg',
    memo: '선물용 파손주의',
    orderCount: 19,
    lastOrderedAt: '2026-08-27',
  },
];

export const SAMPLE_SCANNED_ITEMS: ParcelItem[] = [
  {
    id: 'scan-item-1',
    cellNumber: 1,
    senderName: '제주바람농원 (김대표)',
    senderPhone: '010-9876-5432',
    recipientName: '이영희',
    phone: '010-9876-5432',
    address: '제주특별자치도 제주시 구좌읍 해맞이해안로 123',
    detailAddress: '101동 202호',
    zipCode: '63357',
    itemName: '감자 10kg',
    quantity: 1,
    memo: '문 앞 보관',
    status: 'VALID',
    validationNotes: '보내는 분 및 받는 분 연락처·주소 정상 확인됨',
  },
  {
    id: 'scan-item-2',
    cellNumber: 2,
    senderName: '제주바람농원 (김대표)',
    senderPhone: '010-9876-5432',
    recipientName: '박인수',
    phone: '010-3456-7890',
    address: '제주시 애월읍 애월해안로 111',
    detailAddress: '302호',
    zipCode: '63047',
    itemName: '제주 햇감자 10kg',
    quantity: 2,
    memo: '배송 전 연락바랍니다',
    status: 'VALID',
    validationNotes: '정상 주소 및 연락처 확인됨',
  },
  {
    id: 'scan-item-3',
    cellNumber: 3,
    senderName: '제주바람농원 (김대표)',
    senderPhone: '010-9876-5432',
    recipientName: '최지현',
    phone: '010-4567-8910',
    address: '서귀포시 안덕면 덕수남로 216',
    detailAddress: '덕수빌리지 B동 102호',
    zipCode: '63526',
    itemName: '깐마늘 3kg',
    quantity: 1,
    memo: '직접 수령',
    status: 'VALID',
    validationNotes: '정상 도로명 주소 매칭',
  },
  {
    id: 'scan-item-4',
    cellNumber: 4,
    senderName: '제주바람농원 (김대표)',
    senderPhone: '010-9876-5432',
    recipientName: '정우성',
    phone: '010-5432-1098',
    address: '제주시 오라동 123-4',
    detailAddress: '오라힐스 301호',
    zipCode: '63184',
    itemName: '노지감귤 10kg',
    quantity: 1,
    memo: '경비실 보관',
    status: 'VALID',
    validationNotes: '정상 주소 및 연락처 확인됨',
  },
];

/**
 * Generates clean, blank SVG markup of the official '택배 접수 용지' matching the user's PDF/Image template.
 */
export function generateBlankA4TemplateSvg(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131" style="background:#ffffff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <defs>
    <filter id="card-shadow" x="-1%" y="-1%" width="102%" height="102%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#1e293b" flood-opacity="0.04"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1600" height="1131" fill="#f8fafc"/>

  <!-- Printable A4 Paper Container -->
  <g transform="translate(30, 30)">
    <rect width="1540" height="1071" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- 1. Header Section -->
    <g transform="translate(35, 30)">
      <!-- Left: Title & Subtitle -->
      <text x="0" y="38" font-size="34" font-weight="900" fill="#1e3a8a" letter-spacing="-0.8">택배 접수 용지</text>
      
      <g transform="translate(0, 68)">
        <text x="0" y="0" font-size="16" font-weight="800" fill="#2563eb">★  모든 항목을 정확하고 또박또박 작성해주세요.</text>
        <text x="360" y="0" font-size="16" font-weight="600" fill="#475569">이 용지를 스마트폰으로 촬영하면 AI가 자동으로 인식합니다.</text>
      </g>

      <!-- Right: 작성 가이드 (OCR 인식률을 높이는 방법) -->
      <g transform="translate(930, -5)">
        <rect width="540" height="105" rx="12" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
        
        <text x="18" y="26" font-size="14.5" font-weight="800" fill="#1e3a8a">작성 가이드 (OCR 인식률을 높이는 방법)</text>
        
        <!-- Guide 2 Columns -->
        <g transform="translate(18, 48)" font-size="13" font-weight="600" fill="#334155">
          <!-- Col 1 -->
          <g>
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">검정색 또는 파란색 펜으로 작성</text>
          </g>
          <g transform="translate(0, 22)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">한 칸에 1줄로 작성</text>
          </g>
          <g transform="translate(0, 44)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">글씨가 겹치지 않게 작성</text>
          </g>

          <!-- Col 2 -->
          <g transform="translate(255, 0)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">숫자, 전화번호는 정확히 작성</text>
          </g>
          <g transform="translate(255, 22)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">띄어쓰기 없이 또박또박 작성</text>
          </g>
          <g transform="translate(255, 44)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">수정 시 두 줄 긋고 다시 작성</text>
          </g>
        </g>
      </g>
    </g>

    <!-- 2. Main 4 Grid Cells (2 Columns x 2 Rows) -->
    <!-- Cell 1: Top Left -->
    <g transform="translate(35, 155)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>
        </g>
      </g>
    </g>

    <!-- Cell 2: Top Right -->
    <g transform="translate(785, 155)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>
        </g>
      </g>
    </g>

    <!-- Cell 3: Bottom Left -->
    <g transform="translate(35, 575)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>
        </g>
      </g>
    </g>

    <!-- Cell 4: Bottom Right -->
    <g transform="translate(785, 575)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>

          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
          </g>
        </g>
      </g>
    </g>

    <!-- 3. Bottom Footer Banner -->
    <g transform="translate(480, 1000)">
      <rect width="580" height="42" rx="21" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2"/>
      
      <circle cx="35" cy="21" r="11" fill="#3b82f6"/>
      <path d="M29 19 Q35 24 41 19" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="18" r="1.5" fill="#ffffff"/>
      <circle cx="38" cy="18" r="1.5" fill="#ffffff"/>

      <text x="58" y="27" font-size="15" font-weight="800" fill="#1e40af">
        정확한 작성이 빠른 배송의 시작입니다. 감사합니다!
      </text>
    </g>
  </g>
</svg>
`;
}

/**
 * Generates an SVG Data URI of the blank A4 template.
 */
export function generateBlankA4TemplateDataUrl(): string {
  const svg = generateBlankA4TemplateSvg();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Downloads the blank A4 template as a high-resolution PNG image directly to user's device.
 */
export async function downloadBlankA4TemplateImage(): Promise<void> {
  const svgString = generateBlankA4TemplateSvg();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2480;
      canvas.height = 1754;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = '택배_접수_용지_양식_A4.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
          }
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      } else {
        URL.revokeObjectURL(url);
        resolve();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
}

/**
 * Generates an SVG Data URI matching the user-uploaded landscape A4 4-box slip template
 * with realistic handwritten sample details.
 */
export function generateSampleA4ImageDataUrl(sender?: Partial<SenderProfile>): string {
  const fallbackSenderName = sender?.name || DEFAULT_SENDER.name;
  const fallbackSenderPhone = sender?.phone || DEFAULT_SENDER.phone;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131" style="background:#ffffff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <defs>
    <filter id="card-shadow" x="-1%" y="-1%" width="102%" height="102%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#1e293b" flood-opacity="0.04"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1600" height="1131" fill="#f8fafc"/>

  <!-- Printable A4 Paper Container -->
  <g transform="translate(30, 30)">
    <rect width="1540" height="1071" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- 1. Header Section -->
    <g transform="translate(35, 30)">
      <text x="0" y="38" font-size="34" font-weight="900" fill="#1e3a8a" letter-spacing="-0.8">택배 접수 용지</text>
      
      <g transform="translate(0, 68)">
        <text x="0" y="0" font-size="16" font-weight="800" fill="#2563eb">★  모든 항목을 정확하고 또박또박 작성해주세요.</text>
        <text x="360" y="0" font-size="16" font-weight="600" fill="#475569">이 용지를 스마트폰으로 촬영하면 AI가 자동으로 인식합니다.</text>
      </g>

      <!-- Right: 작성 가이드 -->
      <g transform="translate(930, -5)">
        <rect width="540" height="105" rx="12" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
        <text x="18" y="26" font-size="14.5" font-weight="800" fill="#1e3a8a">작성 가이드 (OCR 인식률을 높이는 방법)</text>
        
        <g transform="translate(18, 48)" font-size="13" font-weight="600" fill="#334155">
          <g>
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">검정색 또는 파란색 펜으로 작성</text>
          </g>
          <g transform="translate(0, 22)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">한 칸에 1줄로 작성</text>
          </g>
          <g transform="translate(0, 44)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">글씨가 겹치지 않게 작성</text>
          </g>

          <g transform="translate(255, 0)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">숫자, 전화번호는 정확히 작성</text>
          </g>
          <g transform="translate(255, 22)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">띄어쓰기 없이 또박또박 작성</text>
          </g>
          <g transform="translate(255, 44)">
            <circle cx="6" cy="-4" r="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
            <path d="M4 -4 L6 -2 L9 -6" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="18" y="0">수정 시 두 줄 긋고 다시 작성</text>
          </g>
        </g>
      </g>
    </g>

    <!-- 2. Main 4 Grid Cells with Filled Sample Data -->
    <!-- Cell 1: Top Left -->
    <g transform="translate(35, 155)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="60" y="-1" font-size="16" font-weight="800" fill="#0f172a">${fallbackSenderName}</text>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="390" y="-1" font-size="15" font-weight="800" fill="#0f172a" font-family="monospace">${fallbackSenderPhone}</text>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <!-- 이름 & 연락처 -->
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="60" y="-1" font-size="17" font-weight="800" fill="#0f172a">이영희</text>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="390" y="-1" font-size="16" font-weight="800" fill="#0f172a" font-family="monospace">010-9876-5432</text>
          </g>

          <!-- 주소 (도로명) -->
          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#0f172a">제주특별자치도 제주시 구좌읍 해맞이해안로 123</text>
          </g>

          <!-- 상세주소 (동/호수) -->
          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="145" y="-1" font-size="16" font-weight="800" fill="#0f172a">101동 202호</text>
          </g>

          <!-- 상품명 (수량) -->
          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#1d4ed8">감자 10kg</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Cell 2: Top Right -->
    <g transform="translate(785, 155)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="60" y="-1" font-size="16" font-weight="800" fill="#0f172a">${fallbackSenderName}</text>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="390" y="-1" font-size="15" font-weight="800" fill="#0f172a" font-family="monospace">${fallbackSenderPhone}</text>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <!-- 이름 & 연락처 -->
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="60" y="-1" font-size="17" font-weight="800" fill="#0f172a">박인수</text>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="390" y="-1" font-size="16" font-weight="800" fill="#0f172a" font-family="monospace">010-3456-7890</text>
          </g>

          <!-- 주소 (도로명) -->
          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#0f172a">제주시 애월읍 애월해안로 111</text>
          </g>

          <!-- 상세주소 (동/호수) -->
          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="145" y="-1" font-size="16" font-weight="800" fill="#0f172a">302호</text>
          </g>

          <!-- 상품명 (수량) -->
          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#1d4ed8">제주 햇감자 10kg</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Cell 3: Bottom Left -->
    <g transform="translate(35, 575)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="60" y="-1" font-size="16" font-weight="800" fill="#0f172a">${fallbackSenderName}</text>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="390" y="-1" font-size="15" font-weight="800" fill="#0f172a" font-family="monospace">${fallbackSenderPhone}</text>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <!-- 이름 & 연락처 -->
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="60" y="-1" font-size="17" font-weight="800" fill="#0f172a">최지현</text>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="390" y="-1" font-size="16" font-weight="800" fill="#0f172a" font-family="monospace">010-4567-8910</text>
          </g>

          <!-- 주소 (도로명) -->
          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#0f172a">서귀포시 안덕면 덕수남로 216</text>
          </g>

          <!-- 상세주소 (동/호수) -->
          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="145" y="-1" font-size="16" font-weight="800" fill="#0f172a">덕수빌리지 B동 102호</text>
          </g>

          <!-- 상품명 (수량) -->
          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#1d4ed8">깐마늘 3kg</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Cell 4: Bottom Right -->
    <g transform="translate(785, 575)">
      <rect width="720" height="395" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
      
      <!-- 보내는분 -->
      <g transform="translate(0, 0)">
        <path d="M0 16 Q0 0 16 0 L80 0 L80 90 L0 90 Z" fill="#e0f2fe"/>
        <text x="40" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0369a1">보내는분</text>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="720" y2="90" stroke="#93c5fd" stroke-width="1.5"/>

        <g transform="translate(95, 48)" font-size="14.5" font-weight="700" fill="#334155">
          <text x="0" y="0">이름 :</text>
          <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="60" y="-1" font-size="16" font-weight="800" fill="#0f172a">${fallbackSenderName}</text>
          
          <text x="310" y="0">연락처 :</text>
          <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="390" y="-1" font-size="15" font-weight="800" fill="#0f172a" font-family="monospace">${fallbackSenderPhone}</text>
        </g>
      </g>

      <!-- 받는분 -->
      <g transform="translate(0, 90)">
        <path d="M0 0 L80 0 L80 305 L16 305 Q0 305 0 289 Z" fill="#f0f9ff"/>
        <text x="40" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#1e40af">받는분</text>
        <line x1="80" y1="0" x2="80" y2="305" stroke="#bae6fd" stroke-width="1.5"/>

        <g transform="translate(95, 0)" font-size="14.5" font-weight="700" fill="#334155">
          <!-- 이름 & 연락처 -->
          <g transform="translate(0, 48)">
            <text x="0" y="0">이름 :</text>
            <line x1="45" y1="6" x2="280" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="60" y="-1" font-size="17" font-weight="800" fill="#0f172a">정우성</text>
            
            <text x="310" y="0">연락처 :</text>
            <line x1="375" y1="6" x2="605" y2="6" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="390" y="-1" font-size="16" font-weight="800" fill="#0f172a" font-family="monospace">010-5432-1098</text>
          </g>

          <!-- 주소 (도로명) -->
          <g transform="translate(0, 108)">
            <text x="0" y="0">주소 (도로명)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#0f172a">제주시 오라동 123-4</text>
          </g>

          <!-- 상세주소 (동/호수) -->
          <g transform="translate(0, 182)">
            <text x="0" y="0">상세주소 (동/호수)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="145" y="-1" font-size="16" font-weight="800" fill="#0f172a">오라힐스 301호</text>
          </g>

          <!-- 상품명 (수량) -->
          <g transform="translate(0, 256)">
            <text x="0" y="0">상품명 (수량)</text>
            <line x1="0" y1="28" x2="605" y2="28" stroke="#cbd5e1" stroke-width="1.2"/>
            <text x="115" y="-1" font-size="15" font-weight="800" fill="#1d4ed8">노지감귤 10kg</text>
          </g>
        </g>
      </g>
    </g>

    <!-- 3. Bottom Footer Banner -->
    <g transform="translate(480, 1000)">
      <rect width="580" height="42" rx="21" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2"/>
      
      <circle cx="35" cy="21" r="11" fill="#3b82f6"/>
      <path d="M29 19 Q35 24 41 19" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="18" r="1.5" fill="#ffffff"/>
      <circle cx="38" cy="18" r="1.5" fill="#ffffff"/>

      <text x="58" y="27" font-size="15" font-weight="800" fill="#1e40af">
        정확한 작성이 빠른 배송의 시작입니다. 감사합니다!
      </text>
    </g>
  </g>
</svg>
`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
