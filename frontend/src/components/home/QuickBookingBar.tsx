import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Calendar, Clock, Ticket, ChevronDown } from 'lucide-react';
import { movieApi } from '../../api/movieApi';
import { showtimeApi } from '../../api/showtimeApi';
import { Movie } from '../../types/movie';
import { Showtime } from '../../types/showtime';
import { useAuthStore } from '../../stores/authStore';

export const QuickBookingBar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | ''>('');
  
  const [dates, setDates] = useState<{ dateStr: string; label: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | ''>('');
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Load now showing movies and 7 upcoming dates
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await movieApi.getNowShowing();
        if (res.success && res.data) {
          setMovies(res.data);
          if (res.data.length > 0) {
            setSelectedMovieId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load quick booking movies:', err);
      }
    };

    const dateList: { dateStr: string; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      let label = `${day}/${month}`;
      if (i === 0) label = `Hôm nay (${day}/${month})`;
      else if (i === 1) label = `Ngày mai (${day}/${month})`;
      else {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        label = `${days[d.getDay()]} (${day}/${month})`;
      }
      dateList.push({ dateStr, label });
    }
    setDates(dateList);
    if (dateList.length > 0) {
      setSelectedDate(dateList[0].dateStr);
    }

    fetchMovies();
  }, []);

  // Fetch showtimes whenever movie or date changes
  useEffect(() => {
    if (!selectedMovieId || !selectedDate) {
      setShowtimes([]);
      setSelectedShowtimeId('');
      return;
    }

    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        const res = await showtimeApi.getShowtimes({
          movieId: Number(selectedMovieId),
          date: selectedDate,
        });
        if (res.success && res.data) {
          setShowtimes(res.data);
          setSelectedShowtimeId(res.data.length > 0 ? res.data[0].id : '');
        } else {
          setShowtimes([]);
          setSelectedShowtimeId('');
        }
      } catch (err) {
        console.error('Failed to fetch quick showtimes:', err);
        setShowtimes([]);
        setSelectedShowtimeId('');
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedMovieId, selectedDate]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShowtimeId) return;

    if (!isAuthenticated) {
      openAuthModal(`/booking/seats?showtimeId=${selectedShowtimeId}`);
    } else {
      navigate(`/booking/seats?showtimeId=${selectedShowtimeId}`);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  return (
    <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14">
      <div className="bg-[#18191E] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 backdrop-blur-xl">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-white/5">
          <Ticket className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Đặt Vé Nhanh Trực Tuyến
          </h3>
          <span className="hidden sm:inline text-xs text-slate-400 font-normal">
            | Chọn phim, ngày chiếu và khung giờ để giữ ghế tức thì
          </span>
        </div>

        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Step 1: Select Movie */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>1. Chọn Phim</span>
            </label>
            <div className="relative">
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(Number(e.target.value))}
                className="w-full appearance-none bg-[#111216] text-white text-xs sm:text-sm font-medium rounded-xl px-3.5 py-3 border border-white/10 focus:border-red-500 focus:outline-none transition-colors cursor-pointer truncate pr-8"
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#18191E] text-white">
                    {m.title} ({m.durationMinutes}p)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Step 2: Select Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>2. Chọn Ngày Chiếu</span>
            </label>
            <div className="relative">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none bg-[#111216] text-white text-xs sm:text-sm font-medium rounded-xl px-3.5 py-3 border border-white/10 focus:border-red-500 focus:outline-none transition-colors cursor-pointer pr-8"
              >
                {dates.map((d) => (
                  <option key={d.dateStr} value={d.dateStr} className="bg-[#18191E] text-white">
                    {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Step 3: Select Showtime */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>3. Chọn Suất Chiếu</span>
            </label>
            <div className="relative">
              <select
                value={selectedShowtimeId}
                onChange={(e) => setSelectedShowtimeId(Number(e.target.value))}
                disabled={loadingShowtimes || showtimes.length === 0}
                className="w-full appearance-none bg-[#111216] text-white text-xs sm:text-sm font-medium rounded-xl px-3.5 py-3 border border-white/10 focus:border-red-500 focus:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8"
              >
                {loadingShowtimes ? (
                  <option className="bg-[#18191E] text-white">Đang tải suất chiếu...</option>
                ) : showtimes.length === 0 ? (
                  <option className="bg-[#18191E] text-slate-400">Không có suất chiếu</option>
                ) : (
                  showtimes.map((st) => (
                    <option key={st.id} value={st.id} className="bg-[#18191E] text-white">
                      {formatTime(st.startTime)} - {st.room?.name} ({st.room?.screenType})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Step 4: CTA Button */}
          <div>
            <button
              type="submit"
              disabled={!selectedShowtimeId || loadingShowtimes}
              className="w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:hover:bg-red-600 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 fill-current" />
              <span>MUA VÉ NGAY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
