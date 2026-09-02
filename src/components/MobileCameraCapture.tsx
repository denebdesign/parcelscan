import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Monitor, 
  Smartphone,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { optimizeImageForOcr } from '../utils/imageCompressor';

interface MobileCameraCaptureProps {
  sessionId: string;
}

export const MobileCameraCapture: React.FC<MobileCameraCaptureProps> = ({ sessionId }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 선택 가능합니다.');
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const optimized = await optimizeImageForOcr(file, 2048, 2048, 0.85);
        setSelectedImage(optimized.base64);
        setMimeType(optimized.mimeType);
        setIsSuccess(false);
      } catch (err: any) {
        console.error('Image optimization error:', err);
        setErrorMessage('이미지를 처리하는 중 오류가 발생했습니다. 다른 사진을 선택해주세요.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSendToPC = async () => {
    if (!selectedImage) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/mobile-sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          imageBase64: selectedImage,
          mimeType: mimeType,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'PC 전송 실패');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Mobile upload error:', err);
      setErrorMessage(err.message || 'PC로 사진을 전송하는 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetForNext = () => {
    setSelectedImage(null);
    setIsSuccess(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Top Header */}
      <header className="space-y-2 text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>모바일 무선 연동 촬영</span>
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">
          택배스캔 모바일 카메라
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span>연동 세션 코드: <strong className="text-blue-400 font-mono tracking-wider">{sessionId}</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-4 space-y-4">
        {/* Hidden Camera File Input with native environment capture */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {isSuccess ? (
          /* Transfer Success Card */
          <div className="bg-slate-800/90 border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">PC로 전송 완료!</h2>
              <p className="text-xs text-slate-300">
                PC 모니터 화면에서 AI 주소 인식이 자동으로 시작되었습니다.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/80 space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleResetForNext();
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>다음 접수 용지 또 촬영하기</span>
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          /* Photo Preview Card */
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[380px] flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt="촬영된 접수 용지"
                className="max-h-[360px] w-auto object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={handleResetForNext}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 text-white text-xs backdrop-blur-xs border border-white/20"
                title="다시 촬영"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 촬영</span>
              </button>

              <button
                type="button"
                onClick={handleSendToPC}
                disabled={isSending}
                className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-98 transition-all"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>PC로 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-yellow-300" />
                    <span>PC로 즉시 전송</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Initial Trigger Screen */
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 text-center space-y-6 shadow-xl">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
              <Camera className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">
                접수 용지 바로 촬영하기
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                카메라 버튼을 누르면 스마트폰 카메라가 열립니다. 종이 주소를 반사 없이 똑바로 촬영해주세요.
              </p>
            </div>

            <button
              type="button"
              id="btn-mobile-take-photo"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 cursor-pointer active:scale-98 transition-all"
            >
              <Camera className="w-5 h-5 text-yellow-300" />
              <span>사진 촬영 시작</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="text-center text-[11px] text-slate-500 pb-2 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>실시간 암호화 무선 세션 연결됨</span>
        </div>
        <p>촬영 즉시 PC 화면에 전송되며 스마트폰에 영구 저장되지 않습니다.</p>
      </footer>
    </div>
  );
};
