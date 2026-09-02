import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  QrCode, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

interface MobileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoReceived: (imageBase64: string, mimeType: string) => void;
}

export const MobileSyncModal: React.FC<MobileSyncModalProps> = ({
  isOpen,
  onClose,
  onPhotoReceived,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isReceived, setIsReceived] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const pollIntervalRef = useRef<any>(null);

  // Initialize session and generate QR Code
  const initializeSession = async () => {
    try {
      setIsLoadingSession(true);
      setIsWaiting(true);
      setIsReceived(false);

      const res = await fetch('/api/mobile-sync/create', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        
        // Build mobile link
        const targetUrl = `${window.location.origin}${window.location.pathname}?sync=${data.sessionId}`;
        
        // Generate QR code data URL
        const qrUrl = await QRCode.toDataURL(targetUrl, {
          width: 280,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        });
        setQrDataUrl(qrUrl);
      }
    } catch (err) {
      console.error('Failed to create mobile sync session:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeSession();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setSessionId(null);
      setQrDataUrl(null);
      setIsReceived(false);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen]);

  // Polling for incoming image
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mobile-sync/status/${sessionId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.status === 'uploaded' && data.imageBase64) {
          // Received image!
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsWaiting(false);
          setIsReceived(true);

          // Trigger callback and close modal after brief visual feedback
          setTimeout(() => {
            onPhotoReceived(data.imageBase64, data.mimeType || 'image/jpeg');
            onClose();
          }, 1000);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 1200);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, sessionId, onPhotoReceived, onClose]);

  const getDirectLink = () => {
    if (!sessionId) return '';
    return `${window.location.origin}${window.location.pathname}?sync=${sessionId}`;
  };

  const handleCopyLink = () => {
    const link = getDirectLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">스마트폰 카메라로 즉시 촬영</h3>
              <p className="text-xs text-blue-100">PC와 모바일 실시간 자동 연동</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-center">
          {isLoadingSession ? (
            <div className="py-12 space-y-3 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold text-slate-500">
                실시간 암호화 연동 QR 코드 생성 중...
              </p>
            </div>
          ) : isReceived ? (
            <div className="py-10 space-y-3 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                스마트폰에서 사진이 전송되었습니다!
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>AI 주소 인식을 자동으로 시작합니다...</span>
              </p>
            </div>
          ) : (
            <>
              {/* QR Code Container */}
              <div className="relative inline-block mx-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="스마트폰 연동 QR 코드"
                    className="w-56 h-56 rounded-xl mx-auto block shadow-xs"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl">
                    <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                  </div>
                )}

                {/* Pulse badge */}
                <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>실시간 수신 대기 중</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-2 space-y-2">
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-left space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2 font-semibold text-blue-900">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>스마트폰 기본 카메라로 위 QR코드를 비춰주세요.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>열린 화면에서 사진을 찍고 [PC로 전송]을 누르면 이 화면에 즉시 로드됩니다.</span>
                  </div>
                </div>

                {/* Session Pin & Direct Link */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-left font-mono text-slate-600 truncate">
                    연결 코드: <strong className="text-blue-600 font-bold tracking-wider">{sessionId}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">링크 복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>링크 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={initializeSession}
            disabled={isLoadingSession || isReceived}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>QR 코드 새로고침</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
