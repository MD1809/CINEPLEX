import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  Film,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Briefcase,
  MonitorCheck,
  Crown,
} from 'lucide-react';
import {
  adminUserApi,
  UserAdminItem,
  UserBookingHistoryItem,
} from '../../api/adminUserApi';
import { toast } from 'sonner';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAdminItem | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [bookings, setBookings] = useState<UserBookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user && user.role !== 'ADMIN') {
      const loadHistory = async () => {
        try {
          setLoading(true);
          const history = await adminUserApi.getUserBookingHistory(user.id);
          setBookings(history);
        } catch (err) {
          console.error(err);
          toast.error('Không thể tải lịch sử hoạt động của người dùng!');
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isStaff = user.role === 'STAFF';
  const isCustomer = user.role === 'CUSTOMER';
  const isAdmin = user.role === 'ADMIN';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
            <CheckCircle2 className="w-3 h-3" />
            ĐÃ HOÀN TẤT
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
            <Clock className="w-3 h-3" />
            ĐANG XỬ LÝ
          </span>
        );
      case 'CANCELLED':
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
            <XCircle className="w-3 h-3" />
            ĐÃ HỦY
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const isRoot = user.isRoot || user.id === 1 || user.email === 'admin@cineplex.vn';
    if (isRoot) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase shadow-sm shadow-amber-500/10">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          ADMIN
        </span>
      );
    }

    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            CAO CẤP
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-black uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            NHÂN VIÊN RẠP
          </span>
        );
      case 'CUSTOMER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase">
            <User className="w-3.5 h-3.5" />
            KHÁCH HÀNG
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name?.trim()) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e131f] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#141a29]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center font-bold text-sm text-slate-950 font-mono shadow-md">
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>{user.fullName}</span>
                {getRoleBadge(user.role)}
              </h2>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Info Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact Info */}
            <div className="bg-[#141824] p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                THÔNG TIN LIÊN HỆ
              </span>
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{user.phoneNumber || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Tham gia:{' '}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                      : '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Card 1 */}
            <div className="bg-[#141824] p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {isStaff ? 'ĐƠN BÁN VÉ TẠI QUẦY' : isCustomer ? 'TỔNG ĐƠN ĐẶT VÉ' : 'PHÂN QUYỀN'}
              </span>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {isStaff ? <MonitorCheck className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xl font-black text-white font-mono">
                    {isStaff
                      ? user.totalStaffOrdersCount || 0
                      : isCustomer
                        ? user.totalBookingsCount || 0
                        : 'Toàn Quyền'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isStaff ? 'đơn POS xử lý' : isCustomer ? 'đơn giao dịch' : 'quản trị cụm rạp'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Card 2 */}
            <div className="bg-[#141824] p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {isStaff ? 'CA TRỰC & VAI TRÒ' : isCustomer ? 'TỔNG CHI TIÊU TÍCH LŨY' : 'CẤP ĐỘ'}
              </span>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {isStaff ? <Briefcase className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xl font-black text-amber-400 font-mono">
                    {isStaff
                      ? 'POS & Soát Vé'
                      : isCustomer
                        ? `${Number(user.totalSpentAmount || 0).toLocaleString('vi-VN')}đ`
                        : (user.isRoot || user.id === 1 || user.email === 'admin@cineplex.vn')
                          ? 'Admin'
                          : 'Cao Cấp'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isStaff ? 'ca làm việc hoạt động' : isCustomer ? 'chi tiêu đã thanh toán' : 'hệ thống CINEPLEX'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Staff Work Shifts OR Customer Booking History */}
          {isAdmin ? (
            <div className="p-6 rounded-2xl bg-[#141824] border border-slate-800 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <h4 className="text-sm font-bold text-white">Tài Khoản Quản Trị Hệ Thống</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tài khoản quản trị viên có toàn quyền kiểm soát danh mục phim, phòng chiếu, lịch chiếu, khuyến mãi và nhân sự rạp.
              </p>
            </div>
          ) : isStaff ? (
            /* Staff Work History Section */
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Lịch Sử Bán Vé POS & Ca Trực ({bookings.length} giao dịch)
                </h3>
              </div>

              {loading ? (
                <div className="py-12 text-center bg-[#141824] rounded-2xl border border-slate-800">
                  <div className="inline-block w-6 h-6 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="mt-2 text-xs text-slate-400">Đang tải lịch sử ca làm việc...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-10 text-center bg-[#141824] rounded-2xl border border-slate-800">
                  <MonitorCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">Chưa có giao dịch quầy POS nào</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nhân viên này chưa thực hiện thao tác bán vé nào tại quầy thu ngân.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-[#141824] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                          <MonitorCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-400">
                              #{b.bookingCode}
                            </span>
                            {getStatusBadge(b.status)}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                              Quầy POS
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                            {b.movieTitle}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {b.roomName} &bull; Suất chiếu:{' '}
                            <span className="font-mono text-slate-200">
                              {b.startTime?.substring(0, 5)} ~ {b.endTime?.substring(0, 5)} (
                              {b.showDate})
                            </span>
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[11px] text-slate-400">Ghế bán:</span>
                            {b.seatNames.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 space-y-1 shrink-0">
                        <div className="text-base font-black text-amber-400 font-mono">
                          {Number(b.finalAmount).toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center md:justify-end gap-1 font-mono">
                          <CreditCard className="w-3 h-3" />
                          <span>{b.paymentMethod || 'Tiền mặt/Chuyển khoản'}</span> &bull;{' '}
                          <span>
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString('vi-VN')
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Customer Booking History Section */
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  Lịch Sử Mua Vé Khách Hàng ({bookings.length} đơn)
                </h3>
              </div>

              {loading ? (
                <div className="py-12 text-center bg-[#141824] rounded-2xl border border-slate-800">
                  <div className="inline-block w-6 h-6 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="mt-2 text-xs text-slate-400">Đang tải lịch sử đặt vé...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-10 text-center bg-[#141824] rounded-2xl border border-slate-800">
                  <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">Chưa có đơn đặt vé nào</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tài khoản này chưa thực hiện giao dịch mua vé nào trong hệ thống.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-[#141824] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        {b.posterUrl ? (
                          <img
                            src={b.posterUrl}
                            alt={b.movieTitle}
                            className="w-14 h-20 rounded-xl object-cover border border-slate-800 shadow-md shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                            <Film className="w-6 h-6" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-400">
                              #{b.bookingCode}
                            </span>
                            {getStatusBadge(b.status)}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {b.channel}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                            {b.movieTitle}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {b.roomName} &bull; Suất chiếu:{' '}
                            <span className="font-mono text-slate-200">
                              {b.startTime?.substring(0, 5)} ~ {b.endTime?.substring(0, 5)} (
                              {b.showDate})
                            </span>
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[11px] text-slate-400">Ghế:</span>
                            {b.seatNames.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                          {b.snacks && b.snacks.length > 0 && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3 text-amber-400" />
                              <span>Bắp nước: {b.snacks.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 space-y-1 shrink-0">
                        <div className="text-base font-black text-amber-400 font-mono">
                          {Number(b.finalAmount).toLocaleString('vi-VN')}đ
                        </div>
                        {b.discountAmount && Number(b.discountAmount) > 0 ? (
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Giảm voucher: -{Number(b.discountAmount).toLocaleString('vi-VN')}đ
                          </div>
                        ) : null}
                        <div className="text-[10px] text-slate-400 flex items-center md:justify-end gap-1 font-mono">
                          <CreditCard className="w-3 h-3" />
                          <span>{b.paymentMethod || 'N/A'}</span> &bull;{' '}
                          <span>
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString('vi-VN')
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-[#141a29]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
