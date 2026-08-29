import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Bell, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const routeTitleMap: Record<string, { title: string; subtitle: string }> = {
  '/admin': {
    title: 'Tổng Quan Doanh Thu & KPIs',
    subtitle: 'Báo cáo thống kê hiệu suất kinh doanh và doanh số bán vé toàn hệ thống',
  },
  '/admin/dashboard': {
    title: 'Tổng Quan Doanh Thu & KPIs',
    subtitle: 'Báo cáo thống kê hiệu suất kinh doanh và doanh số bán vé toàn hệ thống',
  },
  '/admin/movies': {
    title: 'Quản Lý Danh Mục Phim',
    subtitle: 'Quản lý thông tin phim, poster, trailer và trạng thái phát hành',
  },
  '/admin/rooms': {
    title: 'Quản Lý Phòng Chiếu & Ghế',
    subtitle: 'Thiết lập định dạng phòng chiếu, sơ đồ ma trận ghế và bảo trì',
  },
  '/admin/showtimes': {
    title: 'Xếp Lịch Chiếu Suất Phim',
    subtitle: 'Lên lịch chiếu tự động, chống xung đột thời lượng và kiểm soát giá vé',
  },
  '/admin/concessions': {
    title: 'Quản Lý Bắp Nước & F&B',
    subtitle: 'Danh mục đồ ăn thức uống, combo ưu đãi và quản lý trạng thái tồn kho',
  },
  '/admin/vouchers': {
    title: 'Khuyến Mãi & Mã Giảm Giá',
    subtitle: 'Tạo mã voucher, điều kiện áp dụng và giới hạn lượt sử dụng',
  },
  '/admin/users': {
    title: 'Quản Lý Tài Khoản & Phân Quyền',
    subtitle: 'Cấp quyền tài khoản nhân viên quầy POS và kiểm soát khách hàng',
  },
};

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPath = location.pathname;
  const currentHeader = routeTitleMap[currentPath] || {
    title: 'Quản Trị Hệ Thống CINEPLEX',
    subtitle: 'Trung tâm điều hành và cấu hình rạp chiếu phim',
  };

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans antialiased">
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0b0e14]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <span>{currentHeader.title}</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentHeader.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock Card */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#161b22]/80 rounded-xl border border-slate-800 text-amber-400 font-mono font-bold text-xs tracking-wider shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{currentTime || '00:00:00'}</span>
            </div>

            {/* Notification Bell */}
            <button
              className="p-2.5 rounded-xl bg-[#161b22] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer relative"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0b0e14]" />
            </button>

            {/* Admin Profile Card */}
            <div className="px-3 py-1.5 bg-gradient-to-b from-[#161b22] to-[#11151c] rounded-xl border border-slate-800 flex items-center gap-2.5 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-xs shadow-inner shrink-0">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-white truncate leading-tight">
                    {user?.fullName || 'Quản Trị Viên'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {user?.email || 'admin@cineplex.vn'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 relative bg-radial-at-t from-[#11151f]/40 via-transparent to-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
