import React, { useEffect, useRef, useState } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import {
  Camera,
  AlertCircle,
  ChevronDown,
  Upload,
  Power,
  Scan,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface CameraQrReaderProps {
  onScanSuccess: (decodedText: string) => void;
  isPaused: boolean;
}

export const CameraQrReader: React.FC<CameraQrReaderProps> = ({
  onScanSuccess,
  isPaused,
}) => {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  const qrRegionId = 'qr-reader-viewport';

  const formatCameraLabel = (rawLabel: string, index: number): string => {
    if (!rawLabel) return `Camera Laptop ${index > 0 ? index + 1 : ''}`.trim();
    const lower = rawLabel.toLowerCase();
    if (
      lower.includes('integrated') ||
      lower.includes('13d3:54b6') ||
      lower.includes('facetime') ||
      lower.includes('built-in')
    ) {
      return 'Camera Laptop';
    }
    if (lower.includes('front') || lower.includes('trước')) {
      return 'Camera Trước';
    }
    if (lower.includes('back') || lower.includes('sau') || lower.includes('rear')) {
      return 'Camera Sau';
    }
    const cleaned = rawLabel.replace(/\s*\([0-9a-fA-F]{4}:[0-9a-fA-F]{4}\)/g, '').trim();
    return cleaned || 'Camera Laptop';
  };

  // Discover available video input devices on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const camList = devices.map((d, index) => ({
            id: d.id,
            label: formatCameraLabel(d.label, index),
          }));
          setCameras(camList);

          // Prefer front camera / user facing / integrated webcam on laptop & PC
          const frontCam = camList.find((c) => {
            const lower = c.label.toLowerCase();
            return (
              lower.includes('laptop') ||
              lower.includes('front') ||
              lower.includes('trước') ||
              lower.includes('user') ||
              lower.includes('webcam')
            );
          });

          setSelectedCameraId(frontCam ? frontCam.id : camList[0].id);
        } else {
          setSelectedCameraId('user-default');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras', err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  // Handle active camera lifecycle
  useEffect(() => {
    if (isCameraActive && selectedCameraId) {
      // Allow slight tick for DOM layout readiness
      const timer = setTimeout(() => {
        startScanner(selectedCameraId);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isCameraActive, selectedCameraId]);

  const startScanner = async (cameraId: string) => {
    try {
      setCameraError(null);
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      // Check if container element exists in DOM with non-zero size
      const container = document.getElementById(qrRegionId);
      if (!container) {
        throw new Error('Khung hiển thị camera chưa sẵn sàng.');
      }

      const scanner = new Html5Qrcode(qrRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      // Full-frame scanning config (no tight cropping) for instant detection
      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
      };

      const cameraInput =
        cameraId === 'user-default' ? { facingMode: 'user' } : cameraId;

      await scanner.start(
        cameraInput,
        config,
        (decodedText) => {
          console.log('[QR Scanner] Successfully decoded QR code:', decodedText);
          if (!isPausedRef.current) {
            onScanSuccess(decodedText);
          }
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner', err);
      setCameraError(err.message || 'Không thể truy cập camera. Vui lòng cấp quyền truy cập Camera trên trình duyệt.');
      setIsScanning(false);
      setIsCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner', e);
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
  };

  const handleToggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      stopScanner();
    } else {
      setIsCameraActive(true);
    }
  };

  const handleSelectCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCameraId(e.target.value);
  };

  // Allow uploading QR image file to scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileScanner = new Html5Qrcode('qr-file-scanner-temp');
      const decodedText = await fileScanner.scanFile(file, true);
      if (decodedText) {
        console.log('[QR File] Decoded QR from file:', decodedText);
        onScanSuccess(decodedText);
      }
      fileScanner.clear();
    } catch (err: any) {
      console.error('Failed to scan file', err);
      toast.error('Không tìm thấy mã QR hợp lệ trong ảnh tải lên.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded-3xl border border-slate-800/80 p-4 shadow-xl select-none relative overflow-hidden">
      {/* Hidden temporary container for file scanning */}
      <div id="qr-file-scanner-temp" className="hidden" />

      {/* Header Bar with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm">Cổng Soát Vé Camera</h2>
            <p className="text-[10px] text-slate-400">
              {isCameraActive ? 'Camera Đang Quét Trực Tiếp' : 'Camera Đang Ở Trạng Thái Chờ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1117] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            title="Tải ảnh mã QR từ máy tính để quét"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Tải Ảnh QR</span>
          </button>

          {/* Camera Dropdown Selector */}
          {cameras.length > 0 && (
            <div className="relative">
              <select
                value={selectedCameraId}
                onChange={handleSelectCameraChange}
                className="appearance-none bg-[#0d1117] border border-slate-700/80 text-slate-200 text-xs font-bold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer max-w-[180px] truncate"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Turn On/Off Camera Toggle Button */}
          <button
            type="button"
            onClick={handleToggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isCameraActive
                ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isCameraActive ? 'Tắt Camera' : 'Bật Camera'}</span>
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-2 overflow-hidden rounded-2xl bg-black border border-slate-800 min-h-[320px]">
        {/* HTML5 QR Code Container (Always active in DOM with min dimensions) */}
        <div
          id={qrRegionId}
          className="w-full h-full min-h-[320px] flex items-center justify-center [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-2xl"
        />

        {/* Standby State (Overlay on Top when Camera is OFF) */}
        {!isCameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#161b22] via-[#0f141a] to-[#0d1117] flex flex-col items-center justify-center p-6 text-center space-y-4 z-10 select-none">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
                <Scan className="w-10 h-10 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-black text-white">
                Sẵn Sàng Quét Mã Soát Vé
              </h3>
              <p className="text-xs text-slate-400">
                Nhấn nút bên dưới để bật camera và bắt đầu tiếp nhận vé QR từ khách hàng.
              </p>
            </div>

            <button
              onClick={() => setIsCameraActive(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer tracking-wider uppercase"
            >
              <Camera className="w-4 h-4" />
              <span>BẮT ĐẦU QUÉT VÉ (BẬT CAMERA)</span>
            </button>
          </div>
        )}

        {/* Viewfinder Target Overlays & Laser Animation (When camera is active) */}
        {isCameraActive && isScanning && !cameraError && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Viewfinder Target Frame */}
            <div className="w-64 h-64 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Laser Scanning Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-bounce duration-1000 mt-30" />
            </div>

            {/* Waiting prompt banner */}
            <div className="absolute bottom-4 px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Đang chờ khách đưa mã vé QR vào khung quét...</span>
            </div>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#0d1117]/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white">Không thể kết nối Camera</h3>
            <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
            <button
              onClick={() => setIsCameraActive(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              Thử Lại
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
        {isCameraActive
          ? 'Đưa mã QR trên vé vào giữa khung ngắm để hệ thống tự động xác nhận'
          : 'Bật camera hoặc nhập mã vé thủ công ở ô bên dưới để soát vé'}
      </div>
    </div>
  );
};
