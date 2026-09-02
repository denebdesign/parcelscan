import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId?: string;
  client?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  responsive?: boolean;
  className?: string;
  label?: string;
  variant?: 'banner' | 'card' | 'interstitial';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  client,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Google AdSense 광고 영역',
  variant = 'banner',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt to push ad if AdSense script is loaded in production
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle && slotId) {
        window.adsbygoogle.push({});
      }
    } catch {
      // Graceful fallback if ad blocker or preview mode
    }
  }, [slotId]);

  if (variant === 'interstitial') {
    return (
      <div
        id="google-ads-interstitial-container"
        className={`w-full rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 sm:p-5 text-center flex flex-col items-center justify-center min-h-[140px] transition-all print:hidden ${className}`}
      >
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-2">
          <span className="text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
            SPONSORED
          </span>
          <span className="text-xs">{label}</span>
        </div>

        {slotId && client ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '90px', width: '100%' }}
            data-ad-client={client}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        ) : (
          <div className="space-y-1 py-3">
            <p className="text-xs font-semibold text-slate-700">
              AI 분석 및 엑셀 변환 로딩 중 노출되는 구글 스폰서 광고 지면
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              구글 애드센스 단위 코드가 삽입되면 높은 단가의 B2B / 쇼핑 광고가 자동으로 게재됩니다.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      id={`google-ads-${format}-container`}
      className={`w-full mx-auto overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-colors p-3.5 sm:p-4 text-center text-slate-400 text-xs flex flex-col items-center justify-center min-h-[100px] print:hidden shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1.5">
        <span className="text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
          AD
        </span>
        <span className="text-xs text-slate-600">{label}</span>
      </div>

      {slotId && client ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px', width: '100%' }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      ) : (
        <div className="py-1">
          <p className="text-[11px] text-slate-500 font-medium">
            Google AdSense 반응형 디스플레이 광고 영역
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 max-w-lg mx-auto">
            (도메인 parcelscan.iuser.kr 애드센스 등록 후 발급된 광고 슬롯 코드가 실시간 렌더링됩니다)
          </p>
        </div>
      )}
    </div>
  );
};
