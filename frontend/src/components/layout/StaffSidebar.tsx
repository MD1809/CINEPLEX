import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Armchair,
  ScanLine,
  FileText,
  LogOut,
  Clock,
  Sparkles,
} from 'lucide-react';

export const StaffSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/staff/pos',
      label: 'Bán Vé Quầy (POS)',
      icon: Armchair,
      description: 'Chọn phim, ghế, bắp nước',
    },
    {
      to: '/staff/scanner',
      label: 'Soát Vé QR Scanner',
      icon: ScanLine,
      description: 'Quét camera soát vé',
    },
    {
      to: '/staff/shifts',
      label: 'Lịch Sử & Báo Cáo Ca',
      icon: FileText,
      description: 'Doanh thu & các đơn đã bán',
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0d1117] border-r border-slate-800/80 flex flex-col justify-between p-4 select-none shrink-0 z-30 shadow-2xl">
      {/* Top Branding & Staff Info */}
      <div className="space-y-4">
        {/* Logo & Portal Badge */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/20">
            CP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-wider text-white leading-none">
                CINEPLEX
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">
                STAFF PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Staff Profile Card */}
        <div className="p-3.5 bg-gradient-to-b from-[#161b22] to-[#12161c] rounded-2xl border border-slate-800/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm shadow-inner">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-white truncate leading-tight">
              {user?.fullName || 'Thu Ngân Quầy'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-black rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                {user?.role || 'STAFF'}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Ca Trực</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Nghiệp Vụ Quầy
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-bold border border-transparent hover:border-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800/60 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs leading-tight truncate">{item.label}</p>
                      <p
                        className={`text-[10px] font-medium truncate mt-0.5 ${
                          isActive ? 'text-slate-900/80' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Clock & Logout */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        {/* Live Clock Card */}
        <div className="p-3 bg-gradient-to-b from-[#161b22] to-[#0f141a] rounded-2xl border border-slate-800/80 text-center space-y-0.5 shadow-inner">
          <div className="flex items-center justify-center gap-2 text-sm font-mono font-black text-amber-400 tracking-wider">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{currentTime}</span>
          </div>
          <p className="text-[10px] text-slate-400 capitalize font-medium">{currentDate}</p>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 transition-all duration-150 cursor-pointer shadow-sm active:scale-98"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng Xuất Ca Trực</span>
        </button>
      </div>
    </aside>
  );
};
