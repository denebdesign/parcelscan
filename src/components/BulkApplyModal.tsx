import React, { useState } from 'react';
import { X, Layers, CheckSquare, Sparkles } from 'lucide-react';

interface BulkApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onApply: (data: {
    itemName?: string;
    quantity?: number;
    memo?: string;
    overrideItemName: boolean;
    overrideQuantity: boolean;
    overrideMemo: boolean;
  }) => void;
  defaultItemName?: string;
}

export const BulkApplyModal: React.FC<BulkApplyModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onApply,
  defaultItemName = '감자',
}) => {
  if (!isOpen) return null;

  const [itemName, setItemName] = useState(defaultItemName);
  const [quantity, setQuantity] = useState<number>(1);
  const [memo, setMemo] = useState('문 앞 배송');

  const [applyItemName, setApplyItemName] = useState(true);
  const [applyQuantity, setApplyQuantity] = useState(true);
  const [applyMemo, setApplyMemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      itemName: applyItemName ? itemName : undefined,
      quantity: applyQuantity ? quantity : undefined,
      memo: applyMemo ? memo : undefined,
      overrideItemName: applyItemName,
      overrideQuantity: applyQuantity,
      overrideMemo: applyMemo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">대량 일괄 적용</h3>
              <p className="text-xs text-slate-500">
                선택한 <strong className="text-blue-600">{selectedCount}건</strong>에 동일한 정보를 일괄 입력합니다.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Item Name */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyItemName}
                  onChange={(e) => setApplyItemName(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>상품명 일괄 적용</span>
              </label>
            </div>
            {applyItemName && (
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="예: 제주 햇감자 10kg"
                className="w-full mt-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyQuantity}
                  onChange={(e) => setApplyQuantity(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>수량 (박스) 일괄 적용</span>
              </label>
            </div>
            {applyQuantity && (
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                />
                <span className="text-slate-600 font-semibold">박스</span>
              </div>
            )}
          </div>

          {/* Delivery Memo */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyMemo}
                  onChange={(e) => setApplyMemo(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>배송메모(요청사항) 일괄 적용</span>
              </label>
            </div>
            {applyMemo && (
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 문 앞 보관, 부재시 경비실"
                className="w-full mt-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedCount}건에 적용하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
