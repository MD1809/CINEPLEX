import React from 'react';
import { Film, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-cine-surface border-t border-white/5 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cine-red text-white">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-wider uppercase text-white">
                CINEPLEX
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Hệ thống rạp chiếu phim kỹ thuật số tiêu chuẩn quốc tế IMAX & 2D Laser hàng đầu.
            </p>
          </div>

          {/* Col 2: Fast Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quy Định & Điều Khoản</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quy định đổi trả vé</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn thanh toán VNPAY</a></li>
            </ul>
          </div>

          {/* Col 3: Cinema Contacts */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Chăm Sóc Khách Hàng</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-cine-red" />
                <span>Hotline: <strong className="text-white">1900 1809</strong> (8:00 - 23:00)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-cine-red" />
                <span>Email: support@cineplex.vn</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-cine-red shrink-0 mt-0.5" />
                <span>Số 1809 Đường Điện Ảnh, Quận 1, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Partners */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Đối Tác Thanh Toán</h4>
            <p className="text-xs mb-3">Chấp nhận thanh toán trực tuyến qua cổng VNPAY QR, Thẻ ATM/Visa/MasterCard.</p>
            <div className="flex items-center space-x-2">
              <span className="py-1 px-2.5 rounded bg-white/10 text-[11px] font-bold text-white">VNPAY</span>
              <span className="py-1 px-2.5 rounded bg-white/10 text-[11px] font-bold text-white">VISA</span>
              <span className="py-1 px-2.5 rounded bg-white/10 text-[11px] font-bold text-white">MASTERCARD</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 CINEPLEX System. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-cine-red fill-cine-red" />
            <span>for Cinema Lovers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
