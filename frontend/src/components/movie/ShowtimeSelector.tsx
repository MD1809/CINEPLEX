import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Monitor, Clock, Film, ChevronRight, ChevronDown, ChevronUp, Star, Sparkles } from 'lucide-react';
import { showtimeApi } from '../../api/showtimeApi';
import { Showtime, ShowtimeMovieGroup } from '../../types/showtime';
import { useAuthStore } from '../../stores/authStore';

interface ShowtimeSelectorProps {
  movieId?: number;
}

export const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({ movieId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const [dates, setDates] = useState<{ dateStr: string; label: string; dayOfWeek: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Specific movie mode state
  const [movieShowtimes, setMovieShowtimes] = useState<Showtime[]>([]);
  
  // All movies grouped mode state
  const [movieGroups, setMovieGroups] = useState<ShowtimeMovieGroup[]>([]);
  
  // Pagination: Show 2 movies by default, expand +2 on demand
  const [visibleMovieCount, setVisibleMovieCount] = useState<number>(2);

  // Track open/close state of IMAX accordion for each movie
  const [expandedImaxMovies, setExpandedImaxMovies] = useState<{ [movieId: number]: boolean }>({});

  const [loading, setLoading] = useState<boolean>(true);
  const [screenFilter, setScreenFilter] = useState<string>('ALL');

  // Generate 7 upcoming dates
  useEffect(() => {
    const dateList: { dateStr: string; label: string; dayOfWeek: string }[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let label = `${day}/${month}`;
      let dayOfWeek = '';

      if (i === 0) {
        dayOfWeek = 'Hôm nay';
      } else if (i === 1) {
        dayOfWeek = 'Ngày mai';
      } else {
        const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        dayOfWeek = days[d.getDay()];
      }

      dateList.push({ dateStr, label, dayOfWeek });
    }

    setDates(dateList);
    if (dateList.length > 0) {
      setSelectedDate(dateList[0].dateStr);
    }
  }, []);

  // Reset pagination when date or screen filter changes
  useEffect(() => {
    setVisibleMovieCount(2);
  }, [selectedDate, screenFilter]);

  // Fetch showtimes when selected date or movieId changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        if (movieId) {
          // Specific Movie: fetch showtimes for this movie
          const res = await showtimeApi.getShowtimes({
            date: selectedDate,
            movieId: movieId,
          });
          if (res.success && res.data) {
            setMovieShowtimes(res.data);
          } else {
            setMovieShowtimes([]);
          }
        } else {
          // General Schedule: fetch grouped by Movie
          const res = await showtimeApi.getGroupedByMovie(selectedDate);
          if (res.success && res.data) {
            setMovieGroups(res.data);
          } else {
            setMovieGroups([]);
          }
        }
      } catch (err) {
        console.error('Failed to load showtimes schedule:', err);
        setMovieShowtimes([]);
        setMovieGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDate, movieId]);

  const toggleImax = (mId: number) => {
    setExpandedImaxMovies((prev) => ({
      ...prev,
      [mId]: !prev[mId],
    }));
  };

  const handleShowtimeClick = (showtimeId: number) => {
    if (!isAuthenticated) {
      openAuthModal(`/booking/seats?showtimeId=${showtimeId}`);
    } else {
      navigate(`/booking/seats?showtimeId=${showtimeId}`);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Filter specific movie showtimes by screen type
  const filteredMovieShowtimes = movieShowtimes.filter((s) => {
    if (screenFilter === 'ALL') return true;
    return s.room?.screenType === screenFilter;
  });

  // Group specific movie showtimes by room
  const showtimesByRoom: { [roomId: number]: { roomName: string; screenType: string; items: Showtime[] } } = {};
  filteredMovieShowtimes.forEach((s) => {
    const rId = s.room?.id || 0;
    if (!showtimesByRoom[rId]) {
      showtimesByRoom[rId] = {
        roomName: s.room?.name || 'Phòng Chiếu',
        screenType: s.room?.screenType || 'STANDARD_2D',
        items: [],
      };
    }
    showtimesByRoom[rId].items.push(s);
  });

  // Filter grouped movie list by screen filter
  const filteredMovieGroups = movieGroups
    .map((group) => {
      const matchingShowtimes = group.showtimes.filter((s) => {
        if (screenFilter === 'ALL') return true;
        return s.room?.screenType === screenFilter;
      });
      return {
        ...group,
        showtimes: matchingShowtimes,
      };
    })
    .filter((group) => group.showtimes.length > 0);

  // Paginated movies currently visible
  const displayedMovieGroups = filteredMovieGroups.slice(0, visibleMovieCount);

  return (
    <div className="w-full space-y-6">
      {/* 1. Date Selector Tabs */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex flex-col items-center justify-center min-w-[84px] py-3 px-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-[1.03]'
                  : 'bg-[#18191E] border-white/10 text-slate-300 hover:border-white/20 hover:bg-[#202126]'
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider opacity-90">{item.dayOfWeek}</span>
              <span className="text-sm sm:text-base font-bold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Format / Screen Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Calendar className="w-4 h-4 text-red-500" />
          <span>{movieId ? 'Suất Chiếu Cho Phim' : 'Lịch Chiếu Toàn Bộ Phim Trong Ngày'}</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#18191E] p-1 rounded-xl border border-white/10 text-xs">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'IMAX', label: 'IMAX Laser' },
            { key: 'STANDARD_2D', label: 'Standard 2D' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setScreenFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                screenFilter === tab.key
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Showtime Matrix Body */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-slate-400 font-medium">Đang cập nhật lịch chiếu...</span>
        </div>
      ) : movieId ? (
        /* MODE A: Specific Movie Page -> Group by Room */
        Object.keys(showtimesByRoom).length === 0 ? (
          <div className="text-center py-14 rounded-2xl bg-[#18191E]/60 border border-white/5 space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-200 font-semibold">Phim chưa có suất chiếu trong ngày đã chọn.</p>
            <p className="text-xs text-slate-500">Vui lòng chọn ngày chiếu khác trên thanh lịch phía trên.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(showtimesByRoom).map(([roomId, group]) => {
              const isImax = group.screenType === 'IMAX';
              return (
                <div
                  key={roomId}
                  className="p-5 rounded-2xl bg-[#18191E] border border-white/10 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <Monitor className="w-4 h-4 text-red-500" />
                      <h4 className="font-bold text-sm text-white">{group.roomName}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        isImax
                          ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                          : 'bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      {isImax ? 'IMAX LASER' : 'STANDARD 2D'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {group.items.map((st) => {
                      const isAvailable = st.status === 'OPENING' || st.status === 'SCHEDULED';
                      return (
                        <button
                          key={st.id}
                          onClick={() => isAvailable && handleShowtimeClick(st.id)}
                          disabled={!isAvailable}
                          className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-[#111216] border border-white/10 hover:border-red-500 hover:bg-red-950/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-center cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors font-mono">
                            {formatTime(st.startTime)} - {formatTime(st.endTime)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${
                              isAvailable
                                ? isImax
                                  ? 'text-yellow-400'
                                  : 'text-emerald-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {isAvailable ? 'Còn vé' : 'Hết vé'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* MODE B: General Schedule (Home Page) -> Split Layout with 2-item Incremental Load */
        filteredMovieGroups.length === 0 ? (
          <div className="text-center py-14 rounded-2xl bg-[#18191E]/60 border border-white/5 space-y-2">
            <Film className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-200 font-semibold">Không có suất chiếu nào phù hợp trong ngày đã chọn.</p>
            <p className="text-xs text-slate-500">Vui lòng chọn ngày chiếu khác trên thanh lịch phía trên.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedMovieGroups.map((mg) => {
              const m = mg.movie;
              const isImaxExpanded = !!expandedImaxMovies[m.id];

              // Separate 2D and IMAX showtimes
              const standardShowtimes = mg.showtimes.filter((st) => st.room?.screenType === 'STANDARD_2D');
              const imaxShowtimes = mg.showtimes.filter((st) => st.room?.screenType === 'IMAX');

              return (
                <div
                  key={m.id}
                  className="flex flex-col md:flex-row rounded-2xl bg-[#18191E] border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
                >
                  {/* LEFT COLUMN: Vertical Movie Poster */}
                  <div className="relative aspect-[2/3] w-full md:w-48 lg:w-56 shrink-0 bg-black/50 overflow-hidden group">
                    <img
                      src={m.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
                    
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-red-600 text-white shadow-md">
                        {m.ageRating}
                      </span>
                    </div>

                    <Link
                      to={`/movie/${m.slug}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                    >
                      <span className="text-xs font-bold text-white uppercase tracking-wider bg-red-600 px-3.5 py-1.5 rounded-full shadow-lg">
                        Chi Tiết Phim
                      </span>
                    </Link>
                  </div>

                  {/* RIGHT COLUMN: Info Top & Showtimes Bottom */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    {/* RIGHT TOP: Title, Rating, Synopsis, Blurred Backdrop */}
                    <div className="relative p-5 sm:p-6 overflow-hidden border-b border-white/5">
                      <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
                        <img
                          src={m.bannerUrl || m.posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80'}
                          alt={m.title}
                          className="w-full h-full object-cover filter blur-md scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#18191E] via-[#18191E]/70 to-transparent" />
                      </div>

                      <div className="relative z-10 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="hidden md:inline px-2 py-0.5 text-[10px] font-bold rounded-sm bg-red-600 text-white">
                              {m.ageRating}
                            </span>
                            <div className="flex items-center text-yellow-400 space-x-1 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-white">5.0</span>
                              <span className="text-slate-400 font-normal">(1.2k đánh giá)</span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">
                              &middot; {m.durationMinutes} phút
                            </span>
                          </div>

                          <Link
                            to={`/movie/${m.slug}`}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center space-x-1 transition-colors"
                          >
                            <span>Xem trang phim</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <div>
                          <Link
                            to={`/movie/${m.slug}`}
                            className="text-lg sm:text-xl md:text-2xl font-black text-white hover:text-red-400 transition-colors uppercase tracking-tight line-clamp-1 font-serif"
                          >
                            {m.title}
                          </Link>
                          {m.originalTitle && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              {m.originalTitle}
                            </p>
                          )}
                        </div>

                        {m.synopsis && (
                          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
                            {m.synopsis}
                          </p>
                        )}

                        {m.genres && m.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {m.genres.map((g) => (
                              <span
                                key={g.id}
                                className="text-[10px] font-medium text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT BOTTOM: 2D Horizontal Scroll & Collapsible IMAX Laser Accordion */}
                    <div className="p-4 sm:p-5 bg-[#131418] space-y-4">
                      {/* 1. 2D Standard Showtimes Horizontal Scroll */}
                      {standardShowtimes.length > 0 && (
                        <div className="flex items-center space-x-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10">
                          {standardShowtimes.map((st) => {
                            const isAvailable = st.status === 'OPENING' || st.status === 'SCHEDULED';
                            return (
                              <button
                                key={st.id}
                                onClick={() => isAvailable && handleShowtimeClick(st.id)}
                                disabled={!isAvailable}
                                className="group shrink-0 flex flex-col items-center justify-center py-2.5 px-4 rounded-xl bg-[#18191E] border border-white/10 hover:border-red-500 hover:bg-red-950/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-center min-w-[125px] cursor-pointer"
                              >
                                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors font-mono">
                                  {formatTime(st.startTime)} - {formatTime(st.endTime)}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${
                                    isAvailable ? 'text-emerald-400' : 'text-slate-500'
                                  }`}
                                >
                                  {isAvailable ? 'Còn vé' : 'Hết vé'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. IMAX Laser Collapsible Button & Slot Container */}
                      {imaxShowtimes.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <button
                            onClick={() => toggleImax(m.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              <span>
                                {isImaxExpanded
                                  ? 'Thu gọn suất chiếu IMAX Laser 4K'
                                  : `Hiển thị suất chiếu IMAX Laser (${imaxShowtimes.length} suất)`}
                              </span>
                            </div>
                            {isImaxExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {/* Expanded IMAX Showtimes */}
                          {isImaxExpanded && (
                            <div className="p-3.5 rounded-xl bg-[#18191E] border border-yellow-500/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center justify-between text-[11px] text-yellow-400/90 font-semibold pb-1 border-b border-white/5">
                                <span>Phòng chiếu 1 &middot; Màn hình IMAX Laser 4K & Dolby Atmos</span>
                                <span>Ghế VIP & Sweetbox</span>
                              </div>

                              <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-yellow-500/20">
                                {imaxShowtimes.map((st) => {
                                  const isAvailable = st.status === 'OPENING' || st.status === 'SCHEDULED';
                                  return (
                                    <button
                                      key={st.id}
                                      onClick={() => isAvailable && handleShowtimeClick(st.id)}
                                      disabled={!isAvailable}
                                      className="group shrink-0 flex flex-col items-center justify-center py-2.5 px-4 rounded-xl bg-[#111216] border border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-950/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-center min-w-[125px] cursor-pointer"
                                    >
                                      <span className="text-xs sm:text-sm font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors font-mono">
                                        {formatTime(st.startTime)} - {formatTime(st.endTime)}
                                      </span>
                                      <span
                                        className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${
                                          isAvailable ? 'text-yellow-400' : 'text-slate-500'
                                        }`}
                                      >
                                        {isAvailable ? 'Còn vé' : 'Hết vé'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Button: "Hiển thị nhiều hơn" (+2 movies) */}
            {visibleMovieCount < filteredMovieGroups.length && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setVisibleMovieCount((prev) => prev + 2)}
                  className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#18191E] hover:bg-[#22232a] border border-white/15 hover:border-red-500/50 text-slate-200 hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xl transition-all cursor-pointer group active:scale-98"
                >
                  <span>Hiển thị nhiều hơn</span>
                  <span className="text-slate-400 font-normal">
                    ({filteredMovieGroups.length - visibleMovieCount} phim còn lại)
                  </span>
                  <ChevronDown className="w-4 h-4 text-red-500 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
