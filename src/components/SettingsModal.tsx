import React, { useState } from 'react';
import { X, Store, Save, Building2, Phone, MapPin, Package, Check } from 'lucide-react';
import { SenderProfile, CourierType } from '../types';
import { COURIER_CONFIGS } from '../utils/excelExporter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: SenderProfile;
  onSaveSender: (profile: SenderProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sender,
  onSaveSender,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = React.useState<SenderProfile>({ ...sender });

  React.useEffect(() => {
    setFormData({ ...sender });
  }, [sender, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSender(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">취급점 설정</h3>
              <p className="text-xs text-slate-500">
                A4 접수 양식 및 택배사 엑셀 파일에 적용될 취급점(보내는 분) 정보입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Sender / Store Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              취급점 상호명 또는 대표자 성함 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 제주바람농원 (김대표)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Sender Phones */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                취급점 대표 연락처 (휴대폰) *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">일반 전화번호</label>
              <input
                type="text"
                value={formData.tel || ''}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                placeholder="064-000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Sender Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              취급점 도로명 주소 (보내는 곳) *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="예: 제주특별자치도 제주시 구좌읍 세화리 1234"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">상세 주소 (건물/층수)</label>
              <input
                type="text"
                value={formData.detailAddress}
                onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                placeholder="농산물 유통센터 1층"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">우편번호</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="63357"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-center focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Defaults */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">기본 취급 품목 (상품명)</label>
              <input
                type="text"
                value={formData.defaultItem}
                onChange={(e) => setFormData({ ...formData, defaultItem: e.target.value })}
                placeholder="예: 햇감자 10kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">기본 이용 택배사</label>
              <select
                value={formData.defaultCourier}
                onChange={(e) => setFormData({ ...formData, defaultCourier: e.target.value as CourierType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {Object.values(COURIER_CONFIGS).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>취급점 정보 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
