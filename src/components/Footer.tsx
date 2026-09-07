import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink, Sparkles, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const BOARD_URL = 'https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan';

  return (
    <footer className="bg-white border-t border-slate-200 mt-12 text-slate-500 text-xs print:hidden">
      {/* Top Footer Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                택배스캔 (ParcelScan)
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              농가, 과수원, 쇼핑몰, 소상공인을 위한 종이 주소록 AI 전산화 솔루션.
              손글씨 주소 사진을 촬영하면 CJ대한통운, 롯데, 한진, 우체국, 로젠택배 대량 접수용 표준 엑셀로 자동 변환합니다.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-500">
              <span>공식 도메인: <strong className="text-blue-600 font-mono">parcelscan.iuser.kr</strong></span>
              <span className="hidden sm:inline">·</span>
              <span>
                문의/제휴:{' '}
                <a
                  href={BOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 font-medium inline-flex items-center gap-0.5"
                >
                  <span>iuser.kr 문의게시판</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              </span>
            </div>
          </div>

          {/* Policy & Customer Service 2-Column Grid on Mobile */}
          <div className="grid grid-cols-2 gap-4 md:contents">
            {/* Quick Policy Links */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">법적 고지 및 정책</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold">개인정보처리방침</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>서비스 이용약관</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                  >
                    <span>이용안내 및 면책조항</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Customer Support & Contact */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">고객센터 및 제휴</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href={BOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>고객센터 문의하기</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                </li>
                <li>
                  <a
                    href={BOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span>양식 추가 요청</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                </li>
                <li>
                  <a
                    href={BOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span>광고/제휴 문의</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] text-slate-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} ParcelScan (택배스캔). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-500">
            <button onClick={onOpenPrivacy} className="hover:underline cursor-pointer">개인정보처리방침</button>
            <span>·</span>
            <button onClick={onOpenTerms} className="hover:underline cursor-pointer">이용약관</button>
            <span>·</span>
            <a
              href={BOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 font-medium inline-flex items-center gap-0.5"
            >
              <span>문의게시판</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
