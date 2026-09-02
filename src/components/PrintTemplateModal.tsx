import React, { useState } from 'react';
import { X, Printer, Package, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { SenderProfile } from '../types';
import { downloadBlankA4TemplateImage } from '../data/sampleTemplates';

interface PrintTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: SenderProfile;
}

export const PrintTemplateModal: React.FC<PrintTemplateModalProps> = ({
  isOpen,
  onClose,
  sender,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadBlankA4TemplateImage();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">택배 접수 용지 인쇄 및 다운로드</h3>
              <p className="text-xs text-slate-500">
                A4 가로 1장에 4건씩 접수할 수 있는 표준 규격 용지입니다. 인쇄하거나 이미지 파일로 다운로드할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-modal-download-template"
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <Download className="w-4 h-4 text-blue-600" />
              )}
              <span>양식 다운로드 (PNG)</span>
            </button>

            <button
              id="btn-trigger-print"
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 가로 인쇄하기</span>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Form Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0">
          {/* A4 Landscape Paper Container */}
          <div className="max-w-[1020px] mx-auto bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-2 text-slate-900 space-y-4 print:space-y-3 font-sans">
            
            {/* Top Header Section */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Package className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    택배 접수 용지
                  </h1>
                </div>
                <div className="text-xs font-semibold text-slate-700 flex flex-wrap items-center gap-1.5">
                  <span className="text-blue-700 font-bold">★ 모든 항목을 정확하고 또박또박 작성해주세요.</span>
                  <span className="text-slate-500">이 용지를 스마트폰으로 촬영하면 AI가 자동으로 인식합니다.</span>
                </div>
              </div>

              {/* Guide Box (Top Right) */}
              <div className="border border-blue-400 rounded-xl bg-blue-50/40 p-3 text-xs shrink-0 shadow-2xs w-[340px]">
                <div className="font-extrabold text-blue-900 text-xs mb-2">
                  작성 가이드 <span className="font-medium text-[11px] text-blue-700">(OCR 인식률을 높이는 방법)</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-700 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>검정/파란색 펜 작성</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>숫자·연락처 정확히 작성</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>한 칸에 1줄로 작성</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>띄어쓰기 없이 또박또박</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>글씨 겹치지 않게 작성</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>수정 시 두 줄 긋고 재작성</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Grid Cells (2 Columns x 2 Rows) */}
            <div className="grid grid-cols-2 gap-4 print:gap-3">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className="border-2 border-blue-200 rounded-xl p-3.5 bg-white space-y-3 print:border-slate-800 shadow-2xs"
                >
                  {/* Section 1: 보내는 분 */}
                  <div className="rounded-lg bg-sky-50/70 border border-sky-200 overflow-hidden flex">
                    <div className="w-20 bg-sky-100/90 flex items-center justify-center text-center px-2 border-r border-sky-200">
                      <span className="text-xs font-black text-sky-900 leading-tight">
                        보내는분
                      </span>
                    </div>
                    <div className="flex-1 p-2.5 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 shrink-0">이름 :</span>
                          <div className="flex-1 border-b border-slate-300 h-4"></div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 shrink-0">연락처 :</span>
                          <div className="flex-1 border-b border-slate-300 h-4"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: 받는 분 */}
                  <div className="rounded-lg bg-slate-50/70 border border-slate-200 overflow-hidden flex">
                    <div className="w-20 bg-slate-100/90 flex items-center justify-center text-center px-2 border-r border-slate-200">
                      <span className="text-xs font-black text-blue-900 leading-tight">
                        받는분
                      </span>
                    </div>
                    <div className="flex-1 p-2.5 space-y-3 text-xs">
                      {/* 이름 & 연락처 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 shrink-0">이름 :</span>
                          <div className="flex-1 border-b border-slate-300 h-4"></div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 shrink-0">연락처 :</span>
                          <div className="flex-1 border-b border-slate-300 h-4"></div>
                        </div>
                      </div>

                      {/* 도로명 주소 */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600">주소 (도로명)</div>
                        <div className="w-full border-b border-slate-300 h-5"></div>
                      </div>

                      {/* 상세주소 */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600">상세주소 (동/호수)</div>
                        <div className="w-full border-b border-slate-300 h-5"></div>
                      </div>

                      {/* 상품명 (수량) */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600">상품명 (수량)</div>
                        <div className="w-full border-b border-slate-300 h-5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-2 text-center text-xs text-slate-600 flex items-center justify-center gap-2 font-semibold">
              <span className="text-blue-600">😊</span>
              <span>정확한 작성이 빠른 배송의 시작입니다. 감사합니다!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
