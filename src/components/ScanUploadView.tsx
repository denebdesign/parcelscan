import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  FileText, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  ArrowUpDown,
  ArrowLeftRight,
  Info,
  Loader2,
  Smartphone,
  QrCode,
  Download,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { generateSampleA4ImageDataUrl, downloadBlankA4TemplateImage } from '../data/sampleTemplates';
import { MobileSyncModal, MobileReceivedImage } from './MobileSyncModal';
import { AdBanner } from './AdBanner';
import { optimizeImageForOcr, rotateImage, flipImage, autoDetectAndStraightenImage } from '../utils/imageCompressor';

interface UploadedPhoto {
  id: string;
  base64: string;
  mimeType: string;
}

interface ScanUploadViewProps {
  onScanImage: (base64Data: string, mimeType: string) => Promise<void>;
  onScanImages?: (images: Array<{ base64: string; mimeType: string }>) => Promise<void>;
  onLoadSample: () => void;
  isScanning: boolean;
  scanStepText: string;
  scanError?: { message: string; lastImage?: { base64: string; mime: string } } | null;
  onClearError?: () => void;
}

export const ScanUploadView: React.FC<ScanUploadViewProps> = ({
  onScanImage,
  onScanImages,
  onLoadSample,
  isScanning,
  scanStepText,
  scanError,
  onClearError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isStraightening, setIsStraightening] = useState(false);
  const [straightenStatus, setStraightenStatus] = useState<string | null>(null);
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const appendFileInputRef = useRef<HTMLInputElement | null>(null);

  const activePhoto = photos[activePhotoIndex] || null;

  // Rotation handler
  const handleRotate = async (degrees: number) => {
    if (!activePhoto || isRotating || isStraightening || isScanning) return;
    setIsRotating(true);
    setStraightenStatus(null);
    try {
      const rotated = await rotateImage(activePhoto.base64, degrees);
      setPhotos((prev) =>
        prev.map((p, idx) =>
          idx === activePhotoIndex
            ? { ...p, base64: rotated.base64, mimeType: rotated.mimeType }
            : p
        )
      );
    } catch (err) {
      console.error('Image rotate error:', err);
    } finally {
      setIsRotating(false);
    }
  };

  // Flip handler (horizontal or vertical)
  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    if (!activePhoto || isRotating || isStraightening || isScanning) return;
    setIsRotating(true);
    setStraightenStatus(null);
    try {
      const flipped = await flipImage(activePhoto.base64, direction);
      setPhotos((prev) =>
        prev.map((p, idx) =>
          idx === activePhotoIndex
            ? { ...p, base64: flipped.base64, mimeType: flipped.mimeType }
            : p
        )
      );
    } catch (err) {
      console.error('Image flip error:', err);
    } finally {
      setIsRotating(false);
    }
  };

  // AI Auto-Straighten
  const handleAutoStraighten = async () => {
    if (!activePhoto || isRotating || isStraightening || isScanning) return;
    setIsStraightening(true);
    setStraightenStatus('AI가 사진 내 텍스트 방향을 분석하고 있습니다...');
    try {
      const result = await autoDetectAndStraightenImage(activePhoto.base64, activePhoto.mimeType);
      if (result.rotationApplied > 0) {
        setPhotos((prev) =>
          prev.map((p, idx) =>
            idx === activePhotoIndex
              ? { ...p, base64: result.base64, mimeType: result.mimeType }
              : p
          )
        );
        setStraightenStatus(`✨ ${result.description || `${result.rotationApplied}° 회전하여 바로잡았습니다.`}`);
      } else {
        setStraightenStatus('✨ 이미 글씨가 정상 정방향으로 바르게 서 있습니다.');
      }
      setTimeout(() => setStraightenStatus(null), 3500);
    } catch (err: any) {
      console.error('Auto straighten error:', err);
      setStraightenStatus('방향 감지 중 지연이 발생했습니다. 상단 회전 버튼으로 직접 맞춰주세요.');
    } finally {
      setIsStraightening(false);
    }
  };

  // Delete a specific photo
  const handleDeletePhoto = (indexToDelete: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToDelete);
    setPhotos(updated);
    if (activePhotoIndex >= updated.length) {
      setActivePhotoIndex(Math.max(0, updated.length - 1));
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const processFiles = async (fileList: File[]) => {
    const imageFiles = fileList.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('이미지 파일(JPG, PNG, WebP 등)만 업로드 가능합니다.');
      return;
    }
    if (onClearError) onClearError();
    setIsCompressing(true);

    try {
      const optimizedList: UploadedPhoto[] = [];
      for (const file of imageFiles) {
        try {
          const optimized = await optimizeImageForOcr(file, 2048, 2048, 0.85);
          optimizedList.push({
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            base64: optimized.base64,
            mimeType: optimized.mimeType,
          });
        } catch (err) {
          console.error('File optimization error:', err);
        }
      }

      if (optimizedList.length > 0) {
        setPhotos((prev) => [...prev, ...optimizedList]);
      }
    } finally {
      setIsCompressing(false);
    }
  };

  // Mobile Sync Photo Received (can receive multiple photos)
  const handleMobilePhotosReceived = async (receivedImages: MobileReceivedImage[], autoScan: boolean) => {
    if (onClearError) onClearError();

    const newPhotos: UploadedPhoto[] = receivedImages.map((img, idx) => ({
      id: `mobile-${Date.now()}-${idx}`,
      base64: img.base64,
      mimeType: img.mimeType || 'image/jpeg',
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    setActivePhotoIndex((prev) => (photos.length === 0 ? 0 : prev));

    if (autoScan) {
      // Trigger AI scan immediately if user explicitly enabled it on mobile
      const allToScan = [...photos, ...newPhotos].map((p) => ({ base64: p.base64, mimeType: p.mimeType }));
      if (onScanImages) {
        await onScanImages(allToScan);
      } else {
        await onScanImage(allToScan[0].base64, allToScan[0].mimeType);
      }
    }
  };

  // Start Camera handler
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      stopCamera();

      setIsCompressing(true);
      try {
        const optimized = await optimizeImageForOcr(rawDataUrl, 2048, 2048, 0.85);
        setPhotos((prev) => [
          ...prev,
          {
            id: `webcam-${Date.now()}`,
            base64: optimized.base64,
            mimeType: optimized.mimeType,
          },
        ]);
      } catch {
        setPhotos((prev) => [
          ...prev,
          {
            id: `webcam-${Date.now()}`,
            base64: rawDataUrl,
            mimeType: 'image/jpeg',
          },
        ]);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (photos.length === 0) return;
    if (onClearError) onClearError();

    const payload = photos.map((p) => ({
      base64: p.base64,
      mimeType: p.mimeType,
    }));

    if (onScanImages) {
      await onScanImages(payload);
    } else {
      await onScanImage(payload[0].base64, payload[0].mimeType);
    }
  };

  const handleLoadSampleA4 = () => {
    if (onClearError) onClearError();
    const sampleDataUrl = generateSampleA4ImageDataUrl();
    setPhotos([
      {
        id: `sample-${Date.now()}`,
        base64: sampleDataUrl,
        mimeType: 'image/jpeg',
      },
    ]);
    setActivePhotoIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Mobile QR Sync Modal */}
      <MobileSyncModal
        isOpen={isMobileSyncOpen}
        onClose={() => setIsMobileSyncOpen(false)}
        onPhotoReceived={handleMobilePhotosReceived}
      />

      {/* Hidden file input for adding more photos */}
      <input
        ref={appendFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <Camera className="w-3.5 h-3.5" />
          <span>주소 용지 또는 자유 송장 촬영</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          종이 접수 용지 사진 촬영 또는 업로드
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          스마트폰 카메라로 찍어 PC로 전송하거나, 사진을 직접 선택하세요. 여러 장을 한 번에 등록하여 전산화할 수 있습니다.
        </p>
      </div>

      {/* Scan Error Display Banner with Retry */}
      {scanError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-sm">주소 인식 중 지연/오류 발생</h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{scanError.message}</p>
            </div>
          </div>
          {scanError.lastImage && (
            <button
              type="button"
              onClick={() => onScanImage(scanError.lastImage!.base64, scanError.lastImage!.mime)}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>다시 시도</span>
            </button>
          )}
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
        {isCompressing ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">고화질 사진 최적화 중...</p>
            <p className="text-xs text-slate-400">초고속 AI 인식을 위해 이미지를 최적 규격으로 변환하고 있습니다.</p>
          </div>
        ) : cameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Guide Overlay for A4 paper */}
            <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-white/80 text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                A4 용지를 사각형 안내선에 맞춰주세요
              </span>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-semibold backdrop-blur-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                촬영하기
              </button>
            </div>
          </div>
        ) : photos.length > 0 && activePhoto ? (
          /* Images Selected / Ready to Scan */
          <div className="space-y-4">
            {/* Top Multi-Sheet Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap pl-1">
                  접수 용지 ({photos.length}장):
                </span>
                {photos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      idx === activePhotoIndex
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{idx + 1}번 용지</span>
                    {photos.length > 1 && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(idx);
                        }}
                        className="hover:text-red-300 transition-colors"
                        title="이 용지 삭제"
                      >
                        ×
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Add more photos button */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => appendFileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 용지 추가</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileSyncOpen(true)}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>스마트폰 촬영 추가</span>
                </button>
              </div>
            </div>

            {/* Photo View Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 p-2 max-h-[520px] flex items-center justify-center">
              <img
                src={activePhoto.base64}
                alt="업로드된 택배 접수 용지"
                className={`max-h-[460px] w-auto object-contain rounded-xl shadow-xs transition-opacity ${
                  isRotating || isStraightening ? 'opacity-30' : 'opacity-100'
                }`}
              />

              {/* Loading spinner while rotating / straightening */}
              {(isRotating || isStraightening) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-xs">
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>{isStraightening ? 'AI 텍스트 방향 분석 및 보정 중...' : '사진 회전 중...'}</span>
                  </div>
                </div>
              )}

              {/* Delete Active Photo button */}
              <button
                onClick={() => handleDeletePhoto(activePhotoIndex)}
                disabled={isRotating || isStraightening || isScanning}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-lg border border-white/10 cursor-pointer disabled:opacity-50"
                title="현재 사진 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* High-Contrast, Touch-Friendly Orientation Toolbar for both PC & Mobile */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-blue-600" />
                  <span>사진 방향 맞추기 ({activePhotoIndex + 1}번 용지)</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  글씨가 바르게 서 있어야 인식률이 100% 극대화됩니다
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  id="btn-rotate-left"
                  onClick={() => handleRotate(-90)}
                  disabled={isRotating || isStraightening || isScanning}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="왼쪽(반시계)으로 90도 회전"
                >
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">좌회전 90°</span>
                </button>

                <button
                  type="button"
                  id="btn-rotate-right"
                  onClick={() => handleRotate(90)}
                  disabled={isRotating || isStraightening || isScanning}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="오른쪽(시계방향)으로 90도 회전"
                >
                  <RotateCw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">우회전 90°</span>
                </button>

                <button
                  type="button"
                  id="btn-flip-vertical"
                  onClick={() => handleFlip('vertical')}
                  disabled={isRotating || isStraightening || isScanning}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="상하 뒤집힘 반전"
                >
                  <ArrowUpDown className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="whitespace-nowrap">상하 반전</span>
                </button>

                <button
                  type="button"
                  id="btn-flip-horizontal"
                  onClick={() => handleFlip('horizontal')}
                  disabled={isRotating || isStraightening || isScanning}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="좌우 거울 반전"
                >
                  <ArrowLeftRight className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="whitespace-nowrap">좌우 반전</span>
                </button>

                <button
                  type="button"
                  id="btn-auto-straighten"
                  onClick={handleAutoStraighten}
                  disabled={isRotating || isStraightening || isScanning}
                  className="col-span-2 sm:col-span-1 min-h-[44px] px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                  title="AI가 글씨를 인식하여 스스로 똑바로 세웁니다"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
                  <span className="whitespace-nowrap">AI 자동맞춤</span>
                </button>
              </div>

              {/* Straighten Status Feedback */}
              {straightenStatus && (
                <div className="p-2 rounded-xl bg-blue-100/80 border border-blue-200 text-blue-900 text-xs text-center font-semibold animate-in fade-in">
                  {straightenStatus}
                </div>
              )}
            </div>

            {/* Rotation helper banner */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900">
              <Info className="w-4 h-4 shrink-0 text-blue-600" />
              <span>
                <strong>방향 안내:</strong> 가로 촬영되어 용지가 누워 있다면 <strong>[우회전 90°]</strong> 또는 <strong>[AI 자동맞춤]</strong>을 눌러주세요. 또한 <strong>[+ 용지 추가]</strong>를 누르면 2번째, 3번째 용지도 한 번에 모아서 전산화할 수 있습니다.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setPhotos([]);
                  setActivePhotoIndex(0);
                }}
                disabled={isScanning}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                전체 초기화
              </button>

              <button
                id="btn-execute-ai-scan"
                onClick={handleStartAnalysis}
                disabled={isScanning || photos.length === 0}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{scanStepText || 'AI 주소 인식 중...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>AI 자동 인식 및 전산화 시작 (총 {photos.length}장)</span>
                  </>
                )}
              </button>
            </div>

            {/* In-stream Google Ad Banner when scanning is triggered */}
            {isScanning && (
              <div className="pt-3 animate-in fade-in duration-300">
                <AdBanner
                  variant="interstitial"
                  label="스폰서 광고 — 잠시만 기다려주세요"
                  className="bg-blue-50/50 border-blue-200"
                />
              </div>
            )}
          </div>
        ) : (
          /* Dropzone / Upload Area */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Primary Recommended Action: Mobile QR Instant Shoot */}
            <div className="max-w-md mx-auto mb-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-600/20 text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide backdrop-blur-xs">
                  <Smartphone className="w-3 h-3" />
                  <span>가장 편리한 방법</span>
                </div>
                <QrCode className="w-6 h-6 text-white/40" />
              </div>

              <div>
                <h4 className="text-base font-extrabold tracking-tight">
                  스마트폰 카메라로 찍어 PC로 즉시 전송
                </h4>
                <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                  스마트폰으로 QR코드를 찍고 사진을 찍으면 PC 화면에 실시간으로 자동 업로드됩니다. 여러 장 촬영 및 회전 조작도 가능합니다.
                </p>
              </div>

              <button
                type="button"
                id="btn-mobile-sync-qr"
                onClick={() => setIsMobileSyncOpen(true)}
                className="w-full h-11 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                <span>QR코드로 스마트폰 카메라 연결하기</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center max-w-md mx-auto">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">또는 파일/웹캠 직접 선택 (여러 장 가능)</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Sub Upload Action Buttons */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm sm:max-w-md mx-auto">
              <button
                type="button"
                id="btn-file-select"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">사진 파일 선택 (여러 장 가능)</span>
              </button>

              <button
                type="button"
                id="btn-camera-capture"
                onClick={startCamera}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs active:scale-98 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="whitespace-nowrap">PC 웹캠으로 촬영</span>
              </button>
            </div>

            {/* Quick Demo Previews & Template Download */}
            <div className="mt-8 pt-6 border-t border-slate-200/70">
              <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>표준 용지로 촬영하거나 샘플로 바로 테스트해보세요</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-sm sm:max-w-xl mx-auto">
                <button
                  type="button"
                  id="btn-sample-a4-image"
                  onClick={handleLoadSampleA4}
                  className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold shadow-2xs active:scale-98 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">택배스캔 용지 로드</span>
                </button>

                <button
                  type="button"
                  id="btn-download-scan-sheet"
                  onClick={async () => {
                    try {
                      setIsDownloadingTemplate(true);
                      await downloadBlankA4TemplateImage();
                    } finally {
                      setIsDownloadingTemplate(false);
                    }
                  }}
                  disabled={isDownloadingTemplate}
                  className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-2xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingTemplate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">양식 다운로드 (A4)</span>
                </button>

                <button
                  type="button"
                  id="btn-sample-direct-load"
                  onClick={onLoadSample}
                  className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="whitespace-nowrap">인식 결과 바로 보기</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide Card matching Blueprint 2 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Form Guide */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-900">손글씨 접수 권장 양식</h4>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsDownloadingTemplate(true);
                  await downloadBlankA4TemplateImage();
                } finally {
                  setIsDownloadingTemplate(false);
                }
              }}
              disabled={isDownloadingTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>양식 다운로드</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            농가, 과수원, 취급점, 매장에서 고객 수기 접수 시 아래 표준 양식을 작성해 촬영하면 AI가 99% 이상 높은 정확도로 자동 인식합니다. 달력 뒷면, 박스 조각, 구겨진 메모지도 자유롭게 인식 가능합니다.
          </p>
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1 font-mono">
            <div>① 보내는분 / 받는분 성함 및 연락처 (010-XXXX-XXXX)</div>
            <div>② 주소 (도로명) / 상세주소 (동/호수)</div>
            <div>③ 상품명 / 수량 (__박스)</div>
          </div>
        </div>

        {/* AI Processing Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-900">AI 전산화 자동 처리 기능</h4>
          </div>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><strong>사진 방향 자동 감지 및 보정:</strong> 90도 누운 사진, 거꾸로 뒤집힌 사진 자동 교정</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><strong>여러 장 일괄 전산화:</strong> 1번 용지, 2번 용지를 연속 촬영하여 한 번에 엑셀화</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><strong>택배사 엑셀 즉시 생성:</strong> CJ대한통운, 롯데, 한진, 우체국, 로젠 양식</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};


