import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { StaffLayout } from './components/layout/StaffLayout';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { ConcessionsPage } from './pages/ConcessionsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { PosDashboardPage } from './pages/staff/PosDashboardPage';
import { ShiftHistoryPage } from './pages/staff/ShiftHistoryPage';
import { AuthRequiredDialog } from './components/auth/AuthRequiredDialog';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { Toaster } from 'sonner';

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
      <AuthRequiredDialog />

      <Routes>
        {/* Customer Facing Portal (With Navbar & Footer) */}
        <Route element={<CustomerLayout />}>
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
        </Route>

        {/* Staff Operations Portal (Dedicated Left Sidebar, No Customer Nav/Footer) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/staff/pos" element={<PosDashboardPage />} />
          <Route path="/staff/shifts" element={<ShiftHistoryPage />} />
          <Route
            path="/staff/scanner"
            element={
              <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
                <h1 className="text-3xl font-bold text-white">Camera Quét Mã QR Soát Vé</h1>
                <p className="text-slate-400">
                  Giao diện Camera QR Scanner sẽ được triển khai trong Task 6.3.
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
