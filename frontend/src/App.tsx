import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { StaffLayout } from './components/layout/StaffLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMoviesPage } from './pages/admin/AdminMoviesPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminShowtimesPage } from './pages/admin/AdminShowtimesPage';
import { AdminConcessionsPage } from './pages/admin/AdminConcessionsPage';
import { AdminVouchersPage } from './pages/admin/AdminVouchersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
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
          <Route path="/admin/showtimes" element={<AdminShowtimesPage />} />
          <Route path="/admin/concessions" element={<AdminConcessionsPage />} />
          <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
