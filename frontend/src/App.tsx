import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { ConcessionsPage } from './pages/ConcessionsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { AuthRequiredDialog } from './components/auth/AuthRequiredDialog';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { Toaster } from 'sonner';

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
      <AuthRequiredDialog />

      <div className="min-h-screen bg-[#121317] text-slate-100 flex flex-col justify-between">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:slug" element={<MovieDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/payment/vnpay-return" element={<PaymentResultPage />} />

            {/* Booking Flow (Phase 4 & 5 Protected) */}
            <Route
              path="/booking/seats"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <SeatSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/concessions"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <ConcessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/checkout"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Customer Protected Routes */}
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff Protected Routes */}
            <Route
              path="/staff/pos"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
                    <h1 className="text-3xl font-bold text-white">Quầy Thu Ngân Bán Vé POS</h1>
                    <p className="text-slate-400">
                      Giao diện POS bán vé tại quầy & tính tiền thối sẽ được hoàn thiện trong Giai đoạn 6.
                    </p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
                    <h1 className="text-3xl font-bold text-white">Bảng Điều Khiển Quản Trị Viên (Admin CMS)</h1>
                    <p className="text-slate-400">
                      Tính năng báo cáo doanh thu & quản lý rạp sẽ được hoàn thiện trong Giai đoạn 7.
                    </p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
