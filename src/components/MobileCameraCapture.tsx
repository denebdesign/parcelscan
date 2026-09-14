import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  RotateCw,
  ArrowUpDown,
  Send, 
  Sparkles, 
  Monitor, 
  Smartphone,
  Loader2,
  ShieldCheck,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { optimizeImageForOcr, rotateImage, flipImage, autoDetectAndStraightenImage } from '../utils/imageCompressor';

interface MobileCameraCaptureProps {
  sessionId: string;
}

interface CapturedPhoto {
  id: string;
  base64: string;
  mimeType: string;
}

export const MobileCameraCapture: React.FC<MobileCameraCaptureProps> = ({ sessionId }) => {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isStraightening, setIsStraightening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoScanOnPC, setAutoScanOnPC] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePhoto = photos[activeIndex] || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 선택 가능합니다.');
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);
      setStatusMessage(null);

      try {
        const optimized = await optimizeImageForOcr(file, 2048, 2048, 0.85);
        const newPhoto: CapturedPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          base64: optimized.base64,
          mimeType: optimized.mimeType,
        };
        setPhotos((prev) => [...prev, newPhoto]);
        setActiveIndex(photos.length); // switch to newly added photo
        setIsSuccess(false);
      } catch (err: any) {
        console.error('Image optimization error:', err);
        setErrorMessage('이미지를 처리하는 중 오류가 발생했습니다. 다시 촬영해주세요.');
      } finally {
        setIsProcessing(false);
        // Reset file input so the same file or a new shot can trigger onChange
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Rotation handler
  const handleRotate = async (degrees: number) => {
    if (!activePhoto || isRotating || isStraightening) return;
    setIsRotating(true);
    setErrorMessage(null);
    try {
      const result = await rotateImage(activePhoto.base64, degrees);
      setPhotos((prev) =>
        prev.map((p, idx) =>
          idx === activeIndex
            ? { ...p, base64: result.base64, mimeType: result.mimeType }
            : p
        )
      );
    } catch (err) {
      console.error('Rotate error:', err);
      setErrorMessage('사진 회전 중 오류가 발생했습니다.');
    } finally {
      setIsRotating(false);
    }
  };

  // Flip vertical / upside down
  const handleFlipVertical = async () => {
    if (!activePhoto || isRotating || isStraightening) return;
    setIsRotating(true);
    setErrorMessage(null);
    try {
      const result = await flipImage(activePhoto.base64, 'vertical');
      setPhotos((prev) =>
        prev.map((p, idx) =>
          idx === activeIndex
            ? { ...p, base64: result.base64, mimeType: result.mimeType }
            : p
        )
      );
    } catch (err) {
      console.error('Flip error:', err);
      setErrorMessage('사진 상하 반전 중 오류가 발생했습니다.');
    } finally {
      setIsRotating(false);
    }
  };

  // AI Auto-Straighten
  const handleAutoStraighten = async () => {
    if (!activePhoto || isRotating || isStraightening) return;
    setIsStraightening(true);
    setErrorMessage(null);
    setStatusMessage('AI가 글씨 방향을 분석하고 있습니다...');
    try {
      const result = await autoDetectAndStraightenImage(activePhoto.base64, activePhoto.mimeType);
      if (result.rotationApplied > 0) {
        setPhotos((prev) =>
          prev.map((p, idx) =>
            idx === activeIndex
              ? { ...p, base64: result.base64, mimeType: result.mimeType }
              : p
          )
        );
        setStatusMessage(`✨ ${result.description || `${result.rotationApplied}° 회전하여 바로잡았습니다.`}`);
      } else {
        setStatusMessage('✨ 이미 글씨가 정상 정방향으로 바르게 서 있습니다.');
      }
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Auto straighten error:', err);
      setErrorMessage('AI 자동 방향 감지 중 지연이 발생했습니다. 상단 회전 버튼으로 직접 맞춰주세요.');
    } finally {
      setIsStraightening(false);
    }
  };

  const handleDeletePhoto = (indexToDelete: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToDelete);
    setPhotos(updated);
    if (activeIndex >= updated.length) {
      setActiveIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSendToPC = async () => {
    if (photos.length === 0) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const payload = {
        sessionId,
        images: photos.map((p) => ({ imageBase64: p.base64, mimeType: p.mimeType })),
        imageBase64: photos[0].base64,
        mimeType: photos[0].mimeType,
        autoScan: autoScanOnPC,
      };

      const response = await fetch('/api/mobile-sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    setPhotos([]);
    setActiveIndex(0);
    setIsSuccess(false);
    setErrorMessage(null);
    setStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-3.5 sm:p-5 max-w-lg mx-auto">
      {/* Top Header */}
      <header className="space-y-1.5 text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>모바일 무선 연동 촬영</span>
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">
          택배스캔 모바일 카메라
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span>연동 세션: <strong className="text-blue-400 font-mono tracking-wider">{sessionId}</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-3 space-y-3">
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
          <div className="bg-slate-800/95 border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white">PC로 전송 완료!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                총 <strong className="text-emerald-400 font-bold">{photos.length}장</strong>의 접수 용지 사진이 PC 화면으로 전송되었습니다.
              </p>
              {autoScanOnPC ? (
                <p className="text-[11px] text-blue-300 bg-blue-950/60 border border-blue-500/30 rounded-xl py-1.5 px-3 inline-block">
                  ⚡ PC 화면에서 AI 자동 인식이 즉시 시작되었습니다.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 bg-slate-900/60 border border-slate-700/60 rounded-xl py-1.5 px-3 inline-block">
                  🖥️ PC 화면에서 각 사진 확인 및 회전 후 [AI 자동 인식 시작] 버튼을 누르시면 됩니다.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700/80 space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleResetForNext();
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>추가 접수 용지 새로 촬영하기</span>
              </button>
            </div>
          </div>
        ) : photos.length > 0 && activePhoto ? (
          /* Photo Preview & Edit Card */
          <div className="space-y-3">
            {/* Multi-Photo Thumbnails Tab (if more than 1 photo or to add more) */}
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>촬영된 용지 ({activeIndex + 1}/{photos.length}장)</span>
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isSending}
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 다음 장 추가 촬영</span>
              </button>
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-thin">
                {photos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === activeIndex
                        ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.base64} alt={`용지 ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-white font-bold text-center">
                      {idx + 1}장
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Active Image Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[340px] flex items-center justify-center p-2">
              <img
                src={activePhoto.base64}
                alt="촬영된 접수 용지"
                className={`max-h-[320px] w-auto object-contain rounded-xl transition-opacity duration-150 ${
                  isRotating || isStraightening ? 'opacity-30' : 'opacity-100'
                }`}
              />

              {/* Busy Spinner */}
              {(isRotating || isStraightening) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <div className="flex items-center gap-2 bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/10">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>{isStraightening ? 'AI 각도 보정 중...' : '사진 회전 중...'}</span>
                  </div>
                </div>
              )}

              {/* Delete Active Photo button */}
              <button
                type="button"
                onClick={() => handleDeletePhoto(activeIndex)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs backdrop-blur-xs border border-red-500/30 transition-colors cursor-pointer"
                title="이 사진 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Rotation & Straighten Action Toolbar (Touch-Optimized) */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span>방향 조정 (글씨가 바르게 서 있어야 정확히 인식됩니다)</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate(-90)}
                  disabled={isRotating || isStraightening || isSending}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-50"
                  title="왼쪽 90도 회전"
                >
                  <RotateCcw className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] whitespace-nowrap">좌회전 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRotate(90)}
                  disabled={isRotating || isStraightening || isSending}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-50"
                  title="오른쪽 90도 회전"
                >
                  <RotateCw className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] whitespace-nowrap">우회전 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlipVertical}
                  disabled={isRotating || isStraightening || isSending}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-50"
                  title="위아래 상하 반전"
                >
                  <ArrowUpDown className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] whitespace-nowrap">상하 반전</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoStraighten}
                  disabled={isRotating || isStraightening || isSending}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 active:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-50"
                  title="AI가 자동으로 글씨를 감지해 똑바로 세웁니다"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] whitespace-nowrap">AI 자동맞춤</span>
                </button>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs text-center font-medium animate-in fade-in">
                  {statusMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* PC Auto-Scan Toggle Checkbox */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
              <label htmlFor="chk-autoscan" className="text-xs text-slate-300 cursor-pointer flex items-center gap-2">
                <input
                  id="chk-autoscan"
                  type="checkbox"
                  checked={autoScanOnPC}
                  onChange={(e) => setAutoScanOnPC(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                />
                <span>PC 전송 즉시 AI 자동인식 시작</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {autoScanOnPC ? '전송 후 바로 전산화' : 'PC에서 확인 후 시작'}
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <Camera className="w-4 h-4 text-blue-400" />
                <span>다음 장 추가 촬영</span>
              </button>

              <button
                type="button"
                id="btn-mobile-send-to-pc"
                onClick={handleSendToPC}
                disabled={isSending || photos.length === 0}
                className="min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-98 transition-all"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>PC로 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-yellow-300" />
                    <span>PC로 전송 ({photos.length}장)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Initial Trigger Screen */
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 text-center space-y-6 shadow-xl">
            {isProcessing ? (
              <div className="py-12 space-y-3 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                <h3 className="text-base font-bold text-white">사진 최적화 중...</h3>
                <p className="text-xs text-slate-400">초고속 OCR 전송을 위해 이미지를 최적 규격으로 처리하고 있습니다.</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
                  <Camera className="w-10 h-10" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white">
                    접수 용지 바로 촬영하기
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    스마트폰 카메라로 종이 접수 용지를 촬영하세요. 여러 장을 연속으로 촬영하여 한 번에 PC로 전송할 수도 있습니다.
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
              </>
            )}
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

