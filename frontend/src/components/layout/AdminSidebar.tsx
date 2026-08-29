import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Film,
  Armchair,
  CalendarDays,
  Popcorn,
  TicketPercent,
  Users,
  LogOut,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const adminNavSections: NavSection[] = [
  {
    title: 'BÁO CÁO & THỐNG KÊ',
    items: [
      {
        to: '/admin/dashboard',
        label: 'Tổng Quan Doanh Thu',
        description: 'KPIs & Biểu đồ doanh thu',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'VẬN HÀNH CHIẾU PHIM',
    items: [
      {
        to: '/admin/movies',
        label: 'Quản Lý Phim',
        description: 'Danh mục, Trailer, Phân loại',
        icon: Film,
      },
      {
        to: '/admin/rooms',
        label: 'Phòng Chiếu & Ghế',
        description: 'Sơ đồ ghế & Định dạng phòng',
        icon: Armchair,
      },
      {
        to: '/admin/showtimes',
        label: 'Xếp Lịch Chiếu',
        description: 'Timeline suất chiếu & Phòng',
        icon: CalendarDays,
      },
    ],
  },
  {
    title: 'DỊCH VỤ & KHUYẾN MÃI',
    items: [
      {
        to: '/admin/concessions',
        label: 'Bắp Nước & Combo',
        description: 'Menu F&B & Quản lý giá',
        icon: Popcorn,
      },
      {
        to: '/admin/vouchers',
        label: 'Khuyến Mãi & Voucher',
        description: 'Mã giảm giá & Điều kiện',
        icon: TicketPercent,
      },
    ],
  },
  {
    title: 'QUẢN TRỊ HỆ THỐNG',
    items: [
      {
        to: '/admin/users',
        label: 'Quản Lý Tài Khoản',
        description: 'Phân quyền & Cấp nhân viên',
        icon: Users,
      },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi tài khoản Quản trị viên!');
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-[#0b0e14] border-r border-slate-800/80 flex flex-col h-screen select-none p-4 shrink-0 shadow-2xl relative z-30 justify-between">
      {/* Top Section: Brand & Nav List */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2 mb-3 border-b border-slate-800/60 pb-4 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-slate-950" />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-white text-base tracking-wider leading-tight">
              CINEPLEX
            </h2>
            <p className="text-[10px] text-amber-400/90 font-bold tracking-wider uppercase mt-0.5">
              Hệ Thống Quản Trị
            </p>
          </div>
        </div>

        {/* Scrollable Nav Sections */}
        <nav className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {adminNavSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-2 rounded-2xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.02]'
                            : 'text-slate-300 hover:text-white hover:bg-[#161b22] font-bold border border-transparent hover:border-slate-800'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-xl transition-colors shrink-0 ${
                                isActive
                                  ? 'bg-slate-950/20 text-slate-950'
                                  : 'bg-[#161b22] text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs leading-tight truncate">{item.label}</p>
                              <p
                                className={`text-[10px] font-medium truncate mt-0.5 ${
                                  isActive ? 'text-slate-900/80' : 'text-slate-500'
                                }`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform shrink-0 ${
                              isActive
                                ? 'text-slate-950 translate-x-0.5'
                                : 'text-slate-600 group-hover:text-slate-400'
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Logout Action */}
      <div className="pt-3 border-t border-slate-800/80 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600/90 border border-red-500/20 hover:border-red-500/40 transition-all duration-150 cursor-pointer shadow-sm active:scale-98"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
};
