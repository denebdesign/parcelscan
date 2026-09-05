import * as XLSX from 'xlsx';
import { ParcelItem, CourierType, CourierConfig, SenderProfile, UserExcelTemplate, CustomFieldKey } from '../types';

export const USER_EXCEL_TEMPLATE_STORAGE_KEY = 'parcelscan_user_custom_template_v2';

export const DEFAULT_USER_EXCEL_TEMPLATE: UserExcelTemplate = {
  name: '나만의 맞춤 양식',
  addressMerge: true, // 기본: 주소 한 칸으로 합치기
  fields: [
    { id: 'f-1', fieldKey: 'recipientName', label: '받는분성명', enabled: true },
    { id: 'f-2', fieldKey: 'phone', label: '전화번호', enabled: true },
    { id: 'f-3', fieldKey: 'zipCode', label: '우편번호', enabled: true },
    { id: 'f-4', fieldKey: 'fullAddress', label: '받는분주소(전체)', enabled: true },
    { id: 'f-5', fieldKey: 'itemName', label: '품목명', enabled: true },
    { id: 'f-6', fieldKey: 'quantity', label: '수량', enabled: true },
    { id: 'f-7', fieldKey: 'memo', label: '배송요청사항', enabled: true },
    { id: 'f-8', fieldKey: 'paymentType', label: '운임구분', enabled: true, defaultValue: '신용' },
    { id: 'f-9', fieldKey: 'senderName', label: '보내는분', enabled: true },
    { id: 'f-10', fieldKey: 'senderPhone', label: '보내는분전화번호', enabled: true },
    { id: 'f-11', fieldKey: 'address', label: '기본주소(도로명)', enabled: false },
    { id: 'f-12', fieldKey: 'detailAddress', label: '상세주소', enabled: false },
    { id: 'f-13', fieldKey: 'phone2', label: '기타연락처', enabled: false },
    { id: 'f-14', fieldKey: 'senderAddress', label: '보내는분주소', enabled: false },
    { id: 'f-15', fieldKey: 'index', label: '순번', enabled: false },
  ],
};

export function loadUserExcelTemplate(): UserExcelTemplate {
  try {
    const raw = localStorage.getItem(USER_EXCEL_TEMPLATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.fields)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load user custom excel template', e);
  }
  return DEFAULT_USER_EXCEL_TEMPLATE;
}

export function saveUserExcelTemplate(tmpl: UserExcelTemplate): void {
  try {
    localStorage.setItem(USER_EXCEL_TEMPLATE_STORAGE_KEY, JSON.stringify(tmpl));
  } catch (e) {
    console.error('Failed to save user custom excel template', e);
  }
}

