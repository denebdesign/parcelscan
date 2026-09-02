import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  MapPin, 
  Package, 
  Boxes,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ParcelItem, CustomerContact } from '../types';

interface EditItemModalProps {
  isOpen: boolean;
  item: ParcelItem | null;
  onClose: () => void;
  onSave: (updatedItem: ParcelItem) => void;
  onDelete: (itemId: string) => void;
  customers: CustomerContact[];
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (config: {
        oncomplete: (data: any) => void;
        onclose?: () => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onDelete,
  customers,
}) => {
  if (!isOpen || !item) return null;

  const [formData, setFormData] = useState<ParcelItem>({ ...item });
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerContact | null>(null);

  useEffect(() => {
    setFormData({ ...item });
    // Check if matches any existing customer in book
    const match = customers.find(
      (c) =>
        c.name === item.recipientName ||
        (item.phone && c.phone.replace(/[^0-9]/g, '') === item.phone.replace(/[^0-9]/g, ''))
    );
    setMatchedCustomer(match || null);
  }, [item, customers]);

  // Open Daum Postcode Search Popup
  const handleOpenDaumPostcode = () => {
    if (typeof window.daum === 'undefined' || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        // Retrieve road address or jibun address
        const fullRoadAddr = data.roadAddress || data.jibunAddress;
        let extraAddr = '';

        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr += extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
        }
        if (extraAddr !== '') {
          extraAddr = ` (${extraAddr})`;
        }

        setFormData((prev) => ({
          ...prev,
          address: fullRoadAddr + extraAddr,
          zipCode: data.zonecode || prev.zipCode,
          status: 'VALID',
          validationNotes: '우편번호 및 도로명 주소 정제 완료',
        }));
      },
    }).open();
  };

  // Auto format phone number
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    let formatted = val;
    if (raw.length === 11) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    } else if (raw.length === 10) {
      if (raw.startsWith('02')) {
        formatted = `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6)}`;
      } else {
        formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
      }
    }
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  // Apply matched customer details
  const applyCustomer = (cust: CustomerContact) => {
    setFormData((prev) => ({
      ...prev,
      recipientName: cust.name,
      phone: cust.phone,
      address: cust.address,
      detailAddress: cust.detailAddress,
      zipCode: cust.zipCode || prev.zipCode,
      status: 'VALID',
      validationNotes: `단골 고객(${cust.name}) 정보 적용`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {formData.cellNumber || '#'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">택배 배송 정보 확인 및 수정</h3>
              <p className="text-xs text-slate-500">
                수취인 정보와 도로명 주소를 정밀하게 검증합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matched Customer Alert */}
        {matchedCustomer && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-blue-900">{matchedCustomer.name}</span>
                <span className="text-blue-700 ml-1">고객님의 저장된 주소록이 있습니다.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => applyCustomer(matchedCustomer)}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shrink-0"
            >
              주소 불러오기
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Status & Validation Message */}
          {formData.validationNotes && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                formData.status === 'VALID'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : formData.status === 'NEEDS_REVIEW'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {formData.status === 'VALID' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold">AI 검증 안내:</span> {formData.validationNotes}
              </div>
            </div>
          )}

          {/* Row 1: Recipient Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                받는분 (수취인명) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="예: 김철수"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                연락처 (휴대폰) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="예: 010-1234-5678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Row 2: Address with Daum Postcode Search */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                주소 (도로명 또는 지번) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleOpenDaumPostcode}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
              >
                <Search className="w-3 h-3" />
                우편번호·주소검색
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="예: 제주시 구좌읍 세화로 123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={handleOpenDaumPostcode}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold shrink-0 transition-colors"
              >
                검색
              </button>
            </div>
          </div>

          {/* Row 3: Detail Address & Zip Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                상세주소 (동/호수, 건물명)
              </label>
              <input
                type="text"
                value={formData.detailAddress}
                onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                placeholder="예: 101동 1204호"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">우편번호</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="63047"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-center"
              />
            </div>
          </div>

          {/* Row 4: Item Name & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">상품명 (품목)</label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="예: 제주 햇감자 10kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">수량 (박스)</label>
              <input
                type="number"
                min="1"
                max="999"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold text-center"
              />
            </div>
          </div>

          {/* Row 5: Delivery Memo / Request */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">배송 요청사항 (메모)</label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="예: 문 앞 보관, 부재시 경비실, 배송 전 연락"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">검증 상태 지정</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'VALID', validationNotes: '사용자 직접 확인 완료' })}
                className={`flex-1 py-1.5 rounded-lg border font-bold text-xs transition-colors flex items-center justify-center gap-1 ${
                  formData.status === 'VALID'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                정상 (확인완료)
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'NEEDS_REVIEW' })}
                className={`flex-1 py-1.5 rounded-lg border font-bold text-xs transition-colors flex items-center justify-center gap-1 ${
                  formData.status === 'NEEDS_REVIEW'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                수정 필요
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                취소
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
