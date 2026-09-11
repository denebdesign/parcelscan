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
  Info,
  Loader2,
  Smartphone,
  QrCode,
  Download,
  RefreshCw
} from 'lucide-react';
import { generateSampleA4ImageDataUrl, downloadBlankA4TemplateImage } from '../data/sampleTemplates';
import { MobileSyncModal } from './MobileSyncModal';
import { AdBanner } from './AdBanner';
import { optimizeImageForOcr, rotateImage } from '../utils/imageCompressor';

interface ScanUploadViewProps {
  onScanImage: (base64Data: string, mimeType: string) => Promise<void>;
  onLoadSample: () => void;
  isScanning: boolean;
  scanStepText: string;
  scanError?: { message: string; lastImage?: { base64: string; mime: string } } | null;
  onClearError?: () => void;
}

export const ScanUploadView: React.FC<ScanUploadViewProps> = ({
  onScanImage,
  onLoadSample,
  isScanning,
  scanStepText,
  scanError,
  onClearError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRotate = async (degrees: number) => {
    if (!previewUrl || isRotating || isScanning) return;
    setIsRotating(true);
    try {
      const rotated = await rotateImage(previewUrl, degrees);
      setPreviewUrl(rotated.base64);
    } catch (err) {
      console.error('Image rotate error:', err);
    } finally {
      setIsRotating(false);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WebP 등)만 업로드 가능합니다.');
      return;
    }
    if (onClearError) onClearError();
    setSelectedFile(file);
    setIsCompressing(true);

    try {
      const optimized = await optimizeImageForOcr(file, 2048, 2048, 0.85);
      setPreviewUrl(optimized.base64);
    } catch (err) {
      console.error('Image compression error:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  // Mobile Sync Photo Received
  const handleMobilePhotoReceived = async (imageBase64: string, mimeType: string) => {
    if (onClearError) onClearError();
    setPreviewUrl(imageBase64);
    // Automatically trigger AI extraction for smooth instant workflow
    await onScanImage(imageBase64, mimeType);
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
        setPreviewUrl(optimized.base64);
      } catch {
        setPreviewUrl(rawDataUrl);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!previewUrl) return;
    if (onClearError) onClearError();
    const mimeType = previewUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    await onScanImage(previewUrl, mimeType);
  };

  const handleLoadSampleA4 = () => {
    if (onClearError) onClearError();
    const sampleDataUrl = generateSampleA4ImageDataUrl();
    setPreviewUrl(sampleDataUrl);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Mobile QR Sync Modal */}
      <MobileSyncModal
        isOpen={isMobileSyncOpen}
        onClose={() => setIsMobileSyncOpen(false)}
        onPhotoReceived={handleMobilePhotoReceived}
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
          스마트폰 카메라로 찍어 PC로 즉시 전송하거나, 사진 파일을 선택해주세요. AI가 칸별로 분할하여 전산화합니다.
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
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
        ) : previewUrl ? (
          /* Image Selected / Ready to Scan */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 p-2 max-h-[520px] flex items-center justify-center">
              <img
                src={previewUrl}
                alt="업로드된 택배 접수 용지"
                className={`max-h-[460px] w-auto object-contain rounded-xl shadow-xs transition-opacity ${
                  isRotating ? 'opacity-40' : 'opacity-100'
                }`}
              />

              {/* Loading spinner while rotating */}
              {isRotating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-xs">
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>사진 회전 중...</span>
                  </div>
                </div>
              )}

              {/* Floating Rotation & Control Bar */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-md text-white p-1 rounded-xl shadow-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleRotate(-90)}
                    disabled={isRotating || isScanning}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="왼쪽(반시계)으로 90도 회전"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>좌회전 90°</span>
                  </button>
                  <div className="w-[1px] h-4 bg-white/20" />
                  <button
                    type="button"
                    onClick={() => handleRotate(90)}
                    disabled={isRotating || isScanning}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="오른쪽(시계방향)으로 90도 회전"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>우회전 90°</span>
                  </button>
                </div>

                <button
                  onClick={() => setPreviewUrl(null)}
                  disabled={isRotating || isScanning}
                  className="pointer-events-auto p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-lg border border-white/10 cursor-pointer disabled:opacity-50"
                  title="사진 지우고 다시 선택"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rotation helper banner */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/80 border border-blue-200/70 text-[11px] text-blue-800">
              <Info className="w-4 h-4 shrink-0 text-blue-600" />
              <span>
                <strong>방향 안내:</strong> 스마트폰으로 가로 촬영되어 용지가 옆으로 누워 있다면, 상단의 <strong>[우회전 90°]</strong> 버튼을 눌러 글씨가 똑바로 보이게 세워주세요. 주소와 칸 인식이 훨씬 완벽해집니다!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setPreviewUrl(null)}
                disabled={isScanning}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                다른 사진 선택
              </button>

              <button
                id="btn-execute-ai-scan"
                onClick={handleStartAnalysis}
                disabled={isScanning}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{scanStepText || 'AI 주소 인식 중...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>AI 자동 인식 및 전산화 시작</span>
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
                  스마트폰으로 QR코드를 찍고 사진을 찍으면 PC 화면에 실시간으로 자동 업로드됩니다.
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
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">또는 파일/웹캠 직접 선택</span>
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
                <span className="whitespace-nowrap">사진 파일 선택</span>
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
              <Download className="w-3 h-3" />
              <span>양식 다운로드</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            농가, 과수원, 취급점, 매장에서 고객 수기 접수 시 아래 표준 양식을 작성해 촬영하면 AI가 99% 이상 높은 정확도로 자동 인식합니다.
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
              <span><strong>전화번호 하이픈 자동 포맷:</strong> 01012345678 → 010-1234-5678</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><strong>기본주소/상세주소 자동 분리:</strong> 도로명과 동·호수 자동 정제</span>
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

