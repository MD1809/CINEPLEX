import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthRequiredDialog } from './components/auth/AuthRequiredDialog';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { Film, Ticket, Sparkles, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Toaster } from 'sonner';

// Placeholder Home Component displaying system capabilities & Auth test
const HomePage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();

  return (
    <div className="min-h-screen bg-cine-dark text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cine-surface via-cine-surface-elevated to-cine-dark border border-white/10 p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cine-red/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cine-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cine-red/10 border border-cine-red/30 text-cine-red text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 2: Authentication & RBAC Active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Hệ Thống Đặt Vé Xem Phim <span className="bg-gradient-to-r from-cine-red to-red-400 bg-clip-text text-transparent">CINEPLEX</span>
            </h1>

            <p className="text-base text-slate-300 mb-8 leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao với hệ thống giữ ghế tức thì 5 phút trên Redis, thanh toán bảo mật VNPAY QR và quản trị rạp chiếu phim chuẩn quốc tế.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Button triggering Auth Gate dialog if guest */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('/booking/demo');
                  }
                }}
                className="flex items-center space-x-2 py-3.5 px-6 rounded-xl bg-cine-red hover:bg-red-700 text-white font-bold shadow-lg shadow-cine-red/30 transition-all active:scale-95"
              >
                <Ticket className="w-5 h-5" />
                <span>Thử Nghiệm Đặt Ghế (Khách Vãng Lai)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 transition-colors"
                >
                  Đăng Nhập Ngay
                </Link>
              ) : (
                <div className="py-3.5 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đã xác thực: {user?.fullName} ({user?.role})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-cine-surface border border-white/5 shadow-lg hover:border-cine-red/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cine-red/10 text-cine-red flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Khóa Ghế Redis 5 Phút</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cơ chế TTL 300s ngăn chặn xung đột chọn ghế đồng thời giữa nhiều khách hàng và quầy vé.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cine-surface border border-white/5 shadow-lg hover:border-cine-gold/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cine-gold/10 text-cine-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ma Trận Ghế & Phòng Chiếu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sơ đồ ghế thông minh phân loại Ghế Thường, VIP Hoàng Gia và Ghế đôi Sweetbox tình nhân.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cine-surface border border-white/5 shadow-lg hover:border-cine-pink/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cine-pink/10 text-cine-pink flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Phân Quyền RBAC 3 Lớp</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tách biệt hoàn toàn luồng Khách hàng, Thu ngân POS quầy và Bảng điều khiển Quản trị viên.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
      <AuthRequiredDialog />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
              <div className="min-h-screen bg-cine-dark text-white p-8">
                <Navbar />
                <div className="max-w-4xl mx-auto py-12">
                  <h1 className="text-2xl font-bold">Vé của tôi & Lịch sử đặt vé</h1>
                  <p className="text-slate-400 mt-2">Tính năng đang trong lộ trình Giai đoạn 4 & 5.</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Staff Protected Routes */}
        <Route
          path="/staff/pos"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <div className="min-h-screen bg-cine-dark text-white p-8">
                <Navbar />
                <div className="max-w-4xl mx-auto py-12">
                  <h1 className="text-2xl font-bold">Quầy Thu Ngân POS Nhân Viên</h1>
                  <p className="text-slate-400 mt-2">Tính năng đang trong lộ trình Giai đoạn 6.</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <div className="min-h-screen bg-cine-dark text-white p-8">
                <Navbar />
                <div className="max-w-4xl mx-auto py-12">
                  <h1 className="text-2xl font-bold">Bảng Điều Khiển Quản Trị Viên (Admin CMS)</h1>
                  <p className="text-slate-400 mt-2">Tính năng đang trong lộ trình Giai đoạn 3 & 6.</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
