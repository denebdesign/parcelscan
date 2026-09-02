import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Mail, 
  Lock, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userInfo: { name: string; email: string; businessName?: string; isNewSignup?: boolean }) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isSignup = mode === 'signup';
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check for demo accounts (test1@gmail.com, test2@gmail.com)
    if (!isSignup && trimmedEmail === 'test1@gmail.com') {
      onLoginSuccess({
        name: '제주바람농원 (김대표)',
        email: 'test1@gmail.com',
        businessName: '제주바람농원',
        isNewSignup: false,
      });
      onClose();
      return;
    }

    if (!isSignup && trimmedEmail === 'test2@gmail.com') {
      onLoginSuccess({
        name: '온라인마켓 굿즈랩 (이과장)',
        email: 'test2@gmail.com',
        businessName: '온라인마켓 굿즈랩',
        isNewSignup: false,
      });
      onClose();
      return;
    }

    // Actual user account (e.g. 0192449625@naver.com or custom signup)
    const isPyeongdae = trimmedEmail === '0192449625@naver.com';
    const defaultName = isPyeongdae ? '평대취급소' : (isSignup ? '내 사업장' : '내 사업장');
    const finalBusinessName = businessName.trim() || defaultName;
    const finalEmail = trimmedEmail || (isSignup ? 'user@example.com' : '0192449625@naver.com');
    
    onLoginSuccess({
      name: finalBusinessName,
      email: finalEmail,
      businessName: finalBusinessName,
      isNewSignup: isSignup,
    });
    onClose();
  };

  const handleDemoQuickLogin = (demoName: string, demoEmail: string) => {
    onLoginSuccess({
      name: demoName,
      email: demoEmail,
      businessName: demoName,
      isNewSignup: false,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Package className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">
              {mode === 'login' ? '로그인' : '무료 회원가입'}
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              종이 주소 사진 한 장으로 택배사 엑셀 자동 변환
            </p>
          </div>

          {/* Quick 1-Click Demo Login Banner */}
          <div className="p-5 bg-blue-50/70 border-b border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                체험용 원클릭 바로 로그인
              </span>
              <span className="text-[11px] text-blue-600 font-medium">가입 없이 1초 시작</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('제주바람농원 (김대표)', 'test1@gmail.com')}
                className="px-3 py-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-left text-xs transition-all shadow-2xs group"
              >
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>제주바람농원</span>
                  <ArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-500">체험용 1 (test1@gmail.com)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoQuickLogin('온라인마켓 굿즈랩 (이과장)', 'test2@gmail.com')}
                className="px-3 py-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-left text-xs transition-all shadow-2xs group"
              >
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>굿즈랩 스토어</span>
                  <ArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-500">체험용 2 (test2@gmail.com)</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  상호명 / 농원명
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="예: 제주바람농원, 굿즈스토어"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이메일 아이디
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  비밀번호
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('체험용 계정으로 바로 로그인 버튼을 눌러주세요.')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    비밀번호 찾기
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>로그인 상태 유지</span>
              </label>
              <span className="text-slate-400">보안 전송 암호화 적용</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{mode === 'login' ? '로그인하고 시작하기' : '무료 계정 생성하기'}</span>
            </button>

            {/* Mode Switcher */}
            <div className="text-center pt-2">
              {mode === 'login' ? (
                <p className="text-xs text-slate-500">
                  아직 계정이 없으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    무료 회원가입
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  이미 계정이 있으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    로그인하기
                  </button>
                </p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
