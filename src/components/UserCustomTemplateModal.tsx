import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Layers,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { UserExcelTemplate, CustomFieldSetting, CustomFieldKey } from '../types';
import { 
  loadUserExcelTemplate, 
  saveUserExcelTemplate, 
  DEFAULT_USER_EXCEL_TEMPLATE 
} from '../utils/excelExporter';

interface UserCustomTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const FIELD_DESC_MAP: Record<CustomFieldKey, string> = {
  index: '1, 2, 3... 번호',
  recipientName: '받는 분 성명/상호',
  phone: '받는 분 휴대폰 번호',
  phone2: '추가 또는 일반 전화',
  zipCode: '5자리 새 우편번호',
  address: '기본 도로명/지번 주소',
  detailAddress: '동, 호수, 건물 상세주소',
  fullAddress: '기본주소와 상세주소를 한 칸으로 합침',
  itemName: '과일, 농산물 등 발송 품목',
  quantity: '박스 수량',
  memo: '문 앞, 경비실 등 배송메모',
  paymentType: '신용, 선불, 착불 등',
  senderName: '보내는 분 성명/농가명',
  senderPhone: '보내는 분 전화번호',
  senderAddress: '보내는 분 전체 주소',
  customNote: '고정으로 들어갈 문구',
};

export const UserCustomTemplateModal: React.FC<UserCustomTemplateModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [template, setTemplate] = useState<UserExcelTemplate>(DEFAULT_USER_EXCEL_TEMPLATE);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTemplate(loadUserExcelTemplate());
      setShowSavedToast(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Move field up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const nextFields = [...template.fields];
    const temp = nextFields[index - 1];
    nextFields[index - 1] = nextFields[index];
    nextFields[index] = temp;
    setTemplate({ ...template, fields: nextFields });
  };

  // Move field down
  const handleMoveDown = (index: number) => {
    if (index === template.fields.length - 1) return;
    const nextFields = [...template.fields];
    const temp = nextFields[index + 1];
    nextFields[index + 1] = nextFields[index];
    nextFields[index] = temp;
    setTemplate({ ...template, fields: nextFields });
  };

  // Toggle field enable
  const handleToggle = (id: string) => {
    const nextFields = template.fields.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    setTemplate({ ...template, fields: nextFields });
  };

  // Change custom label
  const handleLabelChange = (id: string, newLabel: string) => {
    const nextFields = template.fields.map((f) =>
      f.id === id ? { ...f, label: newLabel } : f
    );
    setTemplate({ ...template, fields: nextFields });
  };

  // Change default value
  const handleDefaultValueChange = (id: string, val: string) => {
    const nextFields = template.fields.map((f) =>
      f.id === id ? { ...f, defaultValue: val } : f
    );
    setTemplate({ ...template, fields: nextFields });
  };

  // Address mode switch: merged vs split
  const handleAddressMode = (merge: boolean) => {
    const nextFields = template.fields.map((f) => {
      if (merge) {
        if (f.fieldKey === 'fullAddress') return { ...f, enabled: true };
        if (f.fieldKey === 'address' || f.fieldKey === 'detailAddress') return { ...f, enabled: false };
      } else {
        if (f.fieldKey === 'fullAddress') return { ...f, enabled: false };
        if (f.fieldKey === 'address' || f.fieldKey === 'detailAddress') return { ...f, enabled: true };
      }
      return f;
    });
    setTemplate({ ...template, addressMerge: merge, fields: nextFields });
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('기본 추천 양식으로 초기화하시겠습니까?')) {
      setTemplate(DEFAULT_USER_EXCEL_TEMPLATE);
    }
  };

  // Save
  const handleSave = () => {
    saveUserExcelTemplate(template);
    setShowSavedToast(true);
    onSaved();
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 500);
  };

  const enabledCount = template.fields.filter((f) => f.enabled).length;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  나만의 엑셀 양식 맞춤 설정
                </h3>
                <span className="text-[11px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  자동 영구 저장
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                원하는 열만 켜고 끄거나, 순서와 엑셀 제목을 직접 수정할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Preset: 주소 형태 원클릭 설정 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                주소 표기 형태 선택
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                사용 중인 택배 프로그램 규격에 맞춰 주소를 한 칸으로 합치거나 두 칸으로 나눕니다.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleAddressMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  template.addressMerge
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                한 칸으로 합치기 (기본+상세)
              </button>
              <button
                type="button"
                onClick={() => handleAddressMode(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  !template.addressMerge
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                두 칸으로 분리 (도로명 / 상세)
              </button>
            </div>
          </div>

          {/* Column list editor */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                열 순서 및 헤더 제목 편집 (총 {enabledCount}개 열 출력)
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                기본값 복원
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-bold text-slate-600 text-center">
                <div className="col-span-1">사용</div>
                <div className="col-span-3 text-left">항목</div>
                <div className="col-span-5 text-left">엑셀 헤더 제목 (직접 수정 가능)</div>
                <div className="col-span-3">순서 변경</div>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs bg-white">
                {template.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`px-4 py-2.5 grid grid-cols-12 gap-2 items-center transition-colors ${
                      field.enabled ? 'bg-white hover:bg-amber-50/30' : 'bg-slate-50/60 opacity-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1 text-center">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={() => handleToggle(field.id)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                    </div>

                    {/* Field info */}
                    <div className="col-span-3 text-left">
                      <span className={`font-bold text-xs ${field.enabled ? 'text-slate-800' : 'text-slate-400'}`}>
                        {field.label}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate">
                        {FIELD_DESC_MAP[field.fieldKey]}
                      </p>
                    </div>

                    {/* Custom Header Input */}
                    <div className="col-span-5 text-left">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleLabelChange(field.id, e.target.value)}
                        disabled={!field.enabled}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                        placeholder="엑셀에 찍힐 열 이름"
                      />
                    </div>

                    {/* Move Up/Down buttons */}
                    <div className="col-span-3 flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                        title="위로 이동"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === template.fields.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                        title="아래로 이동"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                성공적으로 저장되었습니다!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>맞춤 양식 저장 & 즉시 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
