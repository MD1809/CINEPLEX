import React, { useState, useEffect } from 'react';
import { adminShowtimeApi, ShowtimeFormData } from '../../api/adminShowtimeApi';
import { adminMovieApi } from '../../api/adminMovieApi';
import { adminRoomApi } from '../../api/adminRoomApi';
import { Showtime, ShowtimeStatus } from '../../types/showtime';
import { Movie } from '../../types/movie';
import { Room } from '../../types/room';
import { ShowtimeFormModal } from '../../components/admin/ShowtimeFormModal';
import { RoomTimelineScheduler } from '../../components/admin/RoomTimelineScheduler';
import {
  Clock,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Film,
  Tv,
  List,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Date navigation & Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMovieFilter, setSelectedMovieFilter] = useState<string>('ALL');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [deletingShowtime, setDeletingShowtime] = useState<Showtime | null>(null);

  // Quick slot creation defaults
  const [slotDefaults, setSlotDefaults] = useState<{
    roomId?: number;
    startTime?: string;
  }>({});

  // Generate next 7 days for quick tabs
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `Thứ ${d.getDay() + 1}`;
      const dayMonth = `${d.getDate()}/${d.getMonth() + 1}`;
      days.push({ iso, weekday, dayMonth });
    }
    return days;
  };

  const quickDays = getNext7Days();

  const loadData = async () => {
    setLoading(true);
    try {
      const [showtimesRes, moviesRes, roomsRes] = await Promise.all([
        adminShowtimeApi.getShowtimes({
          date: selectedDate,
          movieId: selectedMovieFilter !== 'ALL' ? Number(selectedMovieFilter) : undefined,
          roomId: selectedRoomFilter !== 'ALL' ? Number(selectedRoomFilter) : undefined,
        }),
        adminMovieApi.getAllMovies(),
        adminRoomApi.getAllRooms(),
      ]);

      setShowtimes(showtimesRes);
      setMovies(moviesRes.filter((m) => m.status === 'NOW_SHOWING' || m.status === 'COMING_SOON'));
      setRooms(roomsRes.filter((r) => r.status === 'ACTIVE'));
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu lịch chiếu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedMovieFilter, selectedRoomFilter]);

  const handleOpenCreateModal = () => {
    setEditingShowtime(null);
    setSlotDefaults({});
    setIsModalOpen(true);
  };

  const handleOpenSlotCreateModal = (roomId: number, timeStr: string) => {
    setEditingShowtime(null);
    setSlotDefaults({ roomId, startTime: timeStr });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setIsModalOpen(true);
  };

  const handleSubmitShowtime = async (formData: ShowtimeFormData) => {
    setSubmitting(true);
    try {
      if (editingShowtime) {
        await adminShowtimeApi.updateShowtime(editingShowtime.id, formData);
        toast.success('Cập nhật suất chiếu thành công!');
      } else {
        await adminShowtimeApi.createShowtime(formData);
        toast.success('Lên lịch suất chiếu mới thành công!');
      }
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShowtime = async () => {
    if (!deletingShowtime) return;
    const toDeleteId = deletingShowtime.id;
    try {
      await adminShowtimeApi.deleteShowtime(toDeleteId);
      toast.success('Đã hủy suất chiếu thành công!');
      setShowtimes((prev) => prev.filter((s) => s.id !== toDeleteId));
      setDeletingShowtime(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể hủy suất chiếu này!');
    }
  };

  const getStatusBadge = (status: ShowtimeStatus) => {
    switch (status) {
      case 'OPENING':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            Mở Bán
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
            Đã Lên Lịch
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
            Đã Đóng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
            Đã Hủy
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0b0e14] rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span>Xếp Lịch & Điều Phối Suất Chiếu</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono">
              {showtimes.length} suất chiếu
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Dòng thời gian xếp lịch chiếu theo phòng, tự động bảo lưu 15 phút dọn dẹp chống xung đột
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#131722] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Lên Lịch Suất Chiếu Mới
          </button>
        </div>
      </div>

      {/* Date Picker Navigation Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#0e121a] rounded-2xl border border-slate-800 scrollbar-none">
        {quickDays.map((day) => {
          const isSelected = selectedDate === day.iso;

          return (
            <button
              key={day.iso}
              onClick={() => setSelectedDate(day.iso)}
              className={`px-4 py-2 rounded-xl text-xs transition-all flex flex-col items-center min-w-[100px] cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{day.weekday}</span>
              <span className="font-mono text-xs mt-0.5">{day.dayMonth}</span>
            </button>
          );
        })}

        {/* Custom Date Input */}
        <div className="ml-auto pl-2 shrink-0">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-bold font-mono"
          />
        </div>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#0e121a] rounded-3xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Movie Filter */}
          <div className="flex items-center gap-2 bg-[#141824] px-3 py-1.5 rounded-xl border border-slate-800">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedMovieFilter}
              onChange={(e) => setSelectedMovieFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[200px]"
            >
              <option value="ALL" className="bg-[#141824]">Tất cả phim</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#141824]">
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-2 bg-[#141824] px-3 py-1.5 rounded-xl border border-slate-800">
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[180px]"
            >
              <option value="ALL" className="bg-[#141824]">Tất cả phòng</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#141824]">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-slate-800 self-end lg:self-auto">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline 24H
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Danh Sách Bảng
          </button>
        </div>
      </div>

      {/* Main Content (Timeline or Table) */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-medium animate-pulse">
          Đang tải lịch chiếu...
        </div>
      ) : viewMode === 'timeline' ? (
        <RoomTimelineScheduler
          rooms={selectedRoomFilter !== 'ALL' ? rooms.filter((r) => r.id === Number(selectedRoomFilter)) : rooms}
          showtimes={showtimes}
          selectedDate={selectedDate}
          onEditShowtime={handleOpenEditModal}
          onDeleteShowtime={(st) => setDeletingShowtime(st)}
          onAddShowtimeInSlot={handleOpenSlotCreateModal}
        />
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-[#0e121a]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#131722] text-slate-400 border-b border-slate-800/80 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Phim Chiếu</th>
                <th className="py-3.5 px-4">Phòng Chiếu</th>
                <th className="py-3.5 px-4">Khung Giờ Chiếu</th>
                <th className="py-3.5 px-4">Giá Vé Cơ Bản</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {showtimes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-bold">
                    Không có suất chiếu nào trong ngày đã chọn.
                  </td>
                </tr>
              ) : (
                showtimes.map((showtime) => {
                  const startTimeStr = showtime.startTime.split('T')[1]?.substring(0, 5) || '';
                  const endTimeStr = showtime.endTime.split('T')[1]?.substring(0, 5) || '';

                  return (
                    <tr key={showtime.id} className="hover:bg-[#141824] transition-colors group">
                      {/* Movie Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                            {showtime.movie?.posterUrl ? (
                              <img
                                src={showtime.movie.posterUrl}
                                alt={showtime.movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 max-w-xs">
                            <h4 className="text-white font-bold truncate group-hover:text-amber-400 transition-colors">
                              {showtime.movie?.title}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {showtime.movie?.durationMinutes} phút | {showtime.movie?.ageRating}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-white font-bold">{showtime.room?.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono block">
                            {showtime.room?.screenType}
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono text-slate-200">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{startTimeStr} - {endTimeStr}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            (+15m dọn phòng)
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="text-amber-400 font-mono font-bold">
                          {Number(showtime.basePrice).toLocaleString('vi-VN')}đ
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(showtime.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(showtime)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                            title="Sửa suất chiếu"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingShowtime(showtime)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                            title="Hủy suất chiếu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Showtime Form Modal */}
      <ShowtimeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitShowtime}
        initialData={editingShowtime}
        movies={movies}
        rooms={rooms}
        defaultDate={selectedDate}
        defaultRoomId={slotDefaults.roomId}
        defaultStartTime={slotDefaults.startTime}
        submitting={submitting}
      />

      {/* Delete / Cancel Confirmation Dialog */}
      {deletingShowtime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Xác Nhận Hủy Suất Chiếu</h3>
                <p className="text-xs text-slate-400 font-medium">Hành động này sẽ hủy suất chiếu</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn hủy suất chiếu phim{' '}
              <strong className="text-amber-400">"{deletingShowtime.movie?.title}"</strong> tại{' '}
              <span className="text-white font-bold">{deletingShowtime.room?.name}</span> vào lúc{' '}
              <span className="text-emerald-400 font-mono font-bold">
                {deletingShowtime.startTime.replace('T', ' ').substring(0, 16)}
              </span>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingShowtime(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Giữ Lại
              </button>
              <button
                onClick={handleDeleteShowtime}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
              >
                Hủy Suất Chiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
