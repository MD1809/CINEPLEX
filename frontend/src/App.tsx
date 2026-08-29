import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { StaffLayout } from './components/layout/StaffLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMoviesPage } from './pages/admin/AdminMoviesPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
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
import { ScannerDashboardPage } from './pages/staff/ScannerDashboardPage';
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
          <Route path="/staff/scanner" element={<ScannerDashboardPage />} />
        </Route>

        {/* Admin Management Portal (Dedicated Left Sidebar, Dark Noir & Gold Accent) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/movies" element={<AdminMoviesPage />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/admin/showtimes" element={<AdminShowtimesPlaceholder />} />
          <Route path="/admin/concessions" element={<AdminConcessionsPlaceholder />} />
          <Route path="/admin/vouchers" element={<AdminVouchersPlaceholder />} />
          <Route path="/admin/users" element={<AdminUsersPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Temporary placeholders for subsequent tasks in Phase 7
function AdminShowtimesPlaceholder() {
  return (
    <div className="p-8 rounded-3xl bg-[#0e121a] border border-slate-800 text-center space-y-3">
      <h2 className="text-xl font-black text-amber-400">📅 Xếp Lịch Chiếu Suất Phim</h2>
      <p className="text-sm text-slate-400">Sẽ được triển khai chi tiết ở Task 7.5 (Timeline Scheduler chống trùng 15p).</p>
    </div>
  );
}

function AdminConcessionsPlaceholder() {
  return (
    <div className="p-8 rounded-3xl bg-[#0e121a] border border-slate-800 text-center space-y-3">
      <h2 className="text-xl font-black text-amber-400">🍿 Quản Lý Bắp Nước & F&B</h2>
      <p className="text-sm text-slate-400">Sẽ được triển khai chi tiết ở Task 7.6.</p>
    </div>
  );
}

function AdminVouchersPlaceholder() {
  return (
    <div className="p-8 rounded-3xl bg-[#0e121a] border border-slate-800 text-center space-y-3">
      <h2 className="text-xl font-black text-amber-400">🏷️ Quản Lý Khuyến Mãi & Mã Giảm Giá</h2>
      <p className="text-sm text-slate-400">Sẽ được triển khai chi tiết ở Task 7.7.</p>
    </div>
  );
}

function AdminUsersPlaceholder() {
  return (
    <div className="p-8 rounded-3xl bg-[#0e121a] border border-slate-800 text-center space-y-3">
      <h2 className="text-xl font-black text-amber-400">👥 Quản Lý Tài Khoản & Nhân Viên</h2>
      <p className="text-sm text-slate-400">Sẽ được triển khai chi tiết ở Task 7.8.</p>
    </div>
  );
}

export default App;
