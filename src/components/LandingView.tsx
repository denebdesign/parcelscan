import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  Package, 
  Boxes, 
  Users, 
  ShieldCheck,
  Zap,
  Clock,
  Download,
  LogIn
} from 'lucide-react';
import { COURIER_CONFIGS } from '../utils/excelExporter';

interface LandingViewProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onQuickDemoStart: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenLogin,
  onOpenSignup,
  onQuickDemoStart,
}) => {
  const [activeTab, setActiveTab] = useState<'cj' | 'lotte' | 'hanjin' | 'post' | 'logen'>('cj');

  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>국내 1위 AI 손글씨 주소 전산화 & 택배 엑셀 변환</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          종이에 적힌 손글씨 주소, <br className="hidden sm:inline" />
          <span className="text-blue-600">사진 1장</span>으로 택배사 엑셀까지 끝냅니다
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          과수원, 농가, 쇼핑몰에서 고객이 종이나 수첩에 적어준 주소를 스마트폰으로 찰칵 찍으세요.
          AI가 성명·연락처·도로명 주소를 정확히 분리하고 CJ·롯데·한진·우체국 표준 엑셀로 자동 변환합니다.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={onQuickDemoStart}
            className="h-12 w-full sm:w-auto px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="whitespace-nowrap">체험 계정으로 1초 시작</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={onOpenLogin}
            className="h-12 w-full sm:w-auto px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="whitespace-nowrap">로그인</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>신용카드 등록 불필요</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>국내 5대 택배사 표준 엑셀 지원</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>도로명 주소 실시간 검증</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Feature Comparison & Preview Card */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">How It Works</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              3단계로 완성되는 택배 송장 전산화
            </h2>
          </div>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              종이 주소 촬영 및 업로드
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              수첩, 메모지, A4 분할 용지에 작성된 손글씨나 인쇄물 주소를 스마트폰 카메라로 바로 촬영합니다.
            </p>
          </div>

          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI 주소·전화번호 자동 정제
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              성명, 010 하이픈 연락처, 도로명 주소, 동·호수를 분리하고 단골 고객 주소록과 자동으로 매칭합니다.
            </p>
          </div>

          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              택배사 엑셀 즉시 다운로드
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CJ대한통운, 롯데, 한진, 우체국, 로젠택배 등 사용 중인 택배 시스템의 대량 접수 엑셀 파일로 바로 내려받습니다.
            </p>
          </div>
        </div>

        {/* Courier Tabs Showcase */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-3">지원 택배사별 표준 엑셀 양식 지원 현황</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['cj', 'lotte', 'hanjin', 'post', 'logen'] as const).map((key) => {
              const conf = COURIER_CONFIGS[key];
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{conf.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{conf.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800">
                {COURIER_CONFIGS[activeTab].name} 엑셀 컬럼 구성
              </span>
              <p className="text-slate-500 text-[11px]">
                {COURIER_CONFIGS[activeTab].headers.slice(0, 7).join(' · ')} 등
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Proposition Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">하루 1시간 타자 입력 해방</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            일일이 키보드로 치던 수기 주소 입력 시간을 1분으로 단축합니다. 오타 걱정 없이 발송 준비를 끝내세요.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">배송 사고 0% 도로명 정제</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            지번 주소나 부정확한 손글씨도 행정안전부 표준 도로명 주소 체계에 맞춰 정제되어 반송률을 획기적으로 낮춥니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">단골 고객 자동 재구매 관리</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            이전 주문 고객의 주소록과 실시간 매칭되어 이전 배송 메모와 상품 옵션을 손쉽게 연동합니다.
          </p>
        </div>
      </section>

      {/* 4. Bottom Call To Action Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          지금 바로 손글씨 주소록을 택배 엑셀로 바꿔보세요
        </h2>
        <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto">
          별도의 프로그램 설치 없이 웹 브라우저에서 바로 사용하실 수 있습니다.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={onQuickDemoStart}
            className="h-12 w-full sm:w-auto px-6 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 shadow-md inline-flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="whitespace-nowrap">체험 계정으로 1초 시작</span>
            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
          </button>
          <button
            onClick={onOpenLogin}
            className="h-12 w-full sm:w-auto px-6 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-sm border border-white/30 backdrop-blur-xs inline-flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-white/80 shrink-0" />
            <span className="whitespace-nowrap">로그인</span>
          </button>
        </div>
      </section>
    </div>
  );
};
