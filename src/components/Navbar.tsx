import React from 'react';
import { 
  Package, 
  Camera, 
  FileSpreadsheet, 
  History, 
  Store,
  Sparkles, 
  LayoutDashboard, 
  LogOut, 
  LogIn
} from 'lucide-react';
import { SenderProfile } from '../types';

interface NavbarProps {
  isLoggedIn: boolean;
  userProfile?: { name: string; email: string; businessName?: string };
  currentTab: 'dashboard' | 'scan' | 'result' | 'history';
  setCurrentTab: (tab: 'dashboard' | 'scan' | 'result' | 'history') => void;
  sender: SenderProfile;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  activeItemCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userProfile,
  currentTab,
  setCurrentTab,
  sender,
  onOpenSettings,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  activeItemCount,
}) => {
  // -------------------------------------------------------------
  // 1. BEFORE LOGIN (로그인 전)
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">택배스캔</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    AI 전산화
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  손글씨 주소 사진 한 장으로 택배사 엑셀 완성
                </p>
              </div>
            </div>

            {/* Right CTAs */}
            <div className="flex items-center gap-2.5">
              <button
                id="btn-nav-login"
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>로그인</span>
              </button>

              <button
                id="btn-nav-signup"
                onClick={onOpenSignup}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>무료로 시작하기</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // 2. AFTER LOGIN (로그인 후)
  // -------------------------------------------------------------
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Business Workspace Info */}
          <div className="flex items-center gap-4">
            <button
              id="nav-logo-btn"
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">택배스캔</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="업무 연결됨" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[130px]">
                  {sender.name || userProfile?.businessName || '취급점 워크스페이스'}
                </div>
              </div>
            </button>
          </div>

          {/* Center: Simplified Navigation Tabs (단골주소록 removed) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            <button
              id="tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              대시보드
            </button>

            <button
              id="tab-scan"
              onClick={() => setCurrentTab('scan')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'scan'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              촬영·업로드
            </button>

            {activeItemCount > 0 && (
              <button
                id="tab-result"
                onClick={() => setCurrentTab('result')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'result'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                인식 결과
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                  {activeItemCount}
                </span>
              </button>
            )}

            <button
              id="tab-history"
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'history'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              접수 목록
            </button>
          </nav>

          {/* Right: Store Settings & Quick Scan CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Store / Agency Settings (취급점 설정) */}
            <button
              id="btn-store-settings"
              onClick={onOpenSettings}
              title="취급점(보내는 분) 정보 및 기본 택배사 설정"
              className="h-9 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">
                {sender.name || '취급점 설정'}
              </span>
              <span className="sm:hidden">설정</span>
            </button>

            {/* Quick New Scan CTA */}
            <button
              id="btn-quick-new-scan"
              onClick={() => setCurrentTab('scan')}
              className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span>새 접수 촬영</span>
            </button>

            {/* Logout button */}
            <button
              id="btn-nav-logout"
              onClick={onLogout}
              title="로그아웃"
              className="h-9 px-2.5 flex items-center justify-center gap-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">로그아웃</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1 font-medium ${currentTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
          >
            대시보드
          </button>
          <button
            onClick={() => setCurrentTab('scan')}
            className={`px-3 py-1 font-medium ${currentTab === 'scan' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
          >
            촬영/업로드
          </button>
          {activeItemCount > 0 && (
            <button
              onClick={() => setCurrentTab('result')}
              className={`px-3 py-1 font-medium ${currentTab === 'result' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              인식결과 ({activeItemCount})
            </button>
          )}
          <button
            onClick={() => setCurrentTab('history')}
            className={`px-3 py-1 font-medium ${currentTab === 'history' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
          >
            접수목록
          </button>
        </div>
      </div>
    </header>
  );
};
