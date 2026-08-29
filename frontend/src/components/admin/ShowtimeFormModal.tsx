import React, { useState, useEffect } from 'react';
import { Showtime, ShowtimeStatus } from '../../types/showtime';
import { Movie } from '../../types/movie';
import { Room } from '../../types/room';
import { ShowtimeFormData } from '../../api/adminShowtimeApi';
import {
  X,
  Calendar,
  Clock,
  Film,
  Tv,
  DollarSign,
  AlertCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface ShowtimeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShowtimeFormData) => Promise<void>;
  initialData?: Showtime | null;
  movies: Movie[];
  rooms: Room[];
  defaultDate?: string;
  defaultRoomId?: number;
  defaultStartTime?: string;
  submitting?: boolean;
}

export const ShowtimeFormModal: React.FC<ShowtimeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  movies,
  rooms,
  defaultDate,
  defaultRoomId,
  defaultStartTime,
  submitting = false,
}) => {
  const [selectedMovieId, setSelectedMovieId] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0);
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>(defaultStartTime || '10:00');
  const [basePrice, setBasePrice] = useState<number>(90000);
  const [status, setStatus] = useState<ShowtimeStatus>('OPENING');

  useEffect(() => {
    if (initialData) {
      setSelectedMovieId(initialData.movie?.id || (movies[0]?.id ?? 0));
      setSelectedRoomId(initialData.room?.id || (rooms[0]?.id ?? 0));
      if (initialData.startTime) {
        const parts = initialData.startTime.split('T');
        setDate(parts[0]);
        setTime(parts[1]?.substring(0, 5) || '10:00');
      }
      setBasePrice(initialData.basePrice || 90000);
      setStatus(initialData.status || 'OPENING');
    } else {
      setSelectedMovieId(movies[0]?.id ?? 0);
      setSelectedRoomId(defaultRoomId || (rooms[0]?.id ?? 0));
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setTime(defaultStartTime || '10:00');
      setBasePrice(90000);
      setStatus('OPENING');
    }
  }, [initialData, isOpen, defaultDate, defaultRoomId, defaultStartTime, movies, rooms]);

  const selectedMovie = movies.find((m) => m.id === Number(selectedMovieId));

  // Calculate End Time and Cleaning buffer
  const calculateTimes = () => {
    if (!time || !selectedMovie) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const startTotalMinutes = hours * 60 + minutes;
    const duration = selectedMovie.durationMinutes || 120;
    const endTotalMinutes = startTotalMinutes + duration;
    const cleanTotalMinutes = endTotalMinutes + 15; // 15m cleaning buffer

    const formatHoursMinutes = (totalMins: number) => {
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return {
      startTimeStr: time,
      endTimeStr: formatHoursMinutes(endTotalMinutes),
      cleaningUntilStr: formatHoursMinutes(cleanTotalMinutes),
      duration,
    };
  };

  const timeCalculations = calculateTimes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieId) {
      toast.error('Vui lòng chọn phim chiếu!');
      return;
    }
    if (!selectedRoomId) {
      toast.error('Vui lòng chọn phòng chiếu!');
      return;
    }
    if (!date || !time) {
      toast.error('Vui lòng chọn ngày và giờ chiếu!');
      return;
    }
    if (basePrice < 10000) {
      toast.error('Giá vé cơ bản tối thiểu là 10,000đ!');
      return;
    }

    const startDateTime = `${date}T${time}:00`;

    try {
      await onSubmit({
        movieId: Number(selectedMovieId),
        roomId: Number(selectedRoomId),
        startTime: startDateTime,
        basePrice: Number(basePrice),
        status,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 'Có lỗi xảy ra khi lên lịch suất chiếu!'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e121a] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#121622] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'Cập Nhật Suất Chiếu' : 'Lên Lịch Suất Chiếu Mới'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Kiểm tra chống trùng lịch 15 phút và tự động tính toán giờ kết thúc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Movie Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              Chọn Phim Chiếu <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-bold"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.durationMinutes} phút | {m.ageRating})
                </option>
              ))}
            </select>
          </div>

          {/* Room Selector & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Room Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                Chọn Phòng Chiếu <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-bold"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.screenType})
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Giá Vé Cơ Bản (VNĐ) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="5000"
                min="10000"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          {/* Date & Time Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Ngày Chiếu <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Giờ Bắt Đầu <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Trạng Thái Suất Chiếu</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShowtimeStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-bold"
            >
              <option value="OPENING">🟢 Đang Mở Bán (OPENING)</option>
              <option value="SCHEDULED">🟡 Đã Lên Lịch (SCHEDULED)</option>
              <option value="CLOSED">🔴 Đã Đóng Suất Chiếu (CLOSED)</option>
              <option value="CANCELLED">❌ Đã Hủy Suất Chiếu (CANCELLED)</option>
            </select>
          </div>

          {/* Live Calculated Timeline Card */}
          {timeCalculations && selectedMovie && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-[#141824] to-blue-500/10 rounded-2xl border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-amber-400 uppercase tracking-wide">
                  Ước Tính Khung Giờ Chiếu
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Thời lượng: <strong>{timeCalculations.duration} phút</strong>
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">Bắt Đầu</span>
                  <span className="text-sm font-black text-white">
                    {timeCalculations.startTimeStr}
                  </span>
                </div>

                <div className="text-center text-slate-600 font-bold">➔</div>

                <div className="space-y-0.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Hết Phim</span>
                  <span className="text-sm font-black text-emerald-400">
                    {timeCalculations.endTimeStr}
                  </span>
                </div>

                <div className="text-center text-slate-600 font-bold">+15m dọn</div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Sẵn Sàng</span>
                  <span className="text-sm font-black text-amber-400">
                    {timeCalculations.cleaningUntilStr}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Hệ thống tự động bảo lưu 15 phút dọn phòng để tránh trùng lịch phòng chiếu.
                </span>
              </p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Suất' : 'Xác Nhận Lên Lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
