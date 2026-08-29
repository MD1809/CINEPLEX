import React from 'react';
import { TopMovieRevenue } from '../../types/adminAnalytics';
import { Trophy, Film, Ticket } from 'lucide-react';

interface TopMoviesLeaderboardProps {
  movies: TopMovieRevenue[];
  loading?: boolean;
}

export const TopMoviesLeaderboard: React.FC<TopMoviesLeaderboardProps> = ({ movies, loading }) => {
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30">
            1
          </span>
        );
      case 1:
        return (
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
            2
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-md">
            3
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-xl bg-[#161b22] text-slate-400 border border-slate-800 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
        );
    }
  };

  const maxRevenue = movies && movies.length > 0 ? Math.max(...movies.map((m) => m.totalRevenue), 1) : 1;

  return (
    <div className="p-6 bg-[#0e121a] rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Top Phim Ăn Khách Nhất
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Xếp hạng theo tổng doanh thu & số vé bán ra
          </p>
        </div>
      </div>

      {/* Movie List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm font-medium animate-pulse">
            Đang tải bảng xếp hạng doanh thu phim...
          </div>
        ) : !movies || movies.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Chưa có số liệu phim ăn khách.
          </div>
        ) : (
          movies.map((movie, idx) => {
            const revenuePct = Math.min(100, Math.round((movie.totalRevenue / maxRevenue) * 100));

            return (
              <div
                key={movie.movieId || idx}
                className="p-3 bg-[#131722] hover:bg-[#181e2b] rounded-2xl border border-slate-800/70 transition-all duration-200 flex items-center gap-3.5 group"
              >
                {/* Rank Number */}
                <div className="shrink-0">{getRankBadge(idx)}</div>

                {/* Poster Thumbnail */}
                <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                  {movie.ageRating && (
                    <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-amber-500 text-slate-950 text-[8px] font-black leading-none">
                      {movie.ageRating}
                    </span>
                  )}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
                      {movie.title}
                    </h4>
                    <span className="text-xs font-mono font-black text-amber-400 shrink-0">
                      {new Intl.NumberFormat('vi-VN').format(movie.totalRevenue)} ₫
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Ticket className="w-3 h-3 text-blue-400" />
                      <strong className="text-white">{movie.ticketsSold}</strong> vé
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {movie.occupancyRate}% lấp đầy
                    </span>
                  </div>

                  {/* Relative Revenue Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${revenuePct}%` }}
                    />
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
