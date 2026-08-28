import React from 'react';
import { TicketCheckInResponse } from '../../types/staff';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Monitor,
  Armchair,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ScanResultCardProps {
  result: TicketCheckInResponse | null;
  onNextScan: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  result,
  onNextScan,
}) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-[#161b22] rounded-3xl border border-slate-800/80 p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
          <ShieldCheck className="w-7 h-7 text-slate-600" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-white text-sm">Sẵn Sàng Soát Vé</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Quét mã QR từ vé điện tử của khách hoặc nhập mã vé thủ công bên dưới.
          </p>
        </div>
      </div>
    );
  }

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • ${d.toLocaleDateString('vi-VN')}`;
  };

  const formatShowtime = () => {
    const startStr = result.showtimeStart || result.startTime;
    if (!startStr) return '—';
    const sDate = new Date(startStr);
    const sTime = sDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = sDate.toLocaleDateString('vi-VN');

    const endStr = result.showtimeEnd || result.endTime;
    if (endStr) {
      const eDate = new Date(endStr);
      const eTime = eDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      return `${sTime} - ${eTime} • ${dateStr}`;
    }
    return `${sTime} • ${dateStr}`;
  };

  const isAlreadyCheckedIn = result.message?.toLowerCase().includes('đã') || result.message?.toLowerCase().includes('used');

  return (
    <div
      className={`flex flex-col h-full rounded-3xl border p-5 shadow-2xl transition-all duration-200 animate-in zoom-in-95 select-none ${
        result.valid
          ? 'bg-gradient-to-b from-emerald-950/40 via-[#161b22] to-[#11161d] border-emerald-500/60 shadow-emerald-500/10'
          : isAlreadyCheckedIn
          ? 'bg-gradient-to-b from-amber-950/40 via-[#161b22] to-[#11161d] border-amber-500/60 shadow-amber-500/10'
          : 'bg-gradient-to-b from-red-950/40 via-[#161b22] to-[#11161d] border-red-500/60 shadow-red-500/10'
      }`}
    >
      {/* Top Status Banner */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div
          className={`p-3 rounded-2xl border ${
            result.valid
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : isAlreadyCheckedIn
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-red-500/20 text-red-400 border-red-500/40'
          }`}
        >
          {result.valid ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : isAlreadyCheckedIn ? (
            <AlertTriangle className="w-8 h-8" />
          ) : (
            <XCircle className="w-8 h-8" />
          )}
        </div>

        <div>
          <span
            className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
              result.valid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isAlreadyCheckedIn
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-red-500/20 text-red-300 border-red-500/40'
            }`}
          >
            {result.valid
              ? 'VÉ HỢP LỆ'
              : isAlreadyCheckedIn
              ? 'VÉ ĐÃ SỬ DỤNG'
              : 'VÉ KHÔNG HỢP LỆ'}
          </span>
          <h3 className="text-base font-black text-white mt-1 leading-tight">
            {result.message}
          </h3>
        </div>
      </div>

      {/* Ticket Details Body (If valid or has info) */}
      <div className="flex-1 py-4 space-y-3.5 text-xs overflow-y-auto">
        {result.movieTitle ? (
          <div className="space-y-3 bg-[#0d1117] rounded-2xl p-4 border border-slate-800">
            {/* Movie Title & Room */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Phim Chiếu
              </p>
              <h4 className="text-base font-black text-white mt-0.5">
                {result.movieTitle}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5" />
                  {result.roomName}
                </span>
                {result.screenType && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-black border border-slate-700 uppercase">
                    {result.screenType}
                  </span>
                )}
              </div>
            </div>

            {/* Seat & Showtime Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
              {/* Seat Info */}
              <div className="p-2.5 bg-[#161b22] rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <Armchair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VỊ TRÍ GHẾ</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-lg font-black text-emerald-400">
                    {result.seatCode || '—'}
                  </span>
                  {result.seatType && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      ({result.seatType})
                    </span>
                  )}
                </div>
              </div>

              {/* Showtime Info */}
              <div className="p-2.5 bg-[#161b22] rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>SUẤT CHIẾU</span>
                </div>
                <p className="text-xs font-black text-amber-300 mt-1">
                  {formatShowtime()}
                </p>
              </div>
            </div>

            {/* Check-in Meta Info */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              {result.ticketCode && (
                <div className="flex justify-between">
                  <span>Mã vé:</span>
                  <span className="font-mono font-bold text-white">{result.ticketCode}</span>
                </div>
              )}
              {result.customerName && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> Khách hàng:
                  </span>
                  <span className="font-bold text-white">{result.customerName}</span>
                </div>
              )}
              {result.checkedInAt && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Soát vé lúc:</span>
                  <span>{formatDateTime(result.checkedInAt)}</span>
                </div>
              )}
              {result.staffName && (
                <div className="flex justify-between">
                  <span>Nhân viên soát:</span>
                  <span className="font-semibold text-slate-300">{result.staffName}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#0d1117] rounded-2xl border border-slate-800 text-center space-y-2 text-slate-400">
            <p className="text-xs font-semibold">
              Mã vé không khớp với bất kỳ vé hợp lệ nào trong cơ sở dữ liệu rạp.
            </p>
            <p className="text-[11px] text-slate-500">
              Vui lòng kiểm tra lại vé trên ứng dụng của khách hoặc hướng dẫn khách liên hệ quầy POS.
            </p>
          </div>
        )}
      </div>

      {/* Next Scan Action Button */}
      <button
        onClick={onNextScan}
        className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer shrink-0"
      >
        <span>TIẾP TỤC QUÉT VÉ TIẾP THEO</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
