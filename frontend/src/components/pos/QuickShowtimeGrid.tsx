import React, { useState } from 'react';
import { Showtime } from '../../types/showtime';
import { Film, Clock, Monitor, Search, CheckCircle2 } from 'lucide-react';

interface QuickShowtimeGridProps {
  showtimes: Showtime[];
  selectedShowtimeId: number | null;
  onSelectShowtime: (showtime: Showtime) => void;
  isLoading: boolean;
}

export const QuickShowtimeGrid: React.FC<QuickShowtimeGridProps> = ({
  showtimes,
  selectedShowtimeId,
  onSelectShowtime,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreenType, setSelectedScreenType] = useState<string>('ALL');

  const filteredShowtimes = showtimes.filter((st) => {
    const matchesSearch =
      st.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedScreenType === 'ALL' || st.room.screenType === selectedScreenType;
    return matchesSearch && matchesType;
  });

  const screenTypes = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'IMAX', value: 'IMAX' },
    { label: '2D', value: 'STANDARD_2D' },
    { label: '3D', value: 'STANDARD_3D' },
    { label: 'Gold Class', value: 'GOLD_CLASS' },
  ];

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getAgeRatingBadge = (rating: string) => {
    switch (rating) {
      case 'T18':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'T16':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'T13':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getScreenBadgeColor = (type: string) => {
    switch (type) {
      case 'IMAX':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'GOLD_CLASS':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'STANDARD_3D':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded-3xl border border-slate-800/80 p-4 shadow-xl select-none">
      {/* Header & Search */}
      <div className="space-y-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-white text-sm tracking-wide">Suất Chiếu Hôm Nay</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {filteredShowtimes.length} Suất
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm tên phim, phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-slate-700/80 rounded-xl pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Screen Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {screenTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedScreenType(type.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedScreenType === type.value
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Showtime List */}
      <div className="flex-1 overflow-y-auto space-y-2 pt-2.5 pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
            <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Đang tải lịch chiếu...</span>
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-1">
            <p className="text-xs font-bold">Không tìm thấy suất chiếu</p>
            <p className="text-[11px]">Thử đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          filteredShowtimes.map((st) => {
            const isSelected = selectedShowtimeId === st.id;
            return (
              <div
                key={st.id}
                onClick={() => onSelectShowtime(st)}
                className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer select-none text-left relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/15 via-[#1a212d] to-[#161b22] border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.01]'
                    : 'bg-[#0d1117]/90 hover:bg-[#0d1117] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Active Check Indicator */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  </div>
                )}

                <div className="flex items-start gap-2.5 pr-5">
                  {/* Poster Thumbnail */}
                  <div className="w-11 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow-sm">
                    {st.movie.posterUrl ? (
                      <img
                        src={st.movie.posterUrl}
                        alt={st.movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        CP
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-white text-xs line-clamp-1 leading-tight">
                      {st.movie.title}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[9px] font-black px-1 py-0.2 rounded border ${getAgeRatingBadge(
                          st.movie.ageRating
                        )}`}
                      >
                        {st.movie.ageRating}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded border ${getScreenBadgeColor(
                          st.room.screenType
                        )}`}
                      >
                        {st.room.screenType.replace('STANDARD_', '')}
                      </span>
                      <span className="text-[10px] text-slate-500">{st.movie.durationMinutes}p</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1 text-amber-300 font-black text-xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{formatTime(st.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-300 font-semibold">
                        <Monitor className="w-3 h-3 text-slate-500" />
                        <span>{st.room.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
