import React from 'react';
import { SeatDto, SeatMapResponse } from '../../types/booking';
import { RotateCcw } from 'lucide-react';

interface PosSeatMatrixProps {
  seatMap: SeatMapResponse | null;
  selectedSeats: SeatDto[];
  onToggleSeat: (seat: SeatDto) => void;
  isLoading: boolean;
}

export const PosSeatMatrix: React.FC<PosSeatMatrixProps> = ({
  seatMap,
  selectedSeats,
  onToggleSeat,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] bg-[#161b22] rounded-3xl border border-slate-800/80 p-8 space-y-3">
        <div className="w-9 h-9 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Đang tải sơ đồ ghế phòng chiếu...</p>
      </div>
    );
  }

  if (!seatMap) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] bg-[#161b22] rounded-3xl border border-slate-800/80 p-8 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-center text-slate-500 font-bold text-xl shadow-inner">
          🎬
        </div>
        <h3 className="font-bold text-white text-sm">Chưa chọn suất chiếu</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Vui lòng chọn một suất chiếu ở cột bên trái để tải sơ đồ ghế bán vé.
        </p>
      </div>
    );
  }

  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));

  // Group seats by Row Code
  const rowsMap = new Map<string, SeatDto[]>();
  seatMap.seats.forEach((seat) => {
    if (!rowsMap.has(seat.rowCode)) {
      rowsMap.set(seat.rowCode, []);
    }
    rowsMap.get(seat.rowCode)!.push(seat);
  });

  const sortedRowKeys = Array.from(rowsMap.keys()).sort();

  const getSeatStyle = (seat: SeatDto) => {
    const isSelected = selectedSeatIds.has(seat.id);
    const isBooked = seat.status === 'BOOKED' || seat.status === 'HOLD';

    if (isBooked) {
      return 'bg-slate-900 text-slate-700 border-slate-800/80 cursor-not-allowed opacity-50 select-none';
    }

    if (isSelected) {
      return 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black border-emerald-300 shadow-md shadow-emerald-500/40 scale-105 ring-2 ring-emerald-400/30';
    }

    switch (seat.type) {
      case 'VIP':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400';
      case 'SWEETBOX':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/50 hover:bg-pink-500/30 hover:border-pink-400';
      default:
        return 'bg-[#0d1117] text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded-3xl border border-slate-800/80 p-4 shadow-xl overflow-hidden select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-white text-sm">Sơ Đồ Ghế</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              {seatMap.roomName} • {seatMap.screenType}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Giá vé tiêu chuẩn: <span className="text-amber-400 font-bold">{seatMap.basePrice.toLocaleString('vi-VN')}₫</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSeats.length > 0 && (
            <button
              onClick={() => selectedSeats.forEach(s => onToggleSeat(s))}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-red-400 bg-[#0d1117] hover:bg-red-500/10 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Bỏ chọn tất cả ghế"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bỏ chọn</span>
            </button>
          )}
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <span className="text-[11px] text-slate-400">Đã chọn:</span>
            <span className="ml-1 text-xs font-black text-emerald-400">
              {selectedSeats.length} Ghế
            </span>
          </div>
        </div>
      </div>

      {/* Screen Arc */}
      <div className="py-3 text-center">
        <div className="w-4/5 mx-auto h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_2px_14px_rgba(245,158,11,0.6)] mb-1" />
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
          MÀN HÌNH CHIẾU
        </span>
      </div>

      {/* Seat Grid View */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-1">
        <div className="space-y-1.5 min-w-max mx-auto py-1">
          {sortedRowKeys.map((rowKey) => {
            const seatsInRow = rowsMap.get(rowKey) || [];
            seatsInRow.sort((a, b) => a.colNumber - b.colNumber);

            return (
              <div key={rowKey} className="flex items-center justify-center gap-1.5">
                {/* Row Label */}
                <span className="w-4 text-xs font-black text-slate-400 text-center select-none">
                  {rowKey}
                </span>

                {/* Seat buttons */}
                <div className="flex items-center gap-1.5">
                  {seatsInRow.map((seat) => {
                    const isBooked = seat.status === 'BOOKED' || seat.status === 'HOLD';
                    return (
                      <button
                        key={seat.id}
                        disabled={isBooked}
                        onClick={() => onToggleSeat(seat)}
                        className={`w-8 h-8 rounded-xl border text-[11px] font-extrabold flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${getSeatStyle(
                          seat
                        )}`}
                        title={`${seat.seatCode} (${seat.type}) - ${seat.price.toLocaleString('vi-VN')}₫`}
                      >
                        {seat.colNumber}
                      </button>
                    );
                  })}
                </div>

                <span className="w-4 text-xs font-black text-slate-400 text-center select-none">
                  {rowKey}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Matrix Legend */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-lg bg-[#0d1117] border border-slate-700" />
          <span>Thường</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-lg bg-amber-500/20 border border-amber-500/60" />
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-lg bg-pink-500/20 border border-pink-500/60" />
          <span>Sweetbox</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-lg bg-emerald-500 border border-emerald-400" />
          <span className="text-emerald-400 font-bold">Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-lg bg-slate-900 border border-slate-800 opacity-50" />
          <span>Đã bán</span>
        </div>
      </div>
    </div>
  );
};
