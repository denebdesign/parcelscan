import React from 'react';
import { ExternalLink, Sparkles, BookOpen } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 text-slate-500 text-xs print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Brand Info */}
        <div className="space-y-2 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">
              택배스캔 (ParcelScan)
            </span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            농가, 과수원, 쇼핑몰, 소상공인을 위한 종이 주소록 AI 전산화 솔루션. 손글씨 주소 사진을 촬영하면 CJ대한통운, 롯데, 한진, 우체국, 로젠택배 대량 접수용 표준 엑셀로 자동 변환합니다.
          </p>
          <div className="pt-0.5 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>공식 도메인:</span>
              <a
                href="https://parcelscan.iuser.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-mono font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>parcelscan.iuser.kr</span>
                <ExternalLink className="w-3 h-3 text-blue-500" />
              </a>
            </div>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>매뉴얼:</span>
              </span>
              <a
                href="https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-mono font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>iuser.kr</span>
                <ExternalLink className="w-3 h-3 text-blue-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] text-slate-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} ParcelScan (택배스캔). All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-500">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:underline hover:text-slate-700 cursor-pointer"
            >
              개인정보처리방침
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:underline hover:text-slate-700 cursor-pointer"
            >
              이용약관
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
