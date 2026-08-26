import { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Armchair, 
  Ticket, 
  Tv, 
  ShieldCheck, 
  CheckCircle2,
  Play,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [selectedSeat, setSelectedSeat] = useState<string | null>('F7');

  const demoSeats = [
    { code: 'F5', type: 'REGULAR', price: 90000, color: 'bg-slate-600 text-slate-200' },
    { code: 'F6', type: 'REGULAR', price: 90000, color: 'bg-slate-600 text-slate-200' },
    { code: 'F7', type: 'VIP', price: 110000, color: 'bg-[#e9c349] text-slate-950 font-bold shadow-[0_0_12px_rgba(233,195,73,0.5)]' },
    { code: 'F8', type: 'VIP', price: 110000, color: 'bg-[#e9c349]/40 text-amber-200' },
    { code: 'H1-H2', type: 'SWEETBOX', price: 240000, color: 'bg-[#ec4899] text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]' },
  ];

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 flex flex-col selection:bg-[#e50914] selection:text-white">
      <Toaster position="top-right" theme="dark" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e50914] to-[#990000] flex items-center justify-center cinema-glow">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-2xl tracking-wider text-gradient-red">
              CINEPLEX
            </span>
            <span className="text-[10px] block font-semibold text-slate-400 tracking-widest uppercase">
              Cinema & Lounge
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#movies" className="text-white hover:text-[#e50914] transition-colors">Phim Đang Chiếu</a>
          <a href="#schedule" className="hover:text-[#e50914] transition-colors">Lịch Chiếu</a>
          <a href="#concessions" className="hover:text-[#e50914] transition-colors">Bắp Nước</a>
          <a href="#vouchers" className="hover:text-[#e50914] transition-colors">Khuyến Mãi</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("Hệ thống frontend đã sẵn sàng kết nối API Backend Spring Boot!")}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1e1f23] hover:bg-[#292a2e] border border-white/10 transition-all text-slate-200"
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => toast.info("Tính năng đặt vé nhanh đang được kết nối...")}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#e50914] to-[#ff2b36] hover:brightness-110 text-white cinema-glow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Đặt Vé Ngay
          </button>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/15 border border-[#e50914]/30 text-[#ff4b55] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giao Diện Độc Bản Cinematic Noir</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Trải Nghiệm Điện Ảnh Đỉnh Cao Tại <span className="text-gradient-red">CINEPLEX</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Khung kiến trúc hiện đại chuẩn Production: React 19 + Tailwind CSS + Shadcn UI, kết nối Spring Boot 3.4.3 (Java 21 LTS), MySQL 9.6 & Redis Lock 5 phút.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => toast.success("Đang phát trailer mẫu...")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-[#c7000b] text-white text-sm font-semibold flex items-center gap-2 cinema-glow hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-white" /> Xem Trailer
              </button>
              <button 
                onClick={() => toast.info("Xem lịch chiếu hôm nay")}
                className="px-5 py-2.5 rounded-xl bg-[#292a2e] hover:bg-[#34353b] text-slate-200 text-sm font-semibold border border-white/10 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#e9c349]" /> Suất Chiếu Hôm Nay
              </button>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="w-full md:w-80 space-y-3">
            <div className="p-4 rounded-2xl bg-[#1e1f23]/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Backend Status</span>
                <span className="text-emerald-400 font-semibold">Ready (Port 8080)</span>
              </div>
              <div className="text-sm font-medium text-slate-200">Spring Boot 3.4.3 (Java 21 LTS)</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1e1f23]/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Database Status</span>
                <span className="text-amber-400 font-semibold">Connected</span>
              </div>
              <div className="text-sm font-medium text-slate-200">MySQL 9.6.0 (cineplex_db)</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1e1f23]/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#ff4b55]" /> Seat Lock Engine</span>
                <span className="text-[#ff4b55] font-semibold">TTL 300s (5:00)</span>
              </div>
              <div className="text-sm font-medium text-slate-200">Redis Distributed Lock</div>
            </div>
          </div>
        </section>

        {/* Mini Seat Selector Demo */}
        <section className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Armchair className="w-5 h-5 text-[#e9c349]" /> Minh Họa Ma Trận Ghế & Màu Sắc Phân Hạng
              </h2>
              <p className="text-xs text-slate-400">Thử click ghế để kiểm tra tương tác trạng thái.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-600"></span> Thường</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#e9c349]"></span> VIP (Gold)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#ec4899]"></span> Sweetbox (Đôi)</span>
            </div>
          </div>

          {/* Curved Screen Simulation */}
          <div className="flex flex-col items-center space-y-2 py-4">
            <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-[#e50914] to-transparent rounded-full curved-screen-glow"></div>
            <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-[#e50914]" /> Màn Hình Chiếu (Screen)
            </span>
          </div>

          {/* Seat Grid */}
          <div className="flex justify-center gap-4 py-4">
            {demoSeats.map((seat) => {
              const isSelected = selectedSeat === seat.code;
              return (
                <button
                  key={seat.code}
                  onClick={() => {
                    setSelectedSeat(seat.code);
                    toast.success(`Đã chọn ghế ${seat.code} (${seat.type}) - ${seat.price.toLocaleString('vi-VN')} đ`);
                  }}
                  className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center text-xs transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-500 text-slate-950 font-bold scale-110 shadow-[0_0_15px_rgba(34,197,94,0.6)] ring-2 ring-white' 
                      : seat.color
                  }`}
                >
                  <Armchair className="w-4 h-4 mb-0.5" />
                  <span>{seat.code}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>CINEPLEX Fullstack Cinema Management & Booking System &copy; 2026</p>
        <p className="mt-1 flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#e50914]" /> Hệ thống rạp chiếu phim chất lượng cao
          <Ticket className="w-3.5 h-3.5 text-[#e9c349]" /> Hỗ trợ đặt vé Online & Quầy POS
        </p>
      </footer>
    </div>
  );
}
