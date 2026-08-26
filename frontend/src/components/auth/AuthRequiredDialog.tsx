import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Film, Lock, Ticket, Gift, ArrowRight, X } from 'lucide-react';

export const AuthRequiredDialog: React.FC = () => {
  const { isAuthModalOpen, authModalRedirectPath, closeAuthModal } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleNavigate = (path: string) => {
    closeAuthModal();
    if (authModalRedirectPath) {
      navigate(`${path}?redirect=${encodeURIComponent(authModalRedirectPath)}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-cine-surface border border-cine-red/30 shadow-2xl shadow-cine-red/10 animate-in zoom-in-95 duration-200"
      >
        {/* Background glow circle */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-cine-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-cine-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cine-red/10 border border-cine-red/30 text-cine-red shadow-lg shadow-cine-red/20">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cine-red">
              Yêu Cầu Tài Khoản
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Đăng nhập để đặt vé
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6">
          Vui lòng đăng nhập hoặc tạo tài khoản để hoàn tất việc giữ chỗ ghế xem phim và nhận các đặc quyền thành viên:
        </p>

        {/* Perks List */}
        <div className="space-y-3 mb-6 bg-cine-surface-elevated/60 p-4 rounded-xl border border-white/5">
          <div className="flex items-center space-x-3 text-sm text-slate-200">
            <div className="p-1.5 rounded-lg bg-cine-gold/10 text-cine-gold">
              <Ticket className="w-4 h-4" />
            </div>
            <span>Giữ ghế độc quyền tức thì trong <strong>5 phút</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-sm text-slate-200">
            <div className="p-1.5 rounded-lg bg-cine-red/10 text-cine-red">
              <Gift className="w-4 h-4" />
            </div>
            <span>Áp dụng mã giảm giá <strong>Voucher</strong> ưu đãi</span>
          </div>

          <div className="flex items-center space-x-3 text-sm text-slate-200">
            <div className="p-1.5 rounded-lg bg-cine-pink/10 text-cine-pink">
              <Film className="w-4 h-4" />
            </div>
            <span>Nhận <strong>Vé điện tử QR</strong> qua Email & Lưu lịch sử</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => handleNavigate('/login')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-cine-red hover:bg-red-700 text-white font-medium shadow-lg shadow-cine-red/30 transition-all active:scale-[0.99]"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleNavigate('/register')}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-medium border border-white/10 transition-colors"
          >
            Tạo tài khoản mới
          </button>
        </div>
      </div>
    </div>
  );
};
