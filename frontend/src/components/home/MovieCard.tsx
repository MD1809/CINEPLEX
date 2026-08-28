import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Play, Ticket, Sparkles, Star } from 'lucide-react';
import { AgeRating, Movie } from '../../types/movie';

interface MovieCardProps {
  movie: Movie;
  onOpenTrailer?: (url: string, title: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onOpenTrailer }) => {
  const navigate = useNavigate();

  const getAgeRatingBadge = (rating: AgeRating) => {
    switch (rating) {
      case 'P':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">P</span>;
      case 'T13':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">T13</span>;
      case 'T16':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-orange-500/20 text-orange-400 border border-orange-500/30">T16</span>;
      case 'T18':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-red-600 text-white shadow-md">T18</span>;
      default:
        return null;
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl bg-[#1e1f23] border border-white/10 overflow-hidden hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-600/15 transition-all duration-300 transform hover:-translate-y-2">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f23] via-transparent to-black/40 opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {getAgeRatingBadge(movie.ageRating)}
          {movie.status === 'COMING_SOON' && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-600 text-white shadow-md">
              <Sparkles className="w-3 h-3 mr-1" /> Sắp chiếu
            </span>
          )}
        </div>

        {/* Quick Action Overlay (Stitch Glassmorphism & Pill Buttons) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 p-4">
          <button
            onClick={() => navigate(`/movie/${movie.slug}`)}
            className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg glow-primary transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ticket className="w-4 h-4 fill-current" />
            <span>{movie.status === 'NOW_SHOWING' ? 'Đặt Vé' : 'Chi Tiết'}</span>
          </button>

          {movie.trailerUrl && (
            <button
              onClick={() => onOpenTrailer && onOpenTrailer(movie.trailerUrl!, movie.title)}
              className="w-full py-2.5 rounded-full glass-panel hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trailer</span>
            </button>
          )}
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {movie.genres && movie.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <Link
            to={`/movie/${movie.slug}`}
            className="block text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1 font-serif uppercase tracking-tight"
            title={movie.title}
          >
            {movie.title}
          </Link>
          {movie.originalTitle && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-3">
              {movie.originalTitle}
            </p>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>{movie.durationMinutes} phút</span>
          </div>
          <div className="flex items-center text-yellow-400 space-x-1 text-[11px] font-bold">
            <Star className="w-3 h-3 fill-current" />
            <span>5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
