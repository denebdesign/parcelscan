import React from 'react';
import { ExternalLink, Package, ShieldCheck, Sparkles, Tag, ShoppingBag } from 'lucide-react';

interface NaverShoppingBannerProps {
  className?: string;
  variant?: 'full' | 'compact' | 'card';
}

export const NaverShoppingBanner: React.FC<NaverShoppingBannerProps> = ({
  className = '',
  variant = 'full',
}) => {
  const products = [
    {
      id: 'box-tape',
      title: '강력 점착 박스테이프 (OPP)',
      badge: '포장 필수품',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: '소음 적고 잘 끊어지지 않는 초강력 점착 택배 포장용 OPP 테이프',
      priceNotice: '네이버 쇼핑 최저가 혜택',
      url: 'https://naver.me/5Z1KcDru',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 stroke-[2.2]" />
        </div>
      ),
    },
    {
      id: 'parcel-box',
      title: '규격별 택배박스 (튼튼한 골판지)',
      badge: '대량 할인',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: '농산물·가공식품·공산품 안전 배송을 위한 고강도 규격 골판지 상자',
      priceNotice: '공장직판 규격별 모음',
      url: 'https://naver.me/5ulq8AHz',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 stroke-[2.2]" />
        </div>
      ),
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-sky-50/90 rounded-2xl border border-emerald-200/80 p-4 print:hidden ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-xs">
              사장님 필수 택배 포장재 특가 모음
            </span>
          </div>
          <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            네이버 쇼핑 커넥트 공식 제휴
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {products.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{item.priceNotice}</div>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  보러가기
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-2.5 text-center sm:text-left">
          <p className="text-[10px] text-slate-400">
            * 본 링크는 네이버 쇼핑 커넥트 활동의 일환으로, 구매 시 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="naver-shopping-supplies-section"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden print:hidden ${className}`}
    >
      {/* Top Banner Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>택배 발송 필수 포장 자재 특가 제휴</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                네이버쇼핑
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              택배 접수 전 박스와 테이프를 최저가로 구비해 포장 원가를 절감해보세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>네이버 쇼핑 공식 인증 상품</span>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {products.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h5>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700">
                {item.priceNotice}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 group-hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors">
                <span>네이버에서 보기</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Mandatory FTC / Naver Connect Legal Disclosure */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <p className="leading-normal">
          * 본 배너는 <strong className="font-semibold text-slate-700">네이버 쇼핑 커넥트 활동의 일환</strong>으로, 이에 따른 <strong className="font-semibold text-slate-700">일정액의 수수료를 제공받습니다</strong>.
        </p>
      </div>
    </div>
  );
};
