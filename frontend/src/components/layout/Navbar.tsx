import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Film, LogOut, Ticket, Shield, LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success('Đã đăng xuất thành công.');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-cine-dark/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cine-red to-red-500 shadow-md shadow-cine-red/20 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-cine-red bg-clip-text text-transparent">
                CINEPLEX
              </span>
              <span className="text-[9px] uppercase tracking-widest text-cine-gold font-bold -mt-1">
                Premium Cinema
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/#movies"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Phim Đang Chiếu
            </Link>
            <Link
              to="/#showtimes"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Lịch Chiếu
            </Link>
            <Link
              to="/#snacks"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Bắp Nước
            </Link>
            <Link
              to="/#vouchers"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Khuyến Mãi
            </Link>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-200 transition-all"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cine-red/20 text-cine-red font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-none">{user.fullName}</p>
                    <span className="text-[10px] font-medium text-cine-gold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 p-1.5 rounded-xl bg-cine-surface border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs text-slate-400">Đăng nhập với email</p>
                      <p className="text-xs font-medium text-white truncate">{user.email}</p>
                    </div>

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-cine-gold hover:bg-cine-gold/10 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Trang Quản Trị (Admin)</span>
                      </Link>
                    )}

                    {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                      <Link
                        to="/staff/pos"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Quầy POS Thu Ngân</span>
                      </Link>
                    )}

                    <Link
                      to="/my-tickets"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Vé Của Tôi & Lịch Sử</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left mt-1 border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-4 rounded-xl bg-cine-red hover:bg-red-700 text-xs font-semibold text-white shadow-md shadow-cine-red/20 transition-all active:scale-[0.98]"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-cine-surface/95 px-4 pt-3 pb-5 space-y-2 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <Link
            to="/#movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
          >
            Phim Đang Chiếu
          </Link>
          <Link
            to="/#showtimes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
          >
            Lịch Chiếu
          </Link>
          <Link
            to="/#snacks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
          >
            Bắp Nước
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="px-3 py-1">
                <p className="text-sm font-semibold text-white">{user.fullName}</p>
                <p className="text-xs text-cine-gold font-medium uppercase">{user.role}</p>
              </div>
              <Link
                to="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
              >
                Vé Của Tôi
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-cine-gold hover:bg-cine-gold/10"
                >
                  Trang Quản Trị
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/5 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-white/5 text-sm font-semibold text-white"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-cine-red text-sm font-semibold text-white"
              >
                Đăng Ký Thành Viên
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
