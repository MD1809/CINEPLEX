import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Popcorn, Sparkles, Coffee } from 'lucide-react';
import { snackApi } from '../api/snackApi';
import { voucherApi } from '../api/voucherApi';
import { bookingApi } from '../api/bookingApi';
import { Snack } from '../types/snack';
import { Voucher } from '../types/voucher';
import { useBookingStore, SnackItemSelection } from '../stores/bookingStore';
import { useSeatHoldTimer } from '../hooks/useSeatHoldTimer';
import { SnackCard } from '../components/booking/SnackCard';
import { VoucherInput } from '../components/booking/VoucherInput';
import { ConcessionsBillSummary } from '../components/booking/ConcessionsBillSummary';
import { toast } from 'sonner';

export const ConcessionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showtimeIdParam = searchParams.get('showtimeId');
  const showtimeId = showtimeIdParam ? parseInt(showtimeIdParam, 10) : null;

  const {
    movieInfo,
    roomInfo,
    selectedSeats,
    totalSeatsAmount,
    selectedSnacks,
    setSelectedSnacks,
    voucherCode,
    discountAmount,
    setVoucher,
    holdSessionId,
    clearBooking,
  } = useBookingStore();

  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [voucherLoading, setVoucherLoading] = useState<boolean>(false);

  // Validate session: If no seats selected, redirect back to seat selection
  useEffect(() => {
    if (!showtimeId || selectedSeats.length === 0 || !movieInfo || !roomInfo) {
      toast.error('Vui lòng chọn ghế trước khi đặt bắp nước.');
      navigate(showtimeId ? `/booking/seats?showtimeId=${showtimeId}` : '/');
    }
  }, [showtimeId, selectedSeats, movieInfo, roomInfo, navigate]);

  // Load Concessions and Vouchers
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [snackRes, voucherRes] = await Promise.all([
          snackApi.getAvailableSnacks(),
          voucherApi.getAvailableVouchers(),
        ]);

        if (snackRes.success && snackRes.data) {
          setSnacks(snackRes.data);
        }
        if (voucherRes.success && voucherRes.data) {
          setAvailableVouchers(voucherRes.data);
        }
      } catch (err) {
        console.error('Failed to load concessions/vouchers:', err);
        toast.error('Không thể tải danh sách bắp nước & voucher.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Timer expiration
  const handleTimerExpire = useCallback(async () => {
    toast.error('Hết thời gian giữ ghế (5 phút). Phiên đặt vé đã bị hủy.');
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
    toast.warning('Thời gian giữ vé còn dưới 1 phút. Vui lòng hoàn tất thanh toán!', {
      duration: 6000,
    });
  }, []);

  const { formattedTime, isWarning, isExpired, percentage } = useSeatHoldTimer({
    onExpire: handleTimerExpire,
    onWarning: handleTimerWarning,
  });

  // Snack quantity handlers
  const handleIncreaseSnack = (snack: Snack) => {
    const existing = selectedSnacks.find((item) => item.snackId === snack.id);
    let updated: SnackItemSelection[];
    if (existing) {
      updated = selectedSnacks.map((item) =>
        item.snackId === snack.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [
        ...selectedSnacks,
        {
          snackId: snack.id,
          name: snack.name,
          price: snack.price,
          quantity: 1,
        },
      ];
    }
    setSelectedSnacks(updated);
  };

  const handleDecreaseSnack = (snack: Snack) => {
    const existing = selectedSnacks.find((item) => item.snackId === snack.id);
    if (!existing) return;

    let updated: SnackItemSelection[];
    if (existing.quantity === 1) {
      updated = selectedSnacks.filter((item) => item.snackId !== snack.id);
    } else {
      updated = selectedSnacks.map((item) =>
        item.snackId === snack.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    }
    setSelectedSnacks(updated);
  };

  const getSnackQuantity = (snackId: number) => {
    return selectedSnacks.find((item) => item.snackId === snackId)?.quantity || 0;
  };

  // Calculations
  const totalSnacksAmount = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalOrderAmount = totalSeatsAmount + totalSnacksAmount;
  const finalTotal = Math.max(0, subtotalOrderAmount - discountAmount);

  // Voucher apply handler
  const handleApplyVoucher = async (code: string) => {
    setVoucherLoading(true);
    try {
      const res = await voucherApi.applyVoucher({
        voucherCode: code,
        orderAmount: subtotalOrderAmount,
      });

      if (res.success && res.data) {
        setVoucher(res.data.voucherCode, res.data.discountAmount);
        toast.success(res.data.message || 'Áp dụng mã giảm giá thành công!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      toast.error(msg);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucher(null, 0);
    toast.info('Đã hủy áp dụng mã giảm giá.');
  };

  const handleBackToSeats = () => {
    navigate(`/booking/seats?showtimeId=${showtimeId}`);
  };

  const handleProceedToCheckout = () => {
    if (isExpired) {
      toast.error('Phiên giữ vé đã hết hạn.');
      return;
    }
    navigate(`/booking/checkout?showtimeId=${showtimeId}`);
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

  const filteredSnacks = snacks.filter((snack) => {
    if (activeCategory === 'ALL') return true;
    return snack.category === activeCategory;
  });

  if (loading || !movieInfo || !roomInfo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Đang chuẩn bị thực đơn bắp nước...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 pb-16">
      {/* 1. Header & Stepper */}
      <div className="bg-[#18191E] border-b border-white/10 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Back button & Movie summary */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToSeats}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Quay lại chọn ghế"
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

          {/* Stepper (1. Chọn Ghế -> 2. Bắp Nước (Active) -> 3. Thanh Toán) */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              onClick={handleBackToSeats}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] flex items-center justify-center font-black">
                ✓
              </span>
              <span>Chọn Ghế</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white shadow-md shadow-red-600/30">
              <span className="w-4 h-4 rounded-full bg-white text-red-600 text-[10px] flex items-center justify-center font-black">
                2
              </span>
              <span>Bắp Nước</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-white/10 text-slate-300 text-[10px] flex items-center justify-center font-black">
                3
              </span>
              <span>Thanh Toán</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Snacks Menu & Voucher Section (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { key: 'ALL', label: 'Tất Cả Món', icon: Sparkles },
                { key: 'COMBO', label: 'Combo Tiết Kiệm', icon: Popcorn },
                { key: 'POPCORN', label: 'Bắp Rang Bơ', icon: Popcorn },
                { key: 'DRINK', label: 'Nước Ngọt & Trà', icon: Coffee },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-[#18191E] text-slate-400 hover:text-white hover:bg-[#202127] border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Snacks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSnacks.map((snack) => (
                <SnackCard
                  key={snack.id}
                  snack={snack}
                  quantity={getSnackQuantity(snack.id)}
                  onIncrease={() => handleIncreaseSnack(snack)}
                  onDecrease={() => handleDecreaseSnack(snack)}
                />
              ))}
            </div>

            {/* Voucher Discount Section */}
            <VoucherInput
              voucherCode={voucherCode}
              discountAmount={discountAmount}
              availableVouchers={availableVouchers}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
              loading={voucherLoading}
            />
          </div>

          {/* RIGHT COLUMN: Concessions Bill Summary (4 Cols) */}
          <div className="lg:col-span-4">
            <ConcessionsBillSummary
              movieTitle={movieInfo.title}
              moviePosterUrl={movieInfo.posterUrl}
              movieAgeRating={movieInfo.ageRating}
              roomName={roomInfo.name}
              screenType={roomInfo.screenType}
              showtimeStr={formatShowtime(roomInfo.startTime, roomInfo.endTime)}
              selectedSeats={selectedSeats}
              totalSeatsAmount={totalSeatsAmount}
              selectedSnacks={selectedSnacks}
              totalSnacksAmount={totalSnacksAmount}
              voucherCode={voucherCode}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              formattedTime={formattedTime}
              isWarning={isWarning}
              isExpired={isExpired}
              percentage={percentage}
              onBackToSeats={handleBackToSeats}
              onProceedToCheckout={handleProceedToCheckout}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
