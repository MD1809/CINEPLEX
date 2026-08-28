import React, { useState, useEffect } from 'react';
import { Film, Sparkles, Filter, Ticket, Tv, Volume2, Armchair, HeartHandshake, RotateCw } from 'lucide-react';
import { movieApi } from '../api/movieApi';
import { Genre, Movie } from '../types/movie';
import { HeroBanner } from '../components/home/HeroBanner';
import { QuickBookingBar } from '../components/home/QuickBookingBar';
import { MovieCard } from '../components/home/MovieCard';
import { VoucherTicketCard } from '../components/home/VoucherTicketCard';
import { ShowtimeSelector } from '../components/movie/ShowtimeSelector';
import { TrailerModal } from '../components/common/TrailerModal';

export const HomePage: React.FC = () => {
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState<number>(0);

  // Lightbox Trailer modal state
  const [trailerModal, setTrailerModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [nowRes, soonRes, genreRes] = await Promise.all([
          movieApi.getNowShowing(),
          movieApi.getComingSoon(),
          movieApi.getGenres(),
        ]);

        if (nowRes.success && nowRes.data) setNowShowing(nowRes.data);
        if (soonRes.success && soonRes.data) setComingSoon(soonRes.data);
        if (genreRes.success && genreRes.data) setGenres(genreRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const openTrailer = (url: string, title: string) => {
    setTrailerModal({ isOpen: true, url, title });
  };

  const closeTrailer = () => {
    setTrailerModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Filter movies by genre
  const currentList = activeTab === 'NOW_SHOWING' ? nowShowing : comingSoon;
  const displayedMovies = currentList.filter((m) => {
    if (!selectedGenreId) return true;
    return m.genres && m.genres.some((g) => g.id === selectedGenreId);
  });

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 flex flex-col">
      {/* 1. Hero Blockbuster Carousel */}
      <HeroBanner movies={nowShowing} onOpenTrailer={openTrailer} />

      {/* 2. Instant Quick Booking Bar (CGV/Lotte/AMC style) */}
      <QuickBookingBar />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-20">
        {/* 3. Movie Showcase Section (Now Showing & Coming Soon) */}
        <section id="movies" className="space-y-8 scroll-mt-24">
          {/* Header with Minimalist Underline Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('NOW_SHOWING')}
                className={`relative pb-4 font-bold text-lg sm:text-xl tracking-tight transition-colors flex items-center space-x-2.5 cursor-pointer ${
                  activeTab === 'NOW_SHOWING'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-5 h-5 text-red-500" />
                <span>Phim Đang Chiếu</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                  {nowShowing.length}
                </span>
                {activeTab === 'NOW_SHOWING' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('COMING_SOON')}
                className={`relative pb-4 font-bold text-lg sm:text-xl tracking-tight transition-colors flex items-center space-x-2.5 cursor-pointer ${
                  activeTab === 'COMING_SOON'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>Phim Sắp Chiếu</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                  {comingSoon.length}
                </span>
                {activeTab === 'COMING_SOON' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <span className="text-xs text-slate-400 flex items-center mr-1">
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Thể loại:
              </span>
              <button
                onClick={() => setSelectedGenreId(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenreId === null
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-[#1e1f23] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Tất cả
              </button>
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenreId(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedGenreId === g.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-[#1e1f23] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Movies Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-[#1e1f23] border border-white/5" />
              ))}
            </div>
          ) : displayedMovies.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#1e1f23]/40 border border-white/5">
              <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold text-base">Không tìm thấy phim phù hợp.</p>
              <p className="text-xs text-slate-500 mt-1">Vui lòng chọn thể loại khác hoặc chuyển qua tab bên cạnh.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {displayedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onOpenTrailer={openTrailer} />
              ))}
            </div>
          )}
        </section>

        {/* 4. Full Cinema Showtime Schedule Section */}
        <section id="showtimes" className="space-y-6 pt-4 scroll-mt-24">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <Ticket className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                  Lịch Chiếu Toàn Rạp Hôm Nay
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tra cứu suất chiếu chi tiết theo từng phòng và công nghệ chiếu
                </p>
              </div>
            </div>

            {/* Reload Schedule Button */}
            <button
              onClick={() => {
                setScheduleRefreshKey((prev) => prev + 1);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#18191E] hover:bg-[#22232a] text-slate-300 hover:text-white border border-white/10 hover:border-white/20 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
              title="Làm mới lịch chiếu"
            >
              <RotateCw className="w-4 h-4 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">Làm mới danh sách</span>
            </button>
          </div>

          <ShowtimeSelector key={scheduleRefreshKey} />
        </section>

        {/* 5. Cinema Technologies & VIP Experience Amenities */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-serif">
              Trải Nghiệm Điện Ảnh Thượng Hạng
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Công nghệ trình chiếu chuẩn Hollywood mang đến từng khung hình mãn nhãn và âm thanh sống động
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/10 space-y-3 hover:border-red-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">IMAX Laser 4K</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Màn hình cong khổng lồ cùng hệ thống máy chiếu kép Laser đem đến hình ảnh sắc nét và độ tương phản tối đa.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/10 space-y-3 hover:border-yellow-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Dolby Atmos 12.1</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Âm thanh vòm đa chiều chuyển động quanh phòng chiếu, đưa người xem hòa mình vào từng phân cảnh hành động.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/10 space-y-3 hover:border-yellow-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Ghế VIP Hoàng Gia</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đệm da êm ái cao cấp, góc nhìn chính diện trung tâm màn hình, nâng tầm thư giãn trong suốt bộ phim.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/10 space-y-3 hover:border-pink-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Sweetbox Đôi Tình Nhân</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vách ngăn riêng tư ở hàng ghế cuối cùng với thiết kế ghế sofa liền khối dành riêng cho các cặp đôi.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Promotional Ticket Stub Vouchers */}
        <section id="vouchers" className="space-y-6 pt-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                Ưu Đãi & Voucher Độc Quyền
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập mã khi thanh toán để hưởng ưu đãi giảm giá tức thì
              </p>
            </div>
            <span className="text-xs text-red-400 font-semibold hidden sm:inline">
              Áp dụng trực tiếp tại bước đặt vé
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VoucherTicketCard
              code="CINEPLEX20"
              discountTitle="Giảm 20% Cho Đơn Đặt Vé Đầu Tiên"
              description="Dành riêng cho khách hàng mới đăng ký tài khoản thành viên. Giảm tối đa 50.000đ cho mọi đơn vé."
              validUntil="31/12/2026"
              tagLabel="THÀNH VIÊN MỚI"
              accentColor="red"
            />

            <VoucherTicketCard
              code="IMAXVIP50"
              discountTitle="Ưu Đãi 50k Suất Chiếu IMAX Laser"
              description="Áp dụng cho mọi suất chiếu định dạng IMAX Laser tại Phòng chiếu 1 vào các ngày Thứ 2 đến Thứ 5."
              validUntil="31/12/2026"
              tagLabel="ĐẶC QUYỀN IMAX"
              accentColor="gold"
            />
          </div>
        </section>
      </main>

      {/* Lightbox YouTube Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={closeTrailer}
        trailerUrl={trailerModal.url}
        movieTitle={trailerModal.title}
      />
    </div>
  );
};
