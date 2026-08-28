import React from 'react';
import { Clock, AlertTriangle, ArrowRight, Film, ShieldCheck, Ticket, Popcorn, ArrowLeft } from 'lucide-react';
import { SelectedSeat } from '../../types/booking';
import { SnackItemSelection } from '../../stores/bookingStore';

interface ConcessionsBillSummaryProps {
  movieTitle: string;
  moviePosterUrl?: string;
  movieAgeRating?: string;
  roomName: string;
  screenType: string;
  showtimeStr: string;
  selectedSeats: SelectedSeat[];
  totalSeatsAmount: number;
  selectedSnacks: SnackItemSelection[];
  totalSnacksAmount: number;
  voucherCode: string | null;
  discountAmount: number;
  finalTotal: number;
  formattedTime: string;
  isWarning: boolean;
  isExpired: boolean;
  percentage: number;
  onBackToSeats: () => void;
  onProceedToCheckout: () => void;
  loading?: boolean;
}

export const ConcessionsBillSummary: React.FC<ConcessionsBillSummaryProps> = ({
  movieTitle,
  moviePosterUrl,
  movieAgeRating = 'P',
  roomName,
  screenType,
  showtimeStr,
  selectedSeats,
  totalSeatsAmount,
  selectedSnacks,
  totalSnacksAmount,
  voucherCode,
  discountAmount,
  finalTotal,
  formattedTime,
  isWarning,
  isExpired,
  percentage,
  onBackToSeats,
  onProceedToCheckout,
  loading = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const isImax = screenType === 'IMAX';

  return (
    <div className="bg-[#18191E] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 sticky top-24">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-white uppercase tracking-tight font-serif">
            Hóa Đơn Đặt Vé
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Bước 2/3</span>
      </div>

      {/* 2. Movie & Showtime Summary */}
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

      {/* 4. Details Breakdown (Seats + Snacks) */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 text-xs">
        {/* Seats List */}
        <div className="space-y-1.5 bg-[#121317] p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Ticket className="w-3.5 h-3.5 text-red-500" />
              <span>Ghế đã chọn ({selectedSeats.length} vé)</span>
            </span>
            <button
              onClick={onBackToSeats}
              className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Đổi ghế
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold"
              >
                {s.seatCode} ({formatPrice(s.price)})
              </span>
            ))}
          </div>
        </div>

        {/* Selected Snacks List */}
        {selectedSnacks.length > 0 && (
          <div className="space-y-1.5 bg-[#121317] p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Popcorn className="w-3.5 h-3.5 text-yellow-400" />
                <span>Bắp Nước ({selectedSnacks.reduce((sum, item) => sum + item.quantity, 0)} món)</span>
              </span>
              <span className="font-mono font-bold text-slate-200">{formatPrice(totalSnacksAmount)}</span>
            </div>

            <div className="space-y-1 pt-1">
              {selectedSnacks.map((item) => (
                <div key={item.snackId} className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {item.name} &times; <strong className="text-white">{item.quantity}</strong>
                  </span>
                  <span className="font-mono font-medium text-slate-300">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Total Price Calculation with Voucher */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Tiền vé xem phim:</span>
          <span className="font-mono font-semibold text-slate-300">{formatPrice(totalSeatsAmount)}</span>
        </div>

        {totalSnacksAmount > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tiền bắp nước / combo:</span>
            <span className="font-mono font-semibold text-slate-300">+{formatPrice(totalSnacksAmount)}</span>
          </div>
        )}

        {voucherCode && discountAmount > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Giảm giá ({voucherCode}):</span>
            <span className="font-mono font-bold">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/10">
          <span className="text-sm font-bold text-white">Tổng thanh toán:</span>
          <span className="text-xl font-black text-red-500 font-mono tracking-tight">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* 6. CTA Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onProceedToCheckout}
          disabled={isExpired || loading}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl ${
            !isExpired && !loading
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 hover:scale-101 active:scale-99'
              : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <span>Tiến Hành Thanh Toán</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onBackToSeats}
          className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại chọn ghế</span>
        </button>
      </div>

      {/* 7. Safety Guarantee Note */}
      <div className="flex items-start space-x-2 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>Giao dịch bảo mật chuẩn VNPAY Sandbox. Sau khi thanh toán vé QR sẽ gửi về Email.</span>
      </div>
    </div>
  );
};
