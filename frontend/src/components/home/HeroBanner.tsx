import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Ticket, ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { Movie } from '../../types/movie';

interface HeroBannerProps {
  movies: Movie[];
  onOpenTrailer?: (url: string, title: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onOpenTrailer }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 7 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className="relative w-full h-[86vh] min-h-[580px] max-h-[920px] bg-black overflow-hidden select-none">
      {/* Background Banner Image with Smooth Fade */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentMovie.id}
          src={currentMovie.bannerUrl || currentMovie.posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80'}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transform scale-105 animate-in fade-in zoom-in-105 duration-1000"
        />
        {/* Scrim Overlays for Depth and Contrast according to Stitch */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121317] via-[#121317]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121317] via-[#121317]/70 to-transparent w-full md:w-3/4 z-10" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 md:pb-24">
        <div className="max-w-3xl space-y-5">
          {/* Metadata Badges & Stars */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Genre Badge */}
            {currentMovie.genres && currentMovie.genres.length > 0 && (
              <span className="px-3 py-1 rounded-sm uppercase tracking-widest text-xs font-semibold bg-[#343539] text-[#e9bcb6] border border-white/10">
                {currentMovie.genres[0].name}
              </span>
            )}

            {/* Age Rating Badge */}
            <span className="px-3 py-1 rounded-sm text-xs font-bold bg-red-600 text-white shadow-md">
              {currentMovie.ageRating}
            </span>

            {/* Star Rating Display */}
            <div className="flex items-center text-yellow-400 gap-0.5">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 text-xs text-white font-bold">5.0</span>
            </div>

            {/* Duration */}
            <div className="flex items-center space-x-1 text-slate-300 text-xs px-2.5 py-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>{currentMovie.durationMinutes} phút</span>
            </div>
          </div>

          {/* Large Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl font-serif">
            {currentMovie.title}
          </h1>

          {/* Synopsis */}
          {currentMovie.synopsis && (
            <p className="text-sm md:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl font-normal drop-shadow">
              {currentMovie.synopsis}
            </p>
          )}

          {/* Action CTAs: Book Now & Watch Trailer (Pill Rounded-full with glow-primary) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => navigate(`/movie/${currentMovie.slug}`)}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center gap-3 transition-all glow-primary hover:glow-primary-lg active:scale-95 uppercase tracking-wider text-sm sm:text-base border border-red-500/50 cursor-pointer"
            >
              <Ticket className="w-5 h-5 fill-current" />
              <span>ĐẶT VÉ NGAY</span>
            </button>

            {currentMovie.trailerUrl && (
              <button
                onClick={() => onOpenTrailer && onOpenTrailer(currentMovie.trailerUrl!, currentMovie.title)}
                className="glass-panel hover:bg-white/20 active:bg-white/30 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-wider text-sm sm:text-base border border-white/20 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current text-white" />
                <span>XEM TRAILER</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      {movies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all border border-white/10 hidden md:block z-30 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all border border-white/10 hidden md:block z-30 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-30">
            {movies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-10 bg-red-600 shadow-md shadow-red-600/50' : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
