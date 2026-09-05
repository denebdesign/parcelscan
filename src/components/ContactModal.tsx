import React, { useState } from 'react';
import { X, Mail, Globe, Send, CheckCircle2, MessageSquare, Building2, Phone } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'inquiry' | 'courier_request' | 'partnership' | 'bug'>('inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('성함, 이메일, 문의 내용을 모두 입력해 주세요.');
      return;
    }
    // Simulate sending inquiry
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 id="contact-modal-title" className="text-base font-bold text-slate-900">
                고객센터 및 제휴·광고 문의
              </h2>
              <p className="text-[11px] text-slate-500">
                택배스캔 (ParcelScan) 운영팀
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
        <div className="p-6 text-xs text-slate-700 space-y-5">
          {/* Direct Board Banner */}
          <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-2">
            <div className="font-bold text-xs text-blue-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                공식 고객센터 및 제휴 문의 게시판
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
                실시간 답변
              </span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              스팸 방지 및 신속하고 투명한 상담 처리를 위해 <strong>공식 온라인 문의 게시판</strong>을 통해 모든 문의(기능 문의, 택배사 양식 요청, 광고·제휴)를 접수받고 있습니다.
            </p>
            <div className="pt-1">
              <a
                href="https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>공식 문의 게시판으로 이동하기 (iuser.kr)</span>
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Official Operator Info Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              서비스 공식 운영 정보
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400">서비스명:</span>{' '}
                <span className="font-semibold text-slate-800">택배스캔 (ParcelScan)</span>
              </div>
              <div>
                <span className="text-slate-400">대표 도메인:</span>{' '}
                <span className="font-semibold text-blue-600">parcelscan.iuser.kr</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">문의 채널:</span>{' '}
                <a 
                  href="https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:underline font-mono break-all"
                >
                  https://iuser.kr/g5/bbs/board.php?bo_table=parcelscan
                </a>
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-emerald-950">문의가 성공적으로 접수되었습니다.</div>
              <p className="text-xs text-emerald-800">
                담당자가 내용을 확인한 후 남겨주신 이메일(<strong>{email}</strong>)로 신속히 회신해 드리겠습니다.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">문의 유형</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="inquiry">서비스 이용 및 기능 문의</option>
                  <option value="courier_request">택배사 엑셀 양식 추가/수정 요청</option>
                  <option value="partnership">기업/농협 단체 도입 및 제휴·광고 문의</option>
                  <option value="bug">오류 및 버그 제보</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">성함 / 상호명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동 (제주농원)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">회신받으실 이메일</label>
                  <input
                    type="email"
                    required
                    placeholder="example@naver.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">문의 내용</label>
                <textarea
                  required
                  rows={4}
                  placeholder="문의사항이나 개선 요청 사항을 자유롭게 적어주세요."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>문의 보내기</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
