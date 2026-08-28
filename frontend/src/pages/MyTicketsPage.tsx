import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Film,
  ShoppingBag,
  ChevronDown,
  Receipt,
  CheckCircle2,
  Calendar,
  Popcorn,
  Tag,
  CreditCard,
} from 'lucide-react';
import { ticketApi } from '../api/ticketApi';
import { BookingDetail } from '../types/ticket';
import { PerforatedTicketPass } from '../components/ticket/PerforatedTicketPass';
import { toast } from 'sonner';

export const MyTicketsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'HISTORY'>('UPCOMING');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await ticketApi.getMyBookings();
        if (res.success && res.data) {
          setBookings(res.data);
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
        toast.error('Không thể tải lịch sử vé điện tử.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const showTime = new Date(b.startTime);
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UPCOMING') return showTime >= now;
    if (activeFilter === 'HISTORY') return showTime < now;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-serif">
                  Vé Điện Tử Của Tôi
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quản lý vé xem phim, mã QR Code check-in tại rạp và chi tiết đơn hàng bắp nước
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 bg-[#18191E] p-1 rounded-2xl border border-white/10 shrink-0">
            {[
              { key: 'UPCOMING', label: 'Sắp Chiếu' },
              { key: 'ALL', label: 'Tất Cả' },
              { key: 'HISTORY', label: 'Lịch Sử' },
            ].map((tab) => {
              const isSelected = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Đang tải danh sách vé điện tử...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          /* Empty State */
          <div className="bg-[#18191E] border border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase font-serif">
              {activeFilter === 'UPCOMING'
                ? 'Bạn chưa có vé nào sắp chiếu'
                : 'Chưa có lịch sử đặt vé'}
            </h3>
            <p className="text-xs text-slate-400">
              Hãy chọn những bộ phim bom tấn đỉnh cao tại CINEPLEX và trải nghiệm công nghệ IMAX Laser ngay hôm nay!
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>Khám Phá Phim Đang Chiếu</span>
            </Link>
          </div>
        ) : (
          /* Bookings & Passes List */
          <div className="space-y-8">
            {filteredBookings.map((booking) => (
              <BookingItemCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for individual booking container with tickets & collapsible invoice details
interface BookingItemCardProps {
  booking: BookingDetail;
}

const BookingItemCard: React.FC<BookingItemCardProps> = ({ booking }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const totalSnacksCount = booking.snacks ? booking.snacks.reduce((sum, s) => sum + s.quantity, 0) : 0;
  const totalTicketsAmount = booking.tickets.reduce((sum, t) => sum + t.price, 0);
  const totalSnacksAmount = booking.snacks ? booking.snacks.reduce((sum, s) => sum + s.totalPrice, 0) : 0;

  return (
    <div className="bg-[#18191E] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* 1. Booking Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-black text-white uppercase tracking-tight">
                Mã đơn #{booking.bookingCode}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Đã Thanh Toán</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Đặt lúc {new Date(booking.createdAt).toLocaleString('vi-VN')}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Tổng thanh toán:</span>
          <span className="font-mono text-base sm:text-lg font-black text-red-500 tracking-tight">
            {formatPrice(booking.finalAmount)}
          </span>
        </div>
      </div>

      {/* 2. List of Perforated Ticket Passes */}
      <div className="space-y-4">
        {booking.tickets.map((ticket) => (
          <PerforatedTicketPass key={ticket.id} booking={booking} ticket={ticket} />
        ))}
      </div>

      {/* 3. Collapsible Concessions & Invoice Dropdown */}
      <div className="pt-2 border-t border-white/5">
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className={`w-full py-3 px-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
            isDetailsOpen
              ? 'bg-[#121317] border-red-500/40 text-white shadow-inner'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Popcorn className="w-4 h-4 text-yellow-400" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-tight">
              Chi Tiết Bắp Nước & Hóa Đơn Đơn Hàng
            </span>
            {totalSnacksCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold">
                {totalSnacksCount} món bắp nước
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px]">
                Chỉ mua vé
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>{isDetailsOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isDetailsOpen ? 'rotate-180 text-red-500' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Content */}
        {isDetailsOpen && (
          <div className="mt-3 bg-[#121317] border border-white/10 rounded-2xl p-5 space-y-4 animate-in fade-in-50 duration-200">
            
            {/* Section A: Concessions Breakdown (If snacks exist) */}
            {booking.snacks && booking.snacks.length > 0 ? (
              <div className="space-y-2.5 pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Danh Sách Combo Bắp Nước Đã Order ({totalSnacksCount} phần)</span>
                </div>

                <div className="space-y-2">
                  {booking.snacks.map((snack, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center font-bold text-xs">
                          x{snack.quantity}
                        </div>
                        <div>
                          <p className="font-bold text-white">{snack.snackName}</p>
                          <p className="text-[10px] text-slate-400">Đơn giá: {formatPrice(snack.unitPrice)}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-200">{formatPrice(snack.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pb-3 border-b border-white/10 text-xs text-slate-400 italic">
                Đơn hàng này không bao gồm bắp nước.
              </div>
            )}

            {/* Section B: Complete Transparent Bill Table */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Ticket className="w-3.5 h-3.5 text-red-500" />
                  <span>
                    Tiền vé xem phim ({booking.tickets.length} ghế:{' '}
                    <strong className="text-white font-mono">{booking.tickets.map((t) => t.seatCode).join(', ')}</strong>):
                  </span>
                </span>
                <span className="font-mono font-semibold text-white">{formatPrice(totalTicketsAmount)}</span>
              </div>

              {totalSnacksAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Popcorn className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Tiền bắp & nước uống:</span>
                  </span>
                  <span className="font-mono font-semibold text-white">+{formatPrice(totalSnacksAmount)}</span>
                </div>
              )}

              {booking.voucherCode && booking.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Mã khuyến mãi giảm giá ({booking.voucherCode}):</span>
                  </span>
                  <span className="font-mono font-bold">-{formatPrice(booking.discountAmount)}</span>
                </div>
              )}

              {/* Payment Method & Paid Time */}
              <div className="pt-2 border-t border-dashed border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Phương thức: <strong>{booking.paymentMethod || 'VNPAY Sandbox'}</strong></span>
                </span>
                {booking.paidAt && (
                  <span>Thanh toán lúc: {new Date(booking.paidAt).toLocaleString('vi-VN')}</span>
                )}
              </div>

              {/* Final Amount */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm">
                <span className="font-bold text-white uppercase tracking-tight">Tổng thanh toán đơn hàng:</span>
                <span className="font-mono text-lg font-black text-red-500">{formatPrice(booking.finalAmount)}</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
