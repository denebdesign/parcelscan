import React from 'react';
import { X, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                개인정보처리방침 (Privacy Policy)
              </h2>
              <p className="text-[11px] text-slate-500">
                시행일자: 2026년 9월 1일 · parcelscan.iuser.kr
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
          {/* Intro */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              택배스캔 (parcelscan.iuser.kr, 이하 '서비스')은 이용자의 개인정보를 매우 소중하게 생각하며, 「개인정보 보호법」 및 관련 법령을 준수합니다.
            </p>
            <p className="text-[11px]">
              본 방침은 서비스가 수집하는 정보, 이용 목적, 보관 주기 및 Google AdSense 광고 정책에 따른 쿠키 취급 방침을 명확히 안내합니다.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              제1조 (수집하는 개인정보 항목 및 수집 방법)
            </h3>
            <div className="pl-3.5 space-y-1 text-slate-600">
              <p>1. <strong>회원 및 기본 서비스 이용 시:</strong> 이름, 이메일 주소, 상호명(농가명), 발송인 기본 연락처 및 주소(로컬 기기 보관).</p>
              <p>2. <strong>OCR 주소 스캔 서비스 이용 시:</strong> 이용자가 업로드한 종이 주소 사진, 수취인 성명, 연락처, 배송지 주소, 품목명, 수량.</p>
              <p>3. <strong>서비스 이용 과정에서 자동 생성되는 정보:</strong> 접속 IP 주소, 쿠키(Cookie), 접속 기기 정보, 브라우저 종류, 방문 일시.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              제2조 (개인정보의 이용 목적 및 파기 원칙)
            </h3>
            <div className="pl-3.5 space-y-1.5 text-slate-600">
              <p>
                1. <strong>주소 데이터 전산화 및 엑셀 변환:</strong> 업로드된 사진 속 손글씨 주소를 AI 문자인식(OCR)을 통해 텍스트로 변환하고 주요 택배사(CJ대한통운, 롯데, 한진, 우체국, 로젠) 양식 파일로 생성하기 위한 목적으로만 처리됩니다.
              </p>
              <p>
                2. <strong>이미지 데이터의 즉시 휘발성 처리:</strong> OCR 인식을 위해 서버로 전송된 원본 이미지 데이터는 텍스트 추출 완료 즉시 메모리에서 안전하게 파기되며, 영구 저장 서버에 별도 보관되지 않습니다.
              </p>
              <p>
                3. <strong>로컬 스토리지 우선 보관:</strong> 작업 중인 주소 목록 및 고객 주소록 데이터는 기본적으로 이용자의 웹 브라우저(LocalStorage)에 안전하게 암호화 보관되며, 언제든지 [기록 삭제]를 통해 즉시 완전 삭제할 수 있습니다.
              </p>
            </div>
          </section>

          {/* Section 3 - Google AdSense Cookies */}
          <section className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              제3조 (구글 애드센스 및 제3자 광고 쿠키 정책 고지)
            </h3>
            <div className="space-y-2 text-slate-700 text-[11px] leading-relaxed">
              <p>
                본 서비스는 원활한 무료 서비스 제공 및 사이트 유지를 위해 <strong>Google Inc.에서 제공하는 Google AdSense(구글 애드센스)</strong> 광고를 게재할 수 있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  Google 및 제3자 광고 공급업체는 쿠키(Cookie)를 사용하여 사용자의 본 사이트 및 다른 웹사이트 방문 기록을 기반으로 맞춤형 광고를 게재합니다.
                </li>
                <li>
                  Google의 광고 쿠키 사용으로 인해 Google 및 그 파트너사는 사용자의 인터넷 사이트 방문 정보를 바탕으로 최적화된 맞춤 광고를 제공할 수 있습니다.
                </li>
                <li>
                  이용자는 언제든지 <strong>Google 광고 설정(<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">https://adssettings.google.com</a>)</strong>을 방문하여 개인 맞춤 광고 게재를 비활성화(Opt-Out)할 수 있습니다.
                </li>
                <li>
                  또는 <strong><a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">www.aboutads.info</a></strong>를 방문하여 제3자 공급업체의 맞춤 광고용 쿠키 사용을 차단할 수 있습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              제4조 (개인정보의 제3자 제공 및 처리 위탁)
            </h3>
            <div className="pl-3.5 space-y-1 text-slate-600">
              <p>
                서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 고품질 인공지능 이미지 판독 및 도로명 우편번호 정제를 위해 다음과 같이 최소한의 위탁 처리가 수행됩니다:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 mt-1 text-[11px]">
                <li><strong>위탁 대상:</strong> Google Cloud Platform (Gemini AI Vision API), 우정사업본부/행정안전부 도로명 우편번호 API</li>
                <li><strong>위탁 업무 내용:</strong> 이미지 내 문자 인식 처리 및 표준 도로명 우편번호 매칭</li>
                <li><strong>보유 및 이용 기간:</strong> 실시간 API 응답 완료 즉시 파기</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              제5조 (개인정보 보호책임자 및 고객 문의처)
            </h3>
            <div className="pl-3.5 space-y-1 text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p>서비스 이용 중 발생하는 모든 개인정보보호 관련 문의, 불만 처리, 피해구제 등에 관한 사항은 아래의 공식 문의 게시판을 통해 접수하실 수 있습니다.</p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-800">서비스명:</span> 택배스캔 (ParcelScan)
                </div>
                <div>
                  <span className="font-semibold text-slate-800">공식 도메인:</span> parcelscan.iuser.kr
                </div>
                <div>
                  <span className="font-semibold text-slate-800">개인정보 보호책임자:</span> 서비스 운영팀
                </div>
                <div>
                  <span className="font-semibold text-slate-800">공식 문의 게시판:</span>{' '}
                  <a
                    href="https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:underline font-mono break-all"
                  >
                    https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-1 text-slate-500 text-[11px]">
            <p><strong>부칙:</strong> 본 방침은 2026년 9월 1일부터 적용됩니다. 법령이나 정책의 변경에 따라 내용이 변경될 경우 웹사이트 공지사항을 통해 고지합니다.</p>
          </section>
        </div>

        {/* Footer Button */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
