import React from 'react';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Package, 
  Boxes, 
  AlertCircle, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Printer,
  ChevronRight,
  TrendingUp,
  Download,
  ChevronDown
} from 'lucide-react';
import { BatchRecord, CourierType } from '../types';
import { COURIER_CONFIGS } from '../utils/excelExporter';

interface DashboardViewProps {
  onStartNewScan: () => void;
  onOpenSampleScan: () => void;
  onViewBatch: (batch: BatchRecord) => void;
  onQuickExport: (batch: BatchRecord, courier?: CourierType) => void;
  onUpdateBatchCourier?: (batchId: string, courier: CourierType) => void;
  batches: BatchRecord[];
  sender?: { name: string; defaultCourier?: CourierType };
  userProfile?: { name: string; businessName?: string };
  todayStats: {
    totalItems: number;
    totalBoxes: number;
    warningCount: number;
    errorCount: number;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartNewScan,
  onOpenSampleScan,
  onViewBatch,
  onQuickExport,
  onUpdateBatchCourier,
  batches,
  sender,
  userProfile,
  todayStats,
}) => {
  const currentDisplayName = sender?.name || userProfile?.businessName || userProfile?.name || '내 취급점';
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Hero Process Banner matching Blueprint (1. 시스템 전체 흐름) */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Package className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI 기반 택배 송장 전산화 솔루션</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            종이에 적힌 손글씨 주소, 사진 1장으로 택배사 엑셀까지 완성
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            주소 용지나 주문서를 스마트폰/PC로 촬영하면, AI가 성명·연락처·도로명 주소·수량을 
            자동 추출하여 CJ대한통운·롯데·한진·우체국 표준 엑셀 양식으로 즉시 변환합니다.
          </p>

          {/* 5-Step System Flow Blueprint */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold">1단계</div>
              <div className="font-bold text-xs mt-0.5 flex items-center justify-center gap-1">
                <Camera className="w-3.5 h-3.5 text-yellow-300" />
                종이 촬영
              </div>
              <div className="text-[10px] text-blue-200/80 mt-0.5">A4 용지/업로드</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold">2단계</div>
              <div className="font-bold text-xs mt-0.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                AI 인식
              </div>
              <div className="text-[10px] text-blue-200/80 mt-0.5">이름/전화/주소 추출</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold">3단계</div>
              <div className="font-bold text-xs mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                데이터 검증
              </div>
              <div className="text-[10px] text-blue-200/80 mt-0.5">주소/우편번호 자동확인</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold">4단계</div>
              <div className="font-bold text-xs mt-0.5 flex items-center justify-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-300" />
                내용 확인/수정
              </div>
              <div className="text-[10px] text-blue-200/80 mt-0.5">대량 일괄 편집</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/20 backdrop-blur-xs rounded-xl p-2.5 text-center border border-white/30">
              <div className="text-[11px] text-yellow-300 font-bold">5단계</div>
              <div className="font-bold text-xs mt-0.5 flex items-center justify-center gap-1 text-white">
                <Download className="w-3.5 h-3.5 text-yellow-300" />
                엑셀 다운로드
              </div>
              <div className="text-[10px] text-blue-100 mt-0.5">택배사 양식 생성</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-xl">
            <button
              id="dash-cta-scan"
              onClick={onStartNewScan}
              className="w-full h-12 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap">사진 촬영 및 새 접수 시작</span>
              <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
            </button>

            <button
              id="dash-cta-sample"
              onClick={onOpenSampleScan}
              className="w-full h-12 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-sm transition-all border border-blue-300/40 shadow-xs active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
              <span className="whitespace-nowrap">주소 용지 샘플 체험하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 오늘 접수 현황 Cards (Matching Blueprint 5-2 대시보드) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">오늘 접수 현황</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {currentDisplayName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">오늘 접수 건수</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {todayStats.totalItems}
              </span>
              <span className="text-sm font-medium text-slate-500">건</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">사진 인식 완료된 수취인 수</p>
          </div>

          {/* Total Boxes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">오늘 총 박스 수량</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {todayStats.totalBoxes}
              </span>
              <span className="text-sm font-medium text-slate-500">박스</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">송장 인쇄 예정 실물 박스 합계</p>
          </div>

          {/* Review Required */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">확인·수정 필요</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold tracking-tight ${todayStats.warningCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {todayStats.warningCount}
              </span>
              <span className="text-sm font-medium text-slate-500">건</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">상세주소/연락처 재확인 권장</p>
          </div>

          {/* System Accuracy / Complete rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">AI 주소 자동 정제율</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                98.6%
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">도로명 주소 및 우편번호 자동 매칭</p>
          </div>
        </div>
      </div>

      {/* 3. 최근 접수 내역 테이블 (Matching Blueprint 5-2 최근 접수 내역) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">최근 접수 내역</h3>
            <span className="text-xs text-slate-500 font-normal">
              (총 {batches.length}회차)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dash-btn-new-batch"
              onClick={onStartNewScan}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              + 새 접수
            </button>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">아직 등록된 접수 내역이 없습니다</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              종이 접수 용지를 사진으로 찍거나 샘플 데이터로 AI 인식을 시작해보세요.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={onStartNewScan}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                사진 촬영/업로드하기
              </button>
              <button
                onClick={onOpenSampleScan}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                주소 용지 샘플 데이터 불러오기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Modern Card List (Under md breakpoint) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {batches.map((batch) => {
                const courierConfig = COURIER_CONFIGS[batch.courier] || COURIER_CONFIGS.cj;
                return (
                  <div
                    key={`mobile-${batch.id}`}
                    onClick={() => onViewBatch(batch)}
                    className="p-4 hover:bg-blue-50/30 transition-colors active:bg-blue-50/60 cursor-pointer space-y-3"
                  >
                    {/* Card Top: Title, Date & Courier Badge Dropdown */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-slate-900 leading-snug break-keep">
                          {batch.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {batch.createdAt}
                        </div>
                      </div>
                      
                      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                        <select
                          id={`dash-courier-mob-${batch.id}`}
                          value={batch.courier || sender?.defaultCourier || 'cj'}
                          onChange={(e) => onUpdateBatchCourier?.(batch.id, e.target.value as CourierType)}
                          className={`appearance-none pl-2.5 pr-6 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${courierConfig.badgeBg} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                          title="택배사 양식 변경"
                        >
                          {Object.values(COURIER_CONFIGS).map((c) => (
                            <option key={c.id} value={c.id} className="bg-white text-slate-800">
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                      </div>
                    </div>

                    {/* Card Middle: Summary Stat Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>접수 {batch.itemCount}건</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                        <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                        <span>총 {batch.boxCount}박스</span>
                      </span>

                      {batch.warningCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          확인 {batch.warningCount}건
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          정상 완료
                        </span>
                      )}
                    </div>

                    {/* Card Bottom: Action Buttons */}
                    <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`batch-export-mob-${batch.id}`}
                        onClick={() => onQuickExport(batch)}
                        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">엑셀 다운로드</span>
                      </button>

                      <button
                        onClick={() => onViewBatch(batch)}
                        className="h-10 px-3.5 inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        title="상세보기 및 편집"
                      >
                        <span>상세보기</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Clean Table (md and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/60 font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">접수일시 / 제목</th>
                    <th className="px-4 py-3.5">택배사 양식 (선택/변경)</th>
                    <th className="px-4 py-3.5 text-center">접수건수</th>
                    <th className="px-4 py-3.5 text-center">총 박스수</th>
                    <th className="px-4 py-3.5 text-center">상태</th>
                    <th className="px-6 py-3.5 text-right">관리 / 다운로드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => {
                    const courierConfig = COURIER_CONFIGS[batch.courier] || COURIER_CONFIGS.cj;
                    return (
                      <tr
                        key={batch.id}
                        className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                        onClick={() => onViewBatch(batch)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {batch.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {batch.createdAt}
                          </div>
                        </td>

                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <select
                              id={`dash-courier-${batch.id}`}
                              value={batch.courier || sender?.defaultCourier || 'cj'}
                              onChange={(e) => onUpdateBatchCourier?.(batch.id, e.target.value as CourierType)}
                              className={`appearance-none pl-2.5 pr-7 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${courierConfig.badgeBg} focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                              title="이 접수건의 택배사 양식을 변경합니다"
                            >
                              {Object.values(COURIER_CONFIGS).map((c) => (
                                <option key={c.id} value={c.id} className="bg-white text-slate-800 font-medium">
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-slate-800">
                          {batch.itemCount}건
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-indigo-700">
                          {batch.boxCount}박스
                        </td>

                        <td className="px-4 py-4 text-center">
                          {batch.warningCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              확인 {batch.warningCount}건
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              완료
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-2">
                            <button
                              id={`batch-export-${batch.id}`}
                              onClick={() => onQuickExport(batch)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>엑셀 다운로드</span>
                            </button>

                            <button
                              onClick={() => onViewBatch(batch)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="상세보기 및 편집"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Courier Support Quick Guide Banner */}
      <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm">국내 주요 택배사 표준 엑셀 양식 100% 호환</span>
            <p className="text-slate-500 mt-0.5">
              CJ대한통운(CNPlus), 롯데택배(ALPS), 한진택배, 인터넷우체국(e-Post), 로젠택배 대량접수 지원
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-white font-bold text-blue-700 border border-slate-200 text-xs whitespace-nowrap shadow-2xs">CJ대한통운</span>
          <span className="px-2.5 py-1 rounded-md bg-white font-bold text-red-600 border border-slate-200 text-xs whitespace-nowrap shadow-2xs">롯데택배</span>
          <span className="px-2.5 py-1 rounded-md bg-white font-bold text-amber-600 border border-slate-200 text-xs whitespace-nowrap shadow-2xs">한진택배</span>
          <span className="px-2.5 py-1 rounded-md bg-white font-bold text-orange-600 border border-slate-200 text-xs whitespace-nowrap shadow-2xs">우체국</span>
          <span className="px-2.5 py-1 rounded-md bg-white font-bold text-yellow-700 border border-slate-200 text-xs whitespace-nowrap shadow-2xs">로젠택배</span>
        </div>
      </div>
    </div>
  );
};