export const COURIER_CONFIGS: Record<CourierType, CourierConfig> = {
  cj: {
    id: 'cj',
    name: 'CJ대한통운',
    code: 'CJ',
    color: 'border-blue-500 text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'CJ대한통운 표준양식',
    description: 'CJ대한통운 CNPlus/LoIS 포털 대량 접수 표준 엑셀',
    headers: [
      '받는분성명',
      '받는분전화번호',
      '받는분기타연락처',
      '우편번호',
      '받는분주소(기본)',
      '받는분주소(상세)',
      '품목명',
      '박스수량',
      '배송메세지',
      '운임구분',
      '보내는분성명',
      '보내는분전화번호',
      '보내는분주소',
    ],
  },
  lotte: {
    id: 'lotte',
    name: '롯데택배',
    code: 'LOTTE',
    color: 'border-red-500 text-red-600',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    badgeText: '롯데택배 표준양식',
    description: '롯데택배 ALPS 접수용 표준 엑셀 템플릿',
    headers: [
      '수하인명',
      '수하인전화번호',
      '수하인휴대폰번호',
      '우편번호',
      '수하인주소(기본)',
      '수하인주소(상세)',
      '품목명',
      '수량',
      '배송요청사항',
      '송하인명',
      '송하인전화번호',
      '송하인주소',
    ],
  },
  hanjin: {
    id: 'hanjin',
    name: '한진택배',
    code: 'HANJIN',
    color: 'border-amber-500 text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: '한진택배 표준양식',
    description: '한진택배 포털 일괄 접수용 엑셀',
    headers: [
      '받는분성명',
      '받는분전화번호1',
      '받는분전화번호2',
      '우편번호',
      '받는분기본주소',
      '받는분상세주소',
      '상품명',
      '수량',
      '배송메모',
      '보내는분성명',
      '보내는분연락처',
    ],
  },
  post: {
    id: 'post',
    name: '우체국택배',
    code: 'EPOST',
    color: 'border-orange-500 text-orange-600',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: '우체국택배 표준양식',
    description: '인터넷우체국 e-Post 다량배송 엑셀 양식',
    headers: [
      '받는분',
      '받는분전화번호',
      '받는분핸드폰',
      '우편번호',
      '주소',
      '상세주소',
      '상품명',
      '수량',
      '배달요구사항',
      '보내는분',
      '보내는분전화번호',
    ],
  },
  logen: {
    id: 'logen',
    name: '로젠택배',
    code: 'LOGEN',
    color: 'border-yellow-600 text-yellow-700',
    badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    badgeText: '로젠택배 표준양식',
    description: '로젠택배 iLogen 연동 엑셀 양식',
    headers: [
      '수하인명',
      '수하인전화1',
      '수하인전화2',
      '우편번호',
      '기본주소',
      '상세주소',
      '품목명',
      '수량',
      '배달메세지',
      '송하인명',
      '송하인전화',
    ],
  },
  standard: {
    id: 'standard',
    name: '통합 표준 양식',
    code: 'ALL',
    color: 'border-indigo-500 text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: '범용 통합 양식',
    description: '모든 택배사 및 내부 관리용 종합 엑셀 양식',
    headers: [
      '순번',
      '받는분',
      '연락처',
      '우편번호',
      '기본주소',
      '상세주소',
      '전체주소',
      '상품명',
      '수량(박스)',
      '배송메모',
      '상태',
      '보내는분',
      '보내는분연락처',
    ],
  },
  custom: {
    id: 'custom',
    name: '★ 내 맞춤 양식',
    code: 'CUSTOM',
    color: 'border-amber-500 text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    badgeText: '★ 맞춤 엑셀',
    description: '내가 직접 설정한 컬럼 순서 및 이름으로 출력되는 전용 엑셀 양식',
    headers: [], // dynamic from template
  },
};

/**
 * Format parcel items into courier-specific 2D data arrays
 */
