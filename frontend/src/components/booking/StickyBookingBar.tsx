import React from 'react';
import { Clock, AlertTriangle, ArrowRight, Film } from 'lucide-react';
import { SelectedSeat } from '../../types/booking';

interface StickyBookingBarProps {
  movieTitle: string;
  moviePosterUrl?: string;
  roomName: string;
  screenType: string;
  showtimeStr: string;
  selectedSeats: SelectedSeat[];
  totalAmount: number;
  formattedTime: string;
  isWarning: boolean;
  isExpired: boolean;
  onProceed: () => void;
  loading?: boolean;
}

export const StickyBookingBar: React.FC<StickyBookingBarProps> = ({
  movieTitle,
  moviePosterUrl,
  roomName,
  screenType,
  showtimeStr,
  selectedSeats,
  totalAmount,
  formattedTime,
  isWarning,
  isExpired,
  onProceed,
  loading = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasSeats = selectedSeats.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121317]/95 backdrop-blur-md border-t border-white/10 shadow-2xl py-3.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LEFT: Movie & Room summary */}
        <div className="flex items-center space-x-3.5 w-full md:w-auto">
          <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-white/10 hidden sm:block">
            {moviePosterUrl ? (
              <img src={moviePosterUrl} alt={movieTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate font-serif">
              {movieTitle}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-300">{roomName}</span>
              <span>&middot;</span>
              <span className="text-yellow-400 font-bold">{screenType}</span>
              <span>&middot;</span>
              <span>{showtimeStr}</span>
            </div>
          </div>
        </div>

        {/* MIDDLE: Selected Seats & Countdown Timer */}
        <div className="flex items-center justify-between md:justify-center w-full md:w-auto gap-4 sm:gap-6 border-y md:border-y-0 border-white/5 py-2 md:py-0">
          {/* Selected Seat Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs scrollbar-none">
            {hasSeats ? (
              selectedSeats.map((s) => (
                <span
                  key={s.id}
                  className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold"
                >
                  {s.seatCode}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Chưa chọn ghế nào</span>
            )}
          </div>

          {/* Sticky 5-Minute Countdown Timer */}
          {hasSeats && (
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${
                isExpired
                  ? 'bg-red-950/40 border-red-500/50 text-red-400 animate-pulse'
                  : isWarning
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 animate-bounce'
                  : 'bg-[#18191E] border-white/10 text-slate-200'
              }`}
            >
              {isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 text-red-500" />
              )}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-none">Thời gian giữ</span>
                <span className="font-mono text-sm font-black tracking-wider">{formattedTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Total Price & CTA Proceed Button */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-4">
          <div className="text-left md:text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Tạm tính ({selectedSeats.length} vé)</span>
            <span className="text-lg sm:text-xl font-black text-red-500 font-mono tracking-tight">
              {formatPrice(totalAmount)}
            </span>
          </div>

          <button
            onClick={onProceed}
            disabled={!hasSeats || isExpired || loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl ${
              hasSeats && !isExpired && !loading
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 hover:scale-102 active:scale-98'
                : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>{loading ? 'Đang khóa ghế...' : 'Tiếp tục'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
