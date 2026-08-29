import React, { useState, useEffect } from 'react';
import { Room, Seat, SeatType } from '../../types/room';
import { adminRoomApi } from '../../api/adminRoomApi';
import {
  Layers,
  Lock,
  Unlock,
  RotateCcw,
  Info,
  Paintbrush,
} from 'lucide-react';
import { toast } from 'sonner';

interface SeatMatrixBuilderProps {
  room: Room;
  seatTypes: SeatType[];
  onSeatsUpdated: () => void;
}

export const SeatMatrixBuilder: React.FC<SeatMatrixBuilderProps> = ({
  room,
  seatTypes,
  onSeatsUpdated,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Active brush tool for 1-click painting
  const [activeBrush, setActiveBrush] = useState<{
    typeId?: number;
    isActive?: boolean;
    label: string;
  } | null>(null);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const data = await adminRoomApi.getSeatsByRoomId(room.id);
      setSeats(data);
      setSelectedSeatIds([]);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải sơ đồ ghế của phòng này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (room && room.id) {
      fetchSeats();
    }
  }, [room.id]);

  // Group seats by row
  const rowsMap = new Map<string, Seat[]>();
  seats.forEach((seat) => {
    if (!rowsMap.has(seat.rowCode)) {
      rowsMap.set(seat.rowCode, []);
    }
    rowsMap.get(seat.rowCode)!.push(seat);
  });

  const sortedRowKeys = Array.from(rowsMap.keys()).sort();

  // Seat toggle selection
  const handleSeatClick = (seat: Seat) => {
    if (activeBrush) {
      // Paint single seat immediately
      applyBrushToSeats([seat.id], activeBrush);
      return;
    }

    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  const handleSelectRow = (rowCode: string) => {
    const rowSeats = rowsMap.get(rowCode) || [];
    const rowSeatIds = rowSeats.map((s) => s.id);
    const allSelected = rowSeatIds.every((id) => selectedSeatIds.includes(id));

    if (allSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => !rowSeatIds.includes(id)));
    } else {
      setSelectedSeatIds((prev) => Array.from(new Set([...prev, ...rowSeatIds])));
    }
  };

  const handleSelectAll = () => {
    if (selectedSeatIds.length === seats.length) {
      setSelectedSeatIds([]);
    } else {
      setSelectedSeatIds(seats.map((s) => s.id));
    }
  };

  // Apply brush action
  const applyBrushToSeats = async (
    seatIds: number[],
    brush: { typeId?: number; isActive?: boolean; label: string }
  ) => {
    if (seatIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ghế để áp dụng!');
      return;
    }

    setSaving(true);
    try {
      await adminRoomApi.batchUpdateSeats(room.id, {
        seatIds,
        seatTypeId: brush.typeId,
        isActive: brush.isActive,
      });

      toast.success(`Đã áp dụng "${brush.label}" cho ${seatIds.length} ghế!`);
      setSelectedSeatIds([]);
      fetchSeats();
      onSeatsUpdated();
    } catch (err: any) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi cập nhật loại ghế!');
    } finally {
      setSaving(false);
    }
  };

  // Seat stats
  const regularCount = seats.filter(
    (s) => s.isActive && s.seatType?.name?.toUpperCase() === 'REGULAR'
  ).length;
  const vipCount = seats.filter(
    (s) => s.isActive && s.seatType?.name?.toUpperCase() === 'VIP'
  ).length;
  const sweetboxCount = seats.filter(
    (s) => s.isActive && s.seatType?.name?.toUpperCase() === 'SWEETBOX'
  ).length;
  const maintenanceCount = seats.filter((s) => !s.isActive).length;

  const getSeatColor = (seat: Seat) => {
    if (!seat.isActive) {
      return 'bg-slate-800/60 border-slate-700 text-slate-500 opacity-60';
    }

    const typeName = seat.seatType?.name?.toUpperCase();
    if (typeName === 'VIP') {
      return 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:border-amber-400';
    }
    if (typeName === 'SWEETBOX') {
      return 'bg-purple-500/20 border-purple-500/60 text-purple-300 hover:border-purple-400';
    }
    return 'bg-slate-700/50 border-slate-600/70 text-slate-200 hover:border-slate-400';
  };

  return (
    <div className="space-y-6 bg-[#0b0e14] rounded-3xl border border-slate-800/80 p-6 shadow-2xl">
      {/* Top Header Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Sơ Đồ Ghế Tương Tác: {room.name}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
              {seats.length} Ghế
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chọn một hoặc nhiều ghế rồi chọn loại ghế hoặc trạng thái bên dưới để cập nhật
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
            Thường: <strong className="text-white">{regularCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            VIP: <strong className="text-amber-300">{vipCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            Sweetbox: <strong className="text-purple-300">{sweetboxCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            Bảo trì: <strong className="text-red-300">{maintenanceCount}</strong>
          </span>
        </div>
      </div>

      {/* Action Bar / Paint Palette */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#121622] rounded-2xl border border-slate-800">
        {/* Selection Tools & Brush Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            {selectedSeatIds.length === seats.length ? 'Bỏ Chọn Hết' : 'Chọn Tất Cả'}
          </button>

          {/* Paintbrush Mode Toggle */}
          <button
            onClick={() =>
              setActiveBrush((prev) =>
                prev ? null : { typeId: seatTypes[1]?.id, label: 'VIP' }
              )
            }
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              activeBrush
                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            {activeBrush ? `Chế Độ Cọ Vẽ: ${activeBrush.label}` : 'Cọ Vẽ Nhanh'}
          </button>

          {selectedSeatIds.length > 0 && !activeBrush && (
            <span className="text-amber-400 font-bold font-mono">
              Đang chọn: {selectedSeatIds.length} ghế
            </span>
          )}
        </div>

        {/* Quick Assign Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {/* Regular */}
          {seatTypes.map((type) => {
            const isVip = type.name.toUpperCase() === 'VIP';
            const isSweetbox = type.name.toUpperCase() === 'SWEETBOX';

            return (
              <button
                key={type.id}
                disabled={saving || selectedSeatIds.length === 0}
                onClick={() =>
                  applyBrushToSeats(selectedSeatIds, {
                    typeId: type.id,
                    isActive: true,
                    label: type.name,
                  })
                }
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isVip
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                    : isSweetbox
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/40 text-purple-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-sm ${
                    isVip ? 'bg-amber-400' : isSweetbox ? 'bg-purple-400' : 'bg-slate-400'
                  }`}
                />
                Đặt làm {type.name}
              </button>
            );
          })}

          {/* Maintenance Toggle */}
          <button
            disabled={saving || selectedSeatIds.length === 0}
            onClick={() =>
              applyBrushToSeats(selectedSeatIds, {
                isActive: false,
                label: 'Khóa Bảo Trì',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" /> Khóa Ghế
          </button>

          <button
            disabled={saving || selectedSeatIds.length === 0}
            onClick={() =>
              applyBrushToSeats(selectedSeatIds, {
                isActive: true,
                label: 'Mở Khóa Ghế',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Unlock className="w-3.5 h-3.5" /> Mở Ghế
          </button>
        </div>
      </div>

      {/* Screen & Seat Grid Canvas */}
      <div className="py-6 px-4 bg-[#080a0f] rounded-3xl border border-slate-800/80 flex flex-col items-center overflow-x-auto">
        {/* Cinema Curved Screen */}
        <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
          <div className="w-full h-3 bg-gradient-to-b from-amber-500/50 via-amber-400/20 to-transparent rounded-[100%] shadow-[0_0_20px_rgba(245,158,11,0.25)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
            MÀN HÌNH CHIẾU ({room.screenType})
          </span>
        </div>

        {/* Seats Grid */}
        {loading ? (
          <div className="py-20 text-slate-500 text-sm font-bold animate-pulse">
            Đang dựng ma trận ghế...
          </div>
        ) : (
          <div className="space-y-2.5 min-w-max pb-4">
            {sortedRowKeys.map((rowCode) => {
              const rowSeats = rowsMap.get(rowCode) || [];
              const isRowFullySelected =
                rowSeats.length > 0 &&
                rowSeats.every((s) => selectedSeatIds.includes(s.id));

              return (
                <div key={rowCode} className="flex items-center gap-2">
                  {/* Row Selector Button */}
                  <button
                    onClick={() => handleSelectRow(rowCode)}
                    title={`Chọn toàn bộ hàng ${rowCode}`}
                    className={`w-7 h-7 rounded-lg text-xs font-black font-mono transition-all flex items-center justify-center cursor-pointer ${
                      isRowFullySelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {rowCode}
                  </button>

                  {/* Seat Items in Row */}
                  <div className="flex items-center gap-1.5">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-8 h-8 rounded-lg border text-[11px] font-bold font-mono transition-all flex items-center justify-center relative cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-amber-400 scale-105 shadow-lg shadow-amber-500/30 z-10 font-black'
                              : ''
                          } ${getSeatColor(seat)}`}
                          title={`Ghế ${seat.seatCode} (${
                            !seat.isActive ? 'Bảo trì' : seat.seatType?.name || 'Thường'
                          })`}
                        >
                          {!seat.isActive ? (
                            <Lock className="w-3 h-3 text-red-400" />
                          ) : (
                            seat.colNumber
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row Right Label */}
                  <span className="w-7 text-center text-xs font-bold font-mono text-slate-600">
                    {rowCode}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Nhấp vào từng ghế để chọn, hoặc nhấp vào chữ cái đầu hàng (A, B, C...) để chọn cả hàng.</span>
        </div>

        <button
          onClick={fetchSeats}
          disabled={loading || saving}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Khôi phục sơ đồ
        </button>
      </div>
    </div>
  );
};
