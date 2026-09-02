import React from 'react';
import { X, BookOpen, CheckCircle2, FileCheck, HelpCircle } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="terms-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                서비스 이용약관 및 이용안내
              </h2>
              <p className="text-[11px] text-slate-500">
                택배스캔 (ParcelScan) · parcelscan.iuser.kr
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-xs text-slate-700 space-y-6 leading-relaxed">
          {/* Quick Guide Card */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
            <div className="font-bold text-sm flex items-center gap-1.5 text-emerald-950">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              택배스캔 핵심 이용 가이드
            </div>
            <ul className="text-[11px] space-y-1 text-emerald-800 list-disc pl-4">
              <li><strong>스마트폰 촬영 / 사진 업로드:</strong> 손글씨나 인쇄된 주소록 용지를 선명하게 촬영하여 업로드합니다.</li>
              <li><strong>AI 주소 및 우편번호 자동 정제:</strong> Gemini AI와 우정사업본부 공식 DB가 연동되어 도로명주소 및 5자리 우편번호를 자동 부여합니다.</li>
              <li><strong>택배사 엑셀 다운로드:</strong> CJ대한통운, 롯데, 한진, 우체국, 로젠택배 중 사용하는 택배사를 선택하고 엑셀로 내려받아 택배사 전산에 업로드합니다.</li>
            </ul>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              제1조 (목적)
            </h3>
            <p className="text-slate-600 pl-3.5">
              본 약관은 택배스캔(parcelscan.iuser.kr)이 제공하는 인공지능 기반 주소록 문자 인식(OCR) 및 택배 대량 접수 엑셀 파일 변환 서비스(이하 '서비스')의 이용조건과 절차, 이용자와 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              제2조 (제공 서비스 및 지원 택배사)
            </h3>
            <div className="pl-3.5 space-y-1.5 text-slate-600">
              <p>서비스가 제공하는 주요 기능은 다음과 같습니다:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>종이 수기 명단 및 주소 사진의 인공지능(AI) 고속 텍스트 변환</li>
                <li>대한민국 도로명 주소 및 우체국 5자리 새 우편번호 자동 정제/매칭</li>
                <li>단골 고객 주소록 자동 연동 및 이력 관리</li>
                <li><strong>CJ대한통운 (CNPlus/이플렉스), 롯데택배 (ALPS), 한진택배 (한진이지스), 인터넷우체국 (e-Post), 로젠택배</strong> 표준 엑셀 양식 자동 변환 및 다운로드</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              제3조 (이용자의 의무 및 최종 검수 권고)
            </h3>
            <div className="pl-3.5 space-y-1.5 text-slate-600">
              <p>
                1. 이용자는 원본 용지 사진 업로드 시 타인의 권리를 침해하지 않는 정당한 배송 명단만을 사용하여야 합니다.
              </p>
              <p>
                2. <strong>AI 인식 결과 최종 확인 의무:</strong> 인공지능 OCR 기술은 손글씨의 필체, 조명, 구겨짐 등에 따라 일부 오탈자가 발생할 수 있습니다. 이용자는 택배사 전산에 최종 엑셀을 업로드하기 전 [상세확인/수정] 기능을 통해 수취인 성명, 연락처, 주소, 상세 동호수를 최종 검토하여야 합니다.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              제4조 (면책 조항)
            </h3>
            <div className="pl-3.5 space-y-1.5 text-slate-600">
              <p>
                1. 서비스는 천재지변, 기간통신사업자의 회선 장애, Google AI 서버 점검 등 불가항력적인 사유로 서비스가 일시 중단되는 경우 책임을 지지 않습니다.
              </p>
              <p>
                2. 서비스는 이용자가 AI 변환 결과를 최종 검수하지 않고 발생한 오배송이나 택배사 접수 오류에 대해 고의 또는 중대한 과실이 없는 한 법적 책임을 부담하지 않습니다.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              제5조 (서비스 문의 및 고객센터)
            </h3>
            <div className="pl-3.5 text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
              <p>서비스 이용 중 불편사항이나 새로운 택배사 양식 추가 요청은 공식 문의 게시판으로 접수해 주시면 신속히 확인 및 반영해 드립니다.</p>
              <p>
                <strong>공식 문의 게시판:</strong>{' '}
                <a
                  href="https://iuser.kr/board/parcelscan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold hover:underline font-mono"
                >
                  https://iuser.kr/board/parcelscan
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Button */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
