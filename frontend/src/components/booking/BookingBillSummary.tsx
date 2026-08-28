import React from 'react';
import { Clock, AlertTriangle, ArrowRight, Film, X, ShieldCheck, Ticket } from 'lucide-react';
import { SelectedSeat } from '../../types/booking';

interface BookingBillSummaryProps {
  movieTitle: string;
  moviePosterUrl?: string;
  movieAgeRating?: string;
  roomName: string;
  screenType: string;
  showtimeStr: string;
  selectedSeats: SelectedSeat[];
  totalAmount: number;
  formattedTime: string;
  isWarning: boolean;
  isExpired: boolean;
  percentage: number;
  onRemoveSeat: (seatId: number) => void;
  onProceed: () => void;
  loading?: boolean;
}

export const BookingBillSummary: React.FC<BookingBillSummaryProps> = ({
  movieTitle,
  moviePosterUrl,
  movieAgeRating = 'P',
  roomName,
  screenType,
  showtimeStr,
  selectedSeats,
  totalAmount,
  formattedTime,
  isWarning,
  isExpired,
  percentage,
  onRemoveSeat,
  onProceed,
  loading = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasSeats = selectedSeats.length > 0;
  const isImax = screenType === 'IMAX';

  return (
    <div className="bg-[#18191E] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 sticky top-24">
      {/* 1. Bill Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-white uppercase tracking-tight font-serif">
            Thông Tin Đặt Vé
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Bước 1/3</span>
      </div>

      {/* 2. Movie & Showtime Card */}
      <div className="flex space-x-3.5 bg-[#121317] p-3.5 rounded-xl border border-white/5">
        <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-white/10 shadow-md">
          {moviePosterUrl ? (
            <img src={moviePosterUrl} alt={movieTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-600 text-white shadow-xs">
            {movieAgeRating}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight line-clamp-1 font-serif">
              {movieTitle}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isImax
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {isImax ? 'IMAX LASER' : '2D DIGITAL'}
              </span>
              <span className="text-xs text-slate-300 font-medium truncate">{roomName}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">{showtimeStr}</p>
        </div>
      </div>

      {/* 3. Live 5-minute Redis Countdown Timer */}
      {hasSeats && (
        <div
          className={`p-3.5 rounded-xl border transition-all space-y-2 ${
            isExpired
              ? 'bg-red-950/30 border-red-500/40 text-red-400'
              : isWarning
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 animate-pulse'
              : 'bg-[#121317] border-white/10 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <Clock className="w-4 h-4 text-red-500" />
              )}
              <span className="font-semibold">Thời gian giữ ghế Redis:</span>
            </div>
            <span className="font-mono text-base font-black tracking-wider text-red-400">
              {formattedTime}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isWarning ? 'bg-amber-400' : 'bg-gradient-to-r from-red-600 to-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. Selected Seats List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Ghế đã chọn ({selectedSeats.length})</span>
          {hasSeats && <span className="text-[11px] font-normal text-slate-500">Tối đa 8 ghế</span>}
        </div>

        {hasSeats ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {selectedSeats.map((seat) => (
              <div
                key={seat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#121317] border border-white/5 text-xs group hover:border-white/15 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                    {seat.seatCode}
                  </span>
                  <div>
                    <span className="text-slate-200 font-semibold block">
                      {seat.type === 'SWEETBOX'
                        ? 'Ghế Đôi Sweetbox'
                        : seat.type === 'VIP'
                        ? 'Ghế VIP'
                        : 'Ghế Thường'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Hàng {seat.rowCode} &middot; Số {seat.colNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-200">{formatPrice(seat.price)}</span>
                  <button
                    onClick={() => onRemoveSeat(seat.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Bỏ chọn ghế này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-xl bg-[#121317]/50 border border-dashed border-white/10 space-y-1.5">
            <Ticket className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Chưa có ghế nào được chọn</p>
            <p className="text-[11px] text-slate-600">Vui lòng nhấp vào các ô ghế trên sơ đồ bên trái</p>
          </div>
        )}
      </div>

      {/* 5. Total Price Calculation */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Tiền vé tạm tính:</span>
          <span className="font-mono font-semibold text-slate-300">{formatPrice(totalAmount)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Phụ phí công nghệ & loại ghế:</span>
          <span className="text-emerald-400 font-medium">Đã bao gồm</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/10">
          <span className="text-sm font-bold text-white">Tổng cộng:</span>
          <span className="text-xl font-black text-red-500 font-mono tracking-tight">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* 6. CTA Action Button */}
      <button
        onClick={onProceed}
        disabled={!hasSeats || isExpired || loading}
        className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl ${
          hasSeats && !isExpired && !loading
            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 hover:scale-101 active:scale-99'
            : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
      >
        <span>{loading ? 'Đang khóa ghế...' : 'Tiếp tục chọn Bắp Nước'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* 7. Safety Guarantee Note */}
      <div className="flex items-start space-x-2 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>Ghế đã chọn sẽ được khóa giữ an toàn trong 5 phút. Vui lòng thanh toán trước khi hết hạn.</span>
      </div>
    </div>
  );
};