export function formatDataForCourier(
  items: ParcelItem[],
  courier: CourierType,
  sender: SenderProfile
): { headers: string[]; rows: (string | number)[][] } {
  if (courier === 'custom') {
    const tmpl = loadUserExcelTemplate();
    const activeFields = tmpl.fields.filter((f) => f.enabled);
    const headers = activeFields.map((f) => f.label || '항목');

    const rows = items.map((item, index) => {
      const sName = item.senderName || sender.name || '농원/발송처';
      const sPhone = item.senderPhone || sender.phone || '010-0000-0000';
      const sAddress = item.senderAddress || `${sender.address} ${sender.detailAddress}`.trim() || '발송지 주소';
      const fullAddress = `${item.address} ${item.detailAddress}`.trim();

      return activeFields.map((field) => {
        switch (field.fieldKey) {
          case 'index':
            return index + 1;
          case 'recipientName':
            return item.recipientName || '';
          case 'phone':
            return item.phone || '';
          case 'phone2':
            return item.phone || '';
          case 'zipCode':
            return item.zipCode || '63047';
          case 'address':
            return item.address || '';
          case 'detailAddress':
            return item.detailAddress || '';
          case 'fullAddress':
            return fullAddress;
          case 'itemName':
            return item.itemName || sender.defaultItem || '택배상품';
          case 'quantity':
            return item.quantity || 1;
          case 'memo':
            return item.memo || '';
          case 'paymentType':
            return field.defaultValue || '신용';
          case 'senderName':
            return sName;
          case 'senderPhone':
            return sPhone;
          case 'senderAddress':
            return sAddress;
          case 'customNote':
            return field.defaultValue || '';
          default:
            return '';
        }
      });
    });

    return { headers, rows };
  }

  const config = COURIER_CONFIGS[courier] || COURIER_CONFIGS.cj;
  const headers = config.headers;

  const rows = items.map((item, index) => {
    const sName = item.senderName || sender.name || '농원/발송처';
    const sPhone = item.senderPhone || sender.phone || '010-0000-0000';
    const sAddress = item.senderAddress || `${sender.address} ${sender.detailAddress}`.trim() || '발송지 주소';
    const fullAddress = `${item.address} ${item.detailAddress}`.trim();

    switch (courier) {
      case 'cj':
        return [
          item.recipientName,
          item.phone,
          item.phone,
          item.zipCode || '63047',
          item.address,
          item.detailAddress,
          item.itemName || sender.defaultItem || '과일/농산물',
          item.quantity || 1,
          item.memo || '문 앞 배송',
          '신용',
          sName,
          sPhone,
          sAddress,
        ];
      case 'lotte':
        return [
          item.recipientName,
          item.phone,
          item.phone,
          item.zipCode || '63047',
          item.address,
          item.detailAddress,
          item.itemName || sender.defaultItem || '과일/농산물',
          item.quantity || 1,
          item.memo || '부재시 경비실',
          sName,
          sPhone,
          sAddress,
        ];
      case 'hanjin':
        return [
          item.recipientName,
          item.phone,
          item.phone,
          item.zipCode || '63047',
          item.address,
          item.detailAddress,
          item.itemName || sender.defaultItem || '농산물',
          item.quantity || 1,
          item.memo || '배송 전 연락바랍니다',
          sName,
          sPhone,
        ];
      case 'post':
        return [
          item.recipientName,
          item.phone,
          item.phone,
          item.zipCode || '63047',
          item.address,
          item.detailAddress,
          item.itemName || sender.defaultItem || '우체국소포',
          item.quantity || 1,
          item.memo || '안전배송 부탁드립니다',
          sName,
          sPhone,
        ];
      case 'logen':
        return [
          item.recipientName,
          item.phone,
          item.phone,
          item.zipCode || '63047',
          item.address,
          item.detailAddress,
          item.itemName || sender.defaultItem || '택배물품',
          item.quantity || 1,
          item.memo || '문 앞',
          sName,
          sPhone,
        ];
      case 'standard':
      default:
        return [
          index + 1,
          item.recipientName,
          item.phone,
          item.zipCode || '63047',
          item.address,
          item.detailAddress,
          fullAddress,
          item.itemName || sender.defaultItem || '택배상품',
          item.quantity || 1,
          item.memo || '',
          item.status === 'VALID' ? '정상' : item.status === 'NEEDS_REVIEW' ? '확인필요' : '오류',
          sName,
          sPhone,
        ];
    }
  });

  return { headers, rows };
}

/**
 * Export parcel items to an Excel (.xlsx) file and trigger browser download
 */
export function exportToExcel(
  items: ParcelItem[],
  courier: CourierType,
  sender: SenderProfile,
  customFileName?: string
) {
  const { headers, rows } = formatDataForCourier(items, courier, sender);
  const data = [headers, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set nice column widths
  const colWidths = headers.map((header) => {
    if (header.includes('주소') || header.includes('배송')) return { wch: 32 };
    if (header.includes('전화') || header.includes('연락처')) return { wch: 16 };
    if (header.includes('성명') || header.includes('수하인') || header.includes('받는분')) return { wch: 14 };
    if (header.includes('품목') || header.includes('상품')) return { wch: 18 };
    if (header.includes('우편')) return { wch: 10 };
    return { wch: 12 };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = COURIER_CONFIGS[courier]?.name || '택배접수목록';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = customFileName || `택배접수_${COURIER_CONFIGS[courier]?.name}_${today}_${items.length}건.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

/**
 * Export parcel items to a CSV file and trigger browser download
 */
export function exportToCsv(
  items: ParcelItem[],
  courier: CourierType,
  sender: SenderProfile,
  customFileName?: string
) {
  const { headers, rows } = formatDataForCourier(items, courier, sender);
  const data = [headers, ...rows];

  // Convert array of rows to CSV string with BOM for Excel Korean UTF-8 compatibility
  const csvContent =
    '\uFEFF' +
    data
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  link.setAttribute('href', url);
  link.setAttribute('download', customFileName || `택배접수_${COURIER_CONFIGS[courier]?.name}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
