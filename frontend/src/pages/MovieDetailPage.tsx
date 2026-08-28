import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Clock, Calendar, ArrowLeft, User, Users, Ticket, Share2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { movieApi } from '../api/movieApi';
import { AgeRating, Movie } from '../types/movie';
import { ShowtimeSelector } from '../components/movie/ShowtimeSelector';
import { TrailerModal } from '../components/common/TrailerModal';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;

    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getMovieBySlug(slug);
        if (res.success && res.data) {
          setMovie(res.data);
        } else {
          toast.error('Không tìm thấy thông tin phim.');
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
        toast.error('Lỗi khi tải thông tin phim.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [slug, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết phim vào bộ nhớ tạm!');
  };

  const getAgeRatingBadge = (rating?: AgeRating) => {
    switch (rating) {
      case 'P':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">P - Phù hợp mọi lứa tuổi</span>;
      case 'T13':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">T13 - Khán giả từ 13 tuổi</span>;
      case 'T16':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">T16 - Khán giả từ 16 tuổi</span>;
      case 'T18':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white shadow-md">T18 - Khán giả từ 18 tuổi</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121317] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 flex flex-col">
      {/* Hero Backdrop Header with Stitch Scrim Overlays */}
      <header className="relative w-full h-[60vh] sm:h-[70vh] md:h-[78vh] flex items-end overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.bannerUrl || movie.posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80'}
            alt={movie.title}
            className="w-full h-full object-cover object-center transform scale-105"
          />
          {/* Depth and Readability Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121317] via-[#121317]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121317] via-[#121317]/50 to-transparent" />
        </div>

        {/* Back Link & Share Action */}
        <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang Chủ</span>
          </Link>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-full glass-panel hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Chia sẻ phim"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Title & Primary Info Container */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-12 pt-28 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end justify-between">
          <div className="flex-1 space-y-4 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {getAgeRatingBadge(movie.ageRating)}
              {movie.genres && movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider bg-black/40 backdrop-blur-sm text-slate-300"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title with Text Glow */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl font-serif">
              {movie.title}
            </h1>
            {movie.originalTitle && (
              <p className="text-sm sm:text-base text-slate-300 font-medium tracking-wide">
                {movie.originalTitle}
              </p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-5 text-slate-300 text-xs sm:text-sm font-semibold pt-1">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white font-bold">5.0</span>
                <span className="text-slate-400 font-normal">(1.2k đánh giá)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{movie.durationMinutes} phút</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#booking-section"
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2.5 transition-all glow-primary hover:glow-primary-lg active:scale-95 uppercase tracking-wider text-sm cursor-pointer"
              >
                <Ticket className="w-5 h-5 fill-current" />
                <span>ĐẶT VÉ NGAY</span>
              </a>

              {movie.trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="glass-panel text-white font-bold px-8 py-4 rounded-full hover:bg-white/20 transition-all flex items-center gap-2.5 active:scale-95 uppercase tracking-wider text-sm border border-white/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>XEM TRAILER</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Floating Poster Insert */}
          <div className="hidden lg:block w-72 shrink-0 -mb-20 z-20 shadow-2xl shadow-black rounded-2xl overflow-hidden border-2 border-white/15 group">
            <div className="relative aspect-[2/3] w-full bg-[#1e1f23]">
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {movie.trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="p-4 rounded-full bg-red-600 text-white shadow-xl glow-primary transform hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <span className="text-xs font-bold text-white mt-2 uppercase tracking-wider">Trailer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Details & Showtimes Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full space-y-14">
        {/* Synopsis, Director & Cast */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Nội Dung Phim
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              {movie.synopsis || 'Nội dung phim đang được cập nhật.'}
            </p>
          </div>

          <div className="space-y-4 p-6 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
              Thông Tin Chi Tiết
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              {movie.director && (
                <div className="flex items-start space-x-2">
                  <User className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Đạo diễn</span>
                    <span className="font-semibold text-white">{movie.director}</span>
                  </div>
                </div>
              )}

              {movie.cast && (
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Diễn viên</span>
                    <span className="font-semibold text-white">{movie.cast}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Showtime Selector Booking Section */}
        {movie.status === 'NOW_SHOWING' && (
          <section id="booking-section" className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6 scroll-mt-24 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <Ticket className="w-7 h-7 text-red-500" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                  Lịch Chiếu & Suất Chiếu
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chọn ngày và khung giờ bạn muốn xem phim để tiến hành chọn ghế
                </p>
              </div>
            </div>

            <ShowtimeSelector movieId={movie.id} />
          </section>
        )}
      </main>

      {/* Trailer Lightbox Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};
