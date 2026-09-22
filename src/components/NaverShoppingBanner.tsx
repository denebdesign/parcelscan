import React, { useState, useEffect } from 'react';
import { ExternalLink, ShoppingBag, Box, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export interface ProductItem {
  id: number;
  title: string;
  category: string;
  badgeColor: string;
  url: string;
  highlight: string;
  imageCandidates: string[];
}

export const PRODUCTS: ProductItem[] = [
  {
    id: 1,
    title: '홈트너 물없이 붙이는 난방 창문 에어캡 방한 단열뽁뽁이 점착형 베이직',
    category: '방한·단열',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    url: 'https://naver.me/FXnzSsSk',
    highlight: '물 없이 간편 부착 · 단열 뽁뽁이',
    imageCandidates: [
      '/images/products/1.jpeg',
      '/images/products/product_1.jpg',
      '/images/products/1.jpg',
      '/images/products/1.png',
      '/images/products/hometner_insulation_1.jpg',
    ],
  },
  {
    id: 2,
    title: '제이팩 스마트 에어캡 기계 뽁뽁이 제조기 에어쿠션 에어캡 머신 에어팩',
    category: '완충 제조기',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    url: 'https://naver.me/5imEsf08',
    highlight: '스마트 에어캡 기계 · 에어쿠션 제조',
    imageCandidates: [
      '/images/products/2.jpeg',
      '/images/products/product_2.jpg',
      '/images/products/2.jpg',
      '/images/products/2.png',
      '/images/products/aircushion_machine_2.jpg',
    ],
  },
  {
    id: 3,
    title: '국내산 두꺼운 뽁뽁이 포장용 에어캡 완충 롤 창문 단열 테포르 33cm - 100cm',
    category: '에어캡·완충',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    url: 'https://naver.me/xaT1Z3Fq',
    highlight: '국내산 고강도 포장 완충 롤 에어캡',
    imageCandidates: [
      '/images/products/3.jpeg',
      '/images/products/product_3.jpg',
      '/images/products/3.jpg',
      '/images/products/3.png',
    ],
  },
  {
    id: 4,
    title: '리더스 투명 박스테이프 OPP 택배포장 80M 40입',
    category: '포장 테이프',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    url: 'https://naver.me/551hJkGR',
    highlight: '대용량 80M OPP 박스테이프 40입',
    imageCandidates: [
      '/images/products/4.jpeg',
      '/images/products/product_4.jpg',
      '/images/products/4.jpg',
      '/images/products/4.png',
    ],
  },
  {
    id: 5,
    title: '택배박스 택배상자 우체국 포장 이사 골판지 박스 모음',
    category: '포장 박스',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    url: 'https://naver.me/I5wL80Ow',
    highlight: '튼튼한 골판지 택배 포장 상자',
    imageCandidates: [
      '/images/products/5.jpeg',
      '/images/products/product_5.jpg',
      '/images/products/5.jpg',
      '/images/products/5.png',
    ],
  },
  {
    id: 6,
    title: '의류 택배 비닐 봉투 택배 포장 봉투 폴리백 모음',
    category: '택배 봉투',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    url: 'https://naver.me/5DZsX5EU',
    highlight: '강력 접착 방수 택배 포장 폴리백',
    imageCandidates: [
      '/images/products/6.jpeg',
      '/images/products/product_6.jpg',
      '/images/products/6.jpg',
      '/images/products/6.png',
    ],
  },
  {
    id: 7,
    title: '택배박스 우체국 규격 이사 소형 대형 무지 260x260x260mm 50장',
    category: '규격 박스',
    badgeColor: 'bg-lime-50 text-lime-700 border-lime-200',
    url: 'https://naver.me/5ulq8AHz',
    highlight: '우체국 규격 이사 소형·대형 박스 50장',
    imageCandidates: [
      '/images/products/7.jpeg',
      '/images/products/7.jpg',
      '/images/products/7.png',
    ],
  },
  {
    id: 8,
    title: '신일 박스테이프 80M 택배 포장용 OPP 투명테이프 경포장 40개 수성',
    category: '포장 테이프',
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    url: 'https://naver.me/5Z1KcDru',
    highlight: '신일 OPP 투명 박스테이프 80M 40개',
    imageCandidates: [
      '/images/products/8.jpeg',
      '/images/products/8.jpg',
      '/images/products/8.png',
    ],
  },
];

// 이미지가 없거나 로드 실패 시 자동으로 다음 후보 또는 기본 플레이스홀더로 폴백하는 컴포넌트
const SmartProductImage: React.FC<{
  candidates: string[];
  alt: string;
  category: string;
  badgeColor: string;
}> = ({ candidates, alt, category, badgeColor }) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const currentSrc = candidates[candidateIndex];

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
      {!hasError && currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2 text-center">
          <Box className="w-6 h-6 text-slate-300 mb-1" />
          <span className="text-[10px] font-medium text-slate-400 leading-tight">상품 이미지</span>
        </div>
      )}

      {/* 카테고리 뱃지 */}
      <span
        className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.2 rounded border shadow-2xs ${badgeColor}`}
      >
        {category}
      </span>
    </div>
  );
};

export const NaverShoppingBanner: React.FC<{ 
  className?: string;
  triggerEventKey?: string | number;
}> = ({ className = '', triggerEventKey }) => {
  const totalPages = Math.ceil(PRODUCTS.length / 2);

  // 접속(초기 로딩) 시 무작위(랜덤) 페어로 산뜻하게 2개 노출
  const [page, setPage] = useState<number>(() => {
    return Math.floor(Math.random() * totalPages);
  });

  // 탭 변경, 스캔 완료, 작업 이벤트 발생 시(triggerEventKey 변경 시) 자동으로 다음/다른 2개로 교체
  useEffect(() => {
    if (triggerEventKey !== undefined) {
      setPage((prev) => (prev + 1) % totalPages);
    }
  }, [triggerEventKey, totalPages]);

  const currentPair = PRODUCTS.slice(page * 2, page * 2 + 2);

  const handleNext = () => setPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);
  const handleShuffle = () => {
    setPage((prev) => {
      let next = Math.floor(Math.random() * totalPages);
      if (next === prev && totalPages > 1) {
        next = (prev + 1) % totalPages;
      }
      return next;
    });
  };

  return (
    <div
      id="naver-shopping-banner-2pack"
      className={`rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/50 shadow-2xs overflow-hidden transition-all print:hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-emerald-100/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                택배 발송 필수 자재 추천 모음
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                네이버쇼핑
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
              발송 포장 작업에 꼭 필요한 추천 자재입니다.
            </p>
          </div>
        </div>

        {/* 2개씩 넘겨보는 페이지네이션 및 다른 상품 보기 버튼 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 bg-white/90 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="다른 추천 상품 보기"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>다른상품</span>
          </button>

          <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            {page + 1} / {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              title="이전 상품"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              title="다음 상품"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 정확히 2개만 노출되는 영역 */}
      <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 transition-all duration-300">
        {currentPair.map((product) => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer"
          >
            {/* 폴더에서 이미지 자동 로드 + 없을 시 기본 처리 */}
            <SmartProductImage
              candidates={product.imageCandidates}
              alt={product.title}
              category={product.category}
              badgeColor={product.badgeColor}
            />

            {/* Product Details & Direct Link */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                  {product.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {product.highlight}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 group-hover:bg-emerald-700 px-2.5 py-1 rounded-lg shadow-2xs transition-colors shrink-0">
                  <span>보러가기</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer Legal Disclosure & Page Dots */}
      <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>* 본 배너는 네이버 쇼핑 커넥트 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPage(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                page === idx ? 'w-4 bg-emerald-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`${idx * 2 + 1}~${idx * 2 + 2}번 상품 보기`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
