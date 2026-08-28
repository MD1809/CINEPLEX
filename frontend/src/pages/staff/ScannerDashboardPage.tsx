import React, { useState } from 'react';
import { staffApi } from '../../api/staffApi';
import { TicketCheckInResponse } from '../../types/staff';
import { CameraQrReader } from '../../components/scanner/CameraQrReader';
import { ScanResultCard } from '../../components/scanner/ScanResultCard';
import { audioFeedback } from '../../utils/audioFeedback';
import {
  ScanLine,
  Keyboard,
  History,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

interface ScanHistoryItem {
  id: string;
  result: TicketCheckInResponse;
  timestamp: string;
}

export const ScannerDashboardPage: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<TicketCheckInResponse | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Auto-resume camera scanning after 5s
  React.useEffect(() => {
    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPaused]);

  const handleCheckIn = async (codeOrToken: string) => {
    if (!codeOrToken.trim() || isProcessing) return;

    setIsProcessing(true);
    setIsPaused(true);

    try {
      const res = await staffApi.checkInTicket({
        tokenOrCode: codeOrToken.trim(),
        qrCodeTokenOrTicketCode: codeOrToken.trim(),
      });

      if (res.data) {
        const resultData = res.data;
        setCurrentResult(resultData);

        // Sound feedback
        if (soundEnabled) {
          if (resultData.valid) {
            audioFeedback.playSuccess();
          } else {
            const isUsed =
              resultData.message?.toLowerCase().includes('đã') ||
              resultData.message?.toLowerCase().includes('used') ||
              resultData.message?.includes('CHECK-IN');
            if (isUsed) {
              audioFeedback.playWarning();
            } else {
              audioFeedback.playError();
            }
          }
        }

        // Push to history
        const historyEntry: ScanHistoryItem = {
          id: Math.random().toString(),
          result: resultData,
          timestamp: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };
        setScanHistory((prev) => [historyEntry, ...prev.slice(0, 19)]); // keep last 20

        if (resultData.valid) {
          toast.success(resultData.message);
        } else {
          toast.error(resultData.message);
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Lỗi khi soát vé';
      const errorResult: TicketCheckInResponse = {
        valid: false,
        message: errMsg,
      };
      setCurrentResult(errorResult);
      if (soundEnabled) {
        const isUsed = errMsg.toLowerCase().includes('đã') || errMsg.toLowerCase().includes('used');
        if (isUsed) {
          audioFeedback.playWarning();
        } else {
          audioFeedback.playError();
        }
      }
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
      setManualCode('');
    }
  };

  const handleNextScan = () => {
    setCurrentResult(null);
    setIsPaused(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCheckIn(manualCode.trim());
    }
  };

  // Stats calculation
  const totalScans = scanHistory.length;
  const validScans = scanHistory.filter((s) => s.result.valid).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] text-slate-100 overflow-hidden select-none p-4 space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wide">
              Cổng Soát Vé Trực Tuyến (Live QR Scanner)
            </h1>
            <p className="text-[11px] text-slate-400">
              Kiểm tra tính hợp lệ và xác nhận vào cửa cho khách hàng
            </p>
          </div>
        </div>

        {/* Audio Toggle & Session Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161b22] border border-slate-800 text-xs">
            <span className="text-slate-400">Đã soát phiên này:</span>
            <span className="font-black text-emerald-400">{validScans}</span>
            <span className="text-slate-500">/</span>
            <span className="font-bold text-white">{totalScans}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 2-Column Workstation Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Camera Viewport & Manual Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full space-y-3 overflow-hidden">
          {/* Camera Scanner Viewport */}
          <div className="flex-1 overflow-hidden">
            <CameraQrReader
              onScanSuccess={handleCheckIn}
              isPaused={isPaused || isProcessing}
            />
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={handleManualSubmit}
            className="bg-[#161b22] rounded-2xl border border-slate-800 p-3.5 flex items-center gap-2 shrink-0 shadow-lg"
          >
            <div className="p-2 rounded-xl bg-[#0d1117] border border-slate-800 text-slate-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Hoặc nhập mã vé thủ công (VD: TK-20260828-XXXX)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || isProcessing}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                manualCode.trim() && !isProcessing
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isProcessing ? 'Đang kiểm tra...' : 'Kiểm Tra Vé'}
            </button>
          </form>
        </div>

        {/* Right Column: Scan Result Card & Recent History Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-3 overflow-hidden">
          {/* Active Result Card (60% height) */}
          <div className="h-3/5 overflow-hidden">
            <ScanResultCard
              result={currentResult}
              onNextScan={handleNextScan}
            />
          </div>

          {/* Recent Scanned Log Stream (40% height) */}
          <div className="h-2/5 bg-[#161b22] rounded-3xl border border-slate-800/80 p-3.5 flex flex-col overflow-hidden shadow-xl select-none">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Lịch Sử Soát Vé Phiên Này</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {scanHistory.length} lượt
              </span>
            </div>

            {/* Stream List */}
            <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-1">
              {scanHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-1">
                  <p className="text-xs font-bold">Chưa có lượt quét nào</p>
                  <p className="text-[10px]">Lịch sử các vé vừa soát sẽ xuất hiện tại đây</p>
                </div>
              ) : (
                scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-[#0d1117] rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.result.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">
                          {item.result.movieTitle || item.result.ticketCode || 'Mã không xác định'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.result.seatCode ? `Ghế ${item.result.seatCode} • ` : ''}
                          {item.result.roomName || item.result.message}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
