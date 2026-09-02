export type ItemStatus = 'VALID' | 'NEEDS_REVIEW' | 'ERROR';

export interface ParcelItem {
  id: string;
  cellNumber?: number;
  recipientName: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  itemName: string;
  quantity: number;
  memo: string;
  status: ItemStatus;
  validationNotes?: string;
  senderName?: string;
  senderPhone?: string;
  senderAddress?: string;
  selected?: boolean;
}

export type CourierType = 'cj' | 'lotte' | 'hanjin' | 'post' | 'logen' | 'standard';

export interface CourierConfig {
  id: CourierType;
  name: string;
  code: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  headers: string[];
}

export interface BatchRecord {
  id: string;
  title: string;
  createdAt: string;
  itemCount: number;
  boxCount: number;
  warningCount: number;
  errorCount: number;
  status: 'completed' | 'draft' | 'exported';
  courier: CourierType;
  items: ParcelItem[];
  imageUrl?: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  defaultItem?: string;
  memo?: string;
  orderCount: number;
  lastOrderedAt: string;
}

export interface SenderProfile {
  name: string;
  phone: string;
  tel?: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  defaultItem: string;
  defaultCourier: CourierType;
  defaultMemo: string;
}

export interface DaumAddressData {
  zonecode: string;
  address: string;
  addressType: 'R' | 'J';
  bname: string;
  buildingName: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: 'R' | 'J';
}
