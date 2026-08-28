import React from 'react';
import { SeatDto } from '../../types/booking';
import { Sparkles, Heart } from 'lucide-react';

interface SeatMatrixProps {
  seats: SeatDto[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: SeatDto) => void;
  disabled?: boolean;
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  disabled = false,
}) => {
  // Group seats by rowCode
  const seatsByRow: { [rowCode: string]: SeatDto[] } = {};
  seats.forEach((seat) => {
    if (!seatsByRow[seat.rowCode]) {
      seatsByRow[seat.rowCode] = [];
    }
    seatsByRow[seat.rowCode].push(seat);
  });

  // Sort rows alphabetically (A, B, C...)
  const sortedRowCodes = Object.keys(seatsByRow).sort();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getSeatStyle = (seat: SeatDto, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.6)] scale-105 z-10';
    }

    if (seat.status === 'BOOKED') {
      return 'bg-[#1b1c21] text-slate-600 border-white/5 opacity-40 cursor-not-allowed';
    }

    if (seat.status === 'HOLD') {
      return 'bg-amber-600/30 text-amber-400 border-amber-500/50 cursor-not-allowed animate-pulse';
    }

    // Available statuses
    switch (seat.type) {
      case 'SWEETBOX':
        return 'bg-pink-950/40 text-pink-300 border-pink-500/40 hover:border-pink-400 hover:bg-pink-900/50 hover:shadow-[0_0_10px_rgba(236,72,153,0.4)]';
      case 'VIP':
        return 'bg-yellow-950/40 text-yellow-300 border-yellow-500/40 hover:border-yellow-400 hover:bg-yellow-900/50 hover:shadow-[0_0_10px_rgba(233,195,73,0.4)]';
      default:
        // STANDARD / REGULAR
        return 'bg-[#1e2026] text-slate-300 border-white/10 hover:border-white/30 hover:bg-[#282a32] hover:text-white';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 select-none">
      {/* 1. Seat Matrix Grid */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 flex justify-center">
        <div className="min-w-fit space-y-2.5 px-4">
          {sortedRowCodes.map((rowCode) => {
            const rowSeats = seatsByRow[rowCode].sort((a, b) => a.colNumber - b.colNumber);

            return (
              <div key={rowCode} className="flex items-center justify-center space-x-2">
                {/* Left Row Label */}
                <span className="w-6 text-center text-xs font-bold text-slate-500 uppercase font-mono">
                  {rowCode}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center space-x-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isSelectable = seat.status === 'AVAILABLE' || seat.status === 'SELECTED_BY_ME' || isSelected;
                    const isSweetbox = seat.type === 'SWEETBOX';

                    return (
                      <button
                        key={seat.id}
                        onClick={() => isSelectable && !disabled && onToggleSeat(seat)}
                        disabled={!isSelectable || disabled}
                        title={`Ghế ${seat.seatCode} (${seat.type}) - ${formatPrice(seat.price)}`}
                        className={`group relative flex items-center justify-center rounded-lg border text-[11px] font-bold transition-all duration-150 cursor-pointer active:scale-90 ${
                          isSweetbox ? 'w-16 sm:w-20 h-9 sm:h-10' : 'w-8 sm:w-9 h-8 sm:h-9'
                        } ${getSeatStyle(seat, isSelected)}`}
                      >
                        {isSweetbox ? (
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3 fill-current text-pink-400" />
                            <span className="font-mono text-[10px]">{seat.seatCode}</span>
                          </div>
                        ) : (
                          <span className="font-mono">{seat.seatCode}</span>
                        )}

                        {/* VIP Sparkle Badge */}
                        {seat.type === 'VIP' && !isSelected && (
                          <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-yellow-400 pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Row Label */}
                <span className="w-6 text-center text-xs font-bold text-slate-500 uppercase font-mono">
                  {rowCode}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Seat Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 px-6 rounded-2xl bg-[#18191E] border border-white/10 text-xs font-medium text-slate-300 shadow-xl">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-[#1e2026] border border-white/20" />
          <span>Ghế Thường</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-yellow-950/50 border border-yellow-500/50 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
          </div>
          <span>Ghế VIP (+15k)</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 rounded-md bg-pink-950/50 border border-pink-500/50 flex items-center justify-center">
            <Heart className="w-2.5 h-2.5 fill-current text-pink-400" />
          </div>
          <span>Ghế Đôi Sweetbox (+30k)</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500 border border-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="text-emerald-400 font-bold">Đang Chọn</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-amber-600/30 border border-amber-500/50" />
          <span className="text-amber-400">Đang Giữ Chỗ</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-[#1b1c21] border border-white/5 opacity-50" />
          <span className="text-slate-500">Đã Bán</span>
        </div>
      </div>
    </div>
  );
};
