import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Check, 
  Eye, 
  Building2,
  FileType,
  Sparkles
} from 'lucide-react';
import { ParcelItem, CourierType, SenderProfile } from '../types';
import { COURIER_CONFIGS, formatDataForCourier, exportToExcel, exportToCsv } from '../utils/excelExporter';
import { NaverShoppingBanner } from './NaverShoppingBanner';
import { AdBanner } from './AdBanner';

interface ExcelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ParcelItem[];
  sender: SenderProfile;
  initialCourier?: CourierType;
}

export const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  isOpen,
  onClose,
  items,
  sender,
  initialCourier = 'cj',
}) => {
  if (!isOpen) return null;

  const [selectedCourier, setSelectedCourier] = useState<CourierType>(initialCourier);
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const { headers, rows } = formatDataForCourier(items, selectedCourier, sender);
  const currentConfig = COURIER_CONFIGS[selectedCourier];

  const handleDownload = () => {
    if (fileFormat === 'xlsx') {
      exportToExcel(items, selectedCourier, sender);
    } else {
      exportToCsv(items, selectedCourier, sender);
    }
  };

  // Convert column index to Excel column letter (0->A, 1->B, ...)
  const getColLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">택배사 양식 엑셀 실시간 미리보기</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  총 {items.length}건
                </span>
              </div>
              <p className="text-xs text-slate-500">
                택배사별 전용 대량 접수 양식으로 정렬된 엑셀 데이터를 확인하고 다운로드하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Courier Selector Tabs & Download Controls */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Courier Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(Object.keys(COURIER_CONFIGS) as CourierType[]).map((cKey) => {
              const cfg = COURIER_CONFIGS[cKey];
              const isSelected = selectedCourier === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedCourier(cKey)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Format & Download button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFileFormat('xlsx')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  fileFormat === 'xlsx' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                .XLSX (엑셀)
              </button>
              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  fileFormat === 'csv' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                .CSV (텍스트)
              </button>
            </div>

            <button
              id="btn-confirm-excel-download"
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{currentConfig.name} {fileFormat.toUpperCase()} 다운로드</span>
            </button>
          </div>
        </div>

        {/* Courier Spec Info Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded font-bold border ${currentConfig.badgeBg}`}>
              {currentConfig.code}
            </span>
            <span className="font-semibold text-slate-800">{currentConfig.description}</span>
          </div>
          <div className="text-slate-400 font-mono">
            총 {headers.length}개 열 | {rows.length}개 행
          </div>
        </div>

        {/* Spreadsheet Table Preview */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/70">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              {/* Excel Column Letters (A, B, C, ...) */}
              <thead>
                <tr className="bg-slate-200/70 text-slate-600 text-[11px] select-none">
                  <th className="w-10 px-2 py-1.5 border border-slate-300 bg-slate-200 text-center font-bold">
                    #
                  </th>
                  {headers.map((_, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-1.5 border border-slate-300 text-center font-bold text-slate-700"
                    >
                      {getColLetter(idx)}
                    </th>
                  ))}
                </tr>

                {/* Header Row (Row 1) */}
                <tr className="bg-blue-50/80 text-blue-950 font-bold">
                  <th className="px-2 py-2 border border-slate-300 bg-slate-200/90 text-center text-slate-600">
                    1
                  </th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-2 border border-slate-300 whitespace-nowrap text-left text-blue-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Data Rows (Row 2, 3, 4, ...) */}
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-2 py-2 border border-slate-300 bg-slate-100 text-center text-slate-500 font-bold select-none">
                      {rIdx + 2}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3 py-2 border border-slate-300 whitespace-nowrap text-slate-800 font-sans"
                      >
                        {String(cell ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Packing Supplies Recommendation */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
            <NaverShoppingBanner variant="compact" />
            <AdBanner className="my-0 py-2.5 min-h-[70px] bg-white border-slate-200 text-[10px]" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            * 엑셀 파일 다운로드 후 해당 택배사 프로그램(CNPlus, ALPS 등)에서 바로 업로드하실 수 있습니다.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
