import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  QrCode,
  Lock,
  Clock,
  AlertTriangle,
  Film,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { bookingApi } from '../api/bookingApi';
import { useBookingStore } from '../stores/bookingStore';
import { useAuthStore } from '../stores/authStore';
import { useSeatHoldTimer } from '../hooks/useSeatHoldTimer';
import { toast } from 'sonner';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showtimeIdParam = searchParams.get('showtimeId');
  const showtimeId = showtimeIdParam ? parseInt(showtimeIdParam, 10) : null;

  const { user } = useAuthStore();
  const {
    movieInfo,
    roomInfo,
    selectedSeats,
    totalSeatsAmount,
    selectedSnacks,
    voucherCode,
    discountAmount,
    holdSessionId,
    clearBooking,
  } = useBookingStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phoneNumber || '0987654321');

  // Verify that seats are selected
  useEffect(() => {
    if (!showtimeId || selectedSeats.length === 0 || !movieInfo || !roomInfo) {
      toast.error('Vui lòng chọn ghế và suất chiếu.');
      navigate(showtimeId ? `/booking/seats?showtimeId=${showtimeId}` : '/');
    }
  }, [showtimeId, selectedSeats, movieInfo, roomInfo, navigate]);

  // Sync user info if loaded
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.email) setCustomerEmail(user.email);
      if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [user]);

  // Timer handlers
  const handleTimerExpire = useCallback(async () => {
    toast.error('Thời gian giữ vé đã hết. Phiên đặt vé đã bị hủy.');
    if (holdSessionId && showtimeId) {
      try {
        await bookingApi.releaseSeats({
          holdSessionId,
          showtimeId,
        });
      } catch (err) {
        // silent
      }
    }
    clearBooking();
    navigate(showtimeId ? `/booking/seats?showtimeId=${showtimeId}` : '/');
  }, [holdSessionId, showtimeId, clearBooking, navigate]);

  const handleTimerWarning = useCallback(() => {
    toast.warning('Thời gian giữ vé còn dưới 1 phút. Vui lòng bấm Thanh Toán để hoàn tất!', {
      duration: 6000,
    });
  }, []);

  const { formattedTime, isWarning, isExpired, percentage } = useSeatHoldTimer({
    onExpire: handleTimerExpire,
    onWarning: handleTimerWarning,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatShowtime = (startIso?: string, endIso?: string) => {
    if (!startIso) return '';
    const d = new Date(startIso);
    const start = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const day = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!endIso) return `${start} - ${day}`;
    const dEnd = new Date(endIso);
    const end = `${String(dEnd.getHours()).padStart(2, '0')}:${String(dEnd.getMinutes()).padStart(2, '0')}`;
    return `${start} ~ ${end} · ${day}`;
  };

  const totalSnacksAmount = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = totalSeatsAmount + totalSnacksAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleProceedPayment = async () => {
    if (isExpired) {
      toast.error('Phiên giữ vé đã hết hạn.');
      return;
    }
    if (!customerEmail.trim()) {
      toast.error('Vui lòng nhập email nhận vé điện tử.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        showtimeId: showtimeId!,
        holdSessionId: holdSessionId!,
        seatIds: selectedSeats.map((s) => s.id),
        snacks: selectedSnacks.map((s) => ({
          snackId: s.snackId,
          quantity: s.quantity,
        })),
        voucherCode: voucherCode || undefined,
      };

      const res = await paymentApi.checkoutOnline(payload);
      if (res.success && res.data && res.data.paymentUrl) {
        toast.success('Đang chuyển hướng sang cổng thanh toán VNPAY Sandbox...');
        // Redirect browser to VNPAY Sandbox Gateway
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error('Không thể tạo liên kết thanh toán VNPAY.');
      }
    } catch (err: any) {
      console.error('Checkout failed:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch thanh toán.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!movieInfo || !roomInfo) return null;

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 pb-16">
      {/* 1. Header & Stepper */}
      <div className="bg-[#18191E] border-b border-white/10 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/booking/concessions?showtimeId=${showtimeId}`)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Quay lại chọn bắp nước"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-600 text-white">
                  {movieInfo.ageRating}
                </span>
                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-tight font-serif truncate max-w-xs sm:max-w-md">
                  {movieInfo.title}
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {roomInfo.name} &middot;{' '}
                <span className="text-yellow-400 font-bold">{roomInfo.screenType}</span> &middot;{' '}
                {formatShowtime(roomInfo.startTime, roomInfo.endTime)}
              </p>
            </div>
          </div>

          {/* Stepper (1. Chọn Ghế -> 2. Bắp Nước -> 3. Thanh Toán (Active)) */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              onClick={() => navigate(`/booking/seats?showtimeId=${showtimeId}`)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] flex items-center justify-center font-black">
                ✓
              </span>
              <span>Chọn Ghế</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => navigate(`/booking/concessions?showtimeId=${showtimeId}`)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] flex items-center justify-center font-black">
                ✓
              </span>
              <span>Bắp Nước</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white shadow-md shadow-red-600/30">
              <span className="w-4 h-4 rounded-full bg-white text-red-600 text-[10px] flex items-center justify-center font-black">
                3
              </span>
              <span>Thanh Toán</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Checkout Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Customer Info & Payment Methods (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Recipient Information Form */}
            <div className="bg-[#18191E] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white uppercase tracking-tight font-serif flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-red-500" />
                  <span>1. Thông Tin Nhận Vé Điện Tử</span>
                </h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tài khoản đã xác thực</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#121317] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Email nhận mã QR vé *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full bg-[#121317] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0987654321"
                    className="w-full bg-[#121317] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Mã vé điện tử và QR Code check-in sẽ được gửi tự động tới địa chỉ Email trên sau khi thanh toán thành công.
              </p>
            </div>

            {/* 2. Payment Gateway Selector (VNPAY Sandbox) */}
            <div className="bg-[#18191E] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white uppercase tracking-tight font-serif flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <span>2. Chọn Phương Thức Thanh Toán</span>
                </h3>
                <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                  Cổng VNPAY Sandbox
                </span>
              </div>

              <div className="space-y-3">
                {/* Unified VNPAY Payment Gateway Card */}
                <div className="p-5 rounded-2xl border bg-red-950/20 border-red-500/80 shadow-[0_0_20px_rgba(229,9,20,0.15)] space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-md shrink-0">
                        <span className="font-black text-xs text-blue-700 tracking-tighter">VN<span className="text-red-600">PAY</span></span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight font-serif">
                            Cổng Thanh Toán Điện Tử VNPAY
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Khuyên dùng
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Thanh toán bảo mật tức thì qua Cổng trung gian VNPAY Sandbox
                        </p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </div>
                  </div>

                  {/* Supported payment badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
                    <div className="bg-[#121317] p-2.5 rounded-xl border border-white/5 flex items-center space-x-2">
                      <QrCode className="w-4 h-4 text-red-500 shrink-0" />
                      <div className="text-[11px]">
                        <p className="font-bold text-white">VNPAY-QR</p>
                        <p className="text-[10px] text-slate-400">Quét qua App ngân hàng</p>
                      </div>
                    </div>
                    <div className="bg-[#121317] p-2.5 rounded-xl border border-white/5 flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-yellow-400 shrink-0" />
                      <div className="text-[11px]">
                        <p className="font-bold text-white">Thẻ ATM Nội Địa</p>
                        <p className="text-[10px] text-slate-400">40+ ngân hàng Việt Nam</p>
                      </div>
                    </div>
                    <div className="bg-[#121317] p-2.5 rounded-xl border border-white/5 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="text-[11px]">
                        <p className="font-bold text-white">Thẻ Quốc Tế</p>
                        <p className="text-[10px] text-slate-400">Visa, Master, JCB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Sandbox Credentials Pill */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <span className="font-bold flex items-center space-x-1.5 text-amber-300">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Thông tin thẻ Test VNPAY Sandbox:</span>
                </span>
                <p className="text-[11px] text-amber-300/80 font-mono">
                  Ngân hàng: <strong>NCB</strong> &middot; Số thẻ: <strong>9704198526191432198</strong> &middot; Tên: <strong>NGUYEN VAN A</strong> &middot; Ngày: <strong>07/15</strong> &middot; OTP: <strong>123456</strong>
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Final Invoice & Payment Button (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#18191E] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white uppercase tracking-tight font-serif flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <span>Tổng Kết Hóa Đơn</span>
                </h3>
              </div>

              {/* Movie info */}
              <div className="flex space-x-3 bg-[#121317] p-3 rounded-xl border border-white/5">
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-white/10">
                  {movieInfo.posterUrl ? (
                    <img src={movieInfo.posterUrl} alt={movieInfo.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight line-clamp-1 font-serif">
                      {movieInfo.title}
                    </h4>
                    <p className="text-[11px] text-yellow-400 font-bold mt-0.5">{roomInfo.screenType}</p>
                  </div>
                  <p className="text-[11px] text-slate-400">{roomInfo.name}</p>
                </div>
              </div>

              {/* 10-Minute Redis Countdown Timer */}
              <div
                className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                  isExpired
                    ? 'bg-red-950/30 border-red-500/40 text-red-400'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-[#121317] border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {isWarning ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-red-500" />}
                    <span className="font-semibold">Thời gian thanh toán:</span>
                  </div>
                  <span className="font-mono text-base font-black tracking-wider text-red-400">
                    {formattedTime}
                  </span>
                </div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${isWarning ? 'bg-amber-400' : 'bg-red-600'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vé xem phim ({selectedSeats.length} ghế):</span>
                  <span className="font-mono font-semibold text-white">{formatPrice(totalSeatsAmount)}</span>
                </div>
                <div className="flex flex-wrap gap-1 pb-1">
                  {selectedSeats.map((s) => (
                    <span key={s.id} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">
                      {s.seatCode}
                    </span>
                  ))}
                </div>

                {totalSnacksAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bắp nước ({selectedSnacks.reduce((s, i) => s + i.quantity, 0)} món):</span>
                    <span className="font-mono font-semibold text-white">+{formatPrice(totalSnacksAmount)}</span>
                  </div>
                )}

                {voucherCode && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Mã giảm giá ({voucherCode}):</span>
                    <span className="font-mono font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-dashed border-white/10">
                  <span className="text-sm font-bold text-white">Tổng cần thanh toán:</span>
                  <span className="text-xl font-black text-red-500 font-mono tracking-tight">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedPayment}
                disabled={isExpired || loading}
                className={`w-full py-4 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xl flex items-center justify-center space-x-2 ${
                  !isExpired && !loading
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 hover:scale-101 active:scale-99'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Đang kết nối VNPAY...' : 'Thanh Toán Ngay Qua VNPAY'}</span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật chuẩn mã hóa SSL 256-bit</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
