import React, { useState } from 'react';
import { 
  History, 
  Search, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Package, 
  Boxes,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { BatchRecord, CourierType, SenderProfile } from '../types';
import { COURIER_CONFIGS, exportToExcel } from '../utils/excelExporter';

interface BatchHistoryViewProps {
  batches: BatchRecord[];
  sender: SenderProfile;
  onViewBatch: (batch: BatchRecord) => void;
  onDeleteBatch: (id: string) => void;
  onStartNewScan: () => void;
  onUpdateBatchCourier?: (batchId: string, courier: CourierType) => void;
}

export const BatchHistoryView: React.FC<BatchHistoryViewProps> = ({
  batches,
  sender,
  onViewBatch,
  onDeleteBatch,
  onStartNewScan,
  onUpdateBatchCourier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = batches.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.items.some((item) =>
        item.recipientName.includes(searchTerm) || item.phone.includes(searchTerm)
      )
  );

  const handleExport = (batch: BatchRecord, courier?: CourierType) => {
    const targetCourier = courier || batch.courier || sender.defaultCourier || 'cj';
    exportToExcel(batch.items, targetCourier, sender, `${batch.title}_${COURIER_CONFIGS[targetCourier].name}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">택배 접수 이력 보관함</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              총 {batches.length}회차
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            과거 사진으로 인식했던 모든 송장 데이터를 열람하고 원하는 택배사 양식으로 언제든 다시 다운로드할 수 있습니다.
          </p>
        </div>

        <button
          onClick={onStartNewScan}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span>+ 새 접수하기</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="접수 제목, 수취인 성명, 연락처 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Batches Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          일치하는 접수 이력이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((batch) => {
            const courierCfg = COURIER_CONFIGS[batch.courier] || COURIER_CONFIGS.cj;
            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="relative inline-block mb-1.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          id={`hist-courier-${batch.id}`}
                          value={batch.courier || sender.defaultCourier || 'cj'}
                          onChange={(e) => onUpdateBatchCourier?.(batch.id, e.target.value as CourierType)}
                          className={`appearance-none pl-2.5 pr-6 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${courierCfg.badgeBg} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                          title="택배사 양식 변경"
                        >
                          {Object.values(COURIER_CONFIGS).map((c) => (
                            <option key={c.id} value={c.id} className="bg-white text-slate-800">
                              {c.name} 양식
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {batch.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{batch.createdAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteBatch(batch.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="이력 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="bg-slate-50 rounded-xl p-2">
                      <div className="text-slate-500 text-[11px]">수취인 건수</div>
                      <div className="font-bold text-slate-900 mt-0.5">{batch.itemCount}건</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <div className="text-slate-500 text-[11px]">총 수량</div>
                      <div className="font-bold text-indigo-700 mt-0.5">{batch.boxCount}박스</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <div className="text-slate-500 text-[11px]">확인 필요</div>
                      <div className={`font-bold mt-0.5 ${batch.warningCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {batch.warningCount}건
                      </div>
                    </div>
                  </div>

                  {/* Preview of Recipients */}
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-700">배송 명단 미리보기:</div>
                    <div className="text-[11px] text-slate-500 bg-slate-50/70 p-2 rounded-lg truncate">
                      {batch.items.map((i) => `${i.recipientName}(${i.itemName || '상품'})`).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewBatch(batch)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>데이터 확인·수정</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExport(batch)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>엑셀 다운로드</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
