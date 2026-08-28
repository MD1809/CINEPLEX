import React, { useState, useEffect } from 'react';
import { Showtime } from '../../types/showtime';
import { SeatDto, SeatMapResponse } from '../../types/booking';
import { Snack } from '../../types/snack';
import {
  PosCheckoutRequest,
  PosCheckoutResponse,
  PosTransferResponse,
} from '../../types/staff';
import { staffApi } from '../../api/staffApi';
import { bookingApi } from '../../api/bookingApi';
import { snackApi } from '../../api/snackApi';
import { voucherApi } from '../../api/voucherApi';
import { QuickShowtimeGrid } from '../../components/pos/QuickShowtimeGrid';
import { PosSeatMatrix } from '../../components/pos/PosSeatMatrix';
import { PosConcessionsPad } from '../../components/pos/PosConcessionsPad';
import { CashCalculator } from '../../components/pos/CashCalculator';
import { BankTransferQrModal } from '../../components/pos/BankTransferQrModal';
import { PosReceiptModal } from '../../components/pos/PosReceiptModal';
import {
  Armchair,
  Popcorn,
  Tag,
  Banknote,
  QrCode,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export const PosDashboardPage: React.FC = () => {
  // State: Showtimes & Selected Showtime
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState<boolean>(true);

  // State: Seat Matrix
  const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatDto[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(false);

  // State: Concessions
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<{ [snackId: number]: number }>({});
  const [isLoadingSnacks, setIsLoadingSnacks] = useState<boolean>(true);

  // State: Middle panel tab: 'SEATS' | 'SNACKS'
  const [centerTab, setCenterTab] = useState<'SEATS' | 'SNACKS'>('SEATS');

  // State: Payment Method: 'CASH' | 'BANK_TRANSFER'
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');

  // State: Voucher
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState<boolean>(false);

  // State: Modals & Processing
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [transferData, setTransferData] = useState<PosTransferResponse | null>(null);
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<PosCheckoutResponse | null>(null);

  // Fetch today showtimes & snacks on mount
  const fetchShowtimes = async () => {
    try {
      setIsLoadingShowtimes(true);
      const stRes = await staffApi.getTodayShowtimes();
      if (stRes.success && stRes.data) {
        setShowtimes(stRes.data);
        if (stRes.data.length > 0) {
          handleSelectShowtime(stRes.data[0]);
        }
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải suất chiếu: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingShowtimes(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();

    const fetchSnacks = async () => {
      try {
        setIsLoadingSnacks(true);
        const snRes = await snackApi.getAvailableSnacks();
        if (snRes.success && snRes.data) {
          setSnacks(snRes.data);
        }
      } catch (err: any) {
        console.error('Error fetching snacks', err);
      } finally {
        setIsLoadingSnacks(false);
      }
    };

    fetchSnacks();
  }, []);

  // Select Showtime handler
  const handleSelectShowtime = async (st: Showtime) => {
    setSelectedShowtime(st);
    setSelectedSeats([]);
    setVoucherCode('');
    setDiscountAmount(0);
    setIsLoadingSeats(true);

    try {
      const res = await bookingApi.getSeatMap(st.id);
      if (res.success && res.data) {
        setSeatMap(res.data);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải sơ đồ ghế: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // Toggle Seat handler
  const handleToggleSeat = (seat: SeatDto) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  // Update Snack quantity
  const handleUpdateSnackQuantity = (snackId: number, delta: number) => {
    setSelectedSnacks((prev) => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [snackId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [snackId]: next };
    });
  };

  // Clear Cart
  const handleClearCart = () => {
    setSelectedSeats([]);
    setSelectedSnacks({});
    setVoucherCode('');
    setDiscountAmount(0);
  };

  // Financial calculations
  const seatsTotal = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  const snacksTotal = Object.entries(selectedSnacks).reduce((sum, [id, qty]) => {
    const snack = snacks.find((s) => s.id === Number(id));
    return sum + (snack ? snack.price * qty : 0);
  }, 0);

  const subtotal = seatsTotal + snacksTotal;
  const finalAmount = Math.max(0, subtotal - discountAmount);

  // Apply Voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    if (subtotal <= 0) {
      toast.error('Vui lòng chọn ghế hoặc bắp nước trước khi áp dụng voucher');
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const res = await voucherApi.applyVoucher({
        voucherCode: voucherCode.trim(),
        orderAmount: subtotal,
      });
      if (res.success && res.data) {
        setDiscountAmount(res.data.discountAmount);
        toast.success(`Đã áp dụng mã giảm ${res.data.discountAmount.toLocaleString('vi-VN')}₫!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setDiscountAmount(0);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  // Handle Cash Checkout
  const handleCashCheckout = async (cashReceived: number) => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ghế để xuất vé');
      return;
    }

    const payload: PosCheckoutRequest = {
      showtimeId: selectedShowtime.id,
      seatIds: selectedSeats.map((s) => s.id),
      snacks: Object.entries(selectedSnacks).map(([snackId, quantity]) => ({
        snackId: Number(snackId),
        quantity,
      })),
      voucherCode: voucherCode.trim() || undefined,
      paymentMethod: 'CASH',
      cashReceived,
    };

    setIsProcessingCheckout(true);
    try {
      const res = await staffApi.checkoutCash(payload);
      if (res.success && res.data) {
        toast.success('Thanh toán tiền mặt và xuất vé thành công!');
        setReceiptData(res.data);
        // Refresh seats
        if (selectedShowtime) handleSelectShowtime(selectedShowtime);
        handleClearCart();
      }
    } catch (err: any) {
      toast.error('Lỗi khi thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Handle Create Transfer QR
  const handleCreateTransferQr = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ghế để xuất vé');
      return;
    }

    const payload: PosCheckoutRequest = {
      showtimeId: selectedShowtime.id,
      seatIds: selectedSeats.map((s) => s.id),
      snacks: Object.entries(selectedSnacks).map(([snackId, quantity]) => ({
        snackId: Number(snackId),
        quantity,
      })),
      voucherCode: voucherCode.trim() || undefined,
      paymentMethod: 'BANK_TRANSFER',
    };

    setIsProcessingCheckout(true);
    try {
      const res = await staffApi.checkoutTransfer(payload);
      if (res.success && res.data) {
        setTransferData(res.data);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tạo mã QR: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Handle Confirm Bank Transfer
  const handleConfirmTransfer = async () => {
    if (!transferData) return;

    setIsConfirmingTransfer(true);
    try {
      const res = await staffApi.confirmTransfer(transferData.bookingCode);
      if (res.success && res.data) {
        toast.success('Xác nhận tiền chuyển khoản thành công và xuất vé!');
        setReceiptData(res.data);
        setTransferData(null);
        // Refresh seats
        if (selectedShowtime) handleSelectShowtime(selectedShowtime);
        handleClearCart();
      }
    } catch (err: any) {
      toast.error('Lỗi khi xác nhận chuyển khoản: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsConfirmingTransfer(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] text-slate-100 overflow-hidden select-none">
      {/* POS Subheader Bar */}
      <div className="h-14 bg-[#161b22] border-b border-slate-800 px-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-sm font-extrabold text-white">Quầy Thu Ngân Bán Vé & Bắp Nước</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchShowtimes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Tải lại lịch chiếu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingShowtimes ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* 3-Column Ergonomic Workstation Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Column 1: Today Showtimes Quick Grid (3 cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <QuickShowtimeGrid
            showtimes={showtimes}
            selectedShowtimeId={selectedShowtime?.id || null}
            onSelectShowtime={handleSelectShowtime}
            isLoading={isLoadingShowtimes}
          />
        </div>

        {/* Column 2: Center Touch Matrix (Seats / Concessions) (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col space-y-2 overflow-hidden">
          {/* Top Panel Tab Switcher */}
          <div className="flex items-center bg-[#161b22] p-1 rounded-2xl border border-slate-800 gap-1.5 shrink-0">
            <button
              onClick={() => setCenterTab('SEATS')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${centerTab === 'SEATS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Armchair className="w-4 h-4" />
              <span>Sơ Đồ Ghế ({selectedSeats.length})</span>
            </button>

            <button
              onClick={() => setCenterTab('SNACKS')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${centerTab === 'SNACKS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Popcorn className="w-4 h-4" />
              <span>
                Bắp Nước ({Object.values(selectedSnacks).reduce((a, b) => a + b, 0)})
              </span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-hidden">
            {centerTab === 'SEATS' ? (
              <PosSeatMatrix
                seatMap={seatMap}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                isLoading={isLoadingSeats}
              />
            ) : (
              <PosConcessionsPad
                snacks={snacks}
                selectedSnacks={selectedSnacks}
                onUpdateQuantity={handleUpdateSnackQuantity}
                isLoading={isLoadingSnacks}
              />
            )}
          </div>
        </div>

        {/* Column 3: Cart Register & Payment Tender (4 cols) */}
        <div className="lg:col-span-4 h-full flex flex-col bg-[#161b22] rounded-2xl border border-slate-800 p-3.5 shadow-xl overflow-hidden text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-white text-sm">Đơn Hàng Hiện Tại</h2>
              {selectedShowtime && (
                <p className="text-[11px] text-amber-400 font-semibold line-clamp-1">
                  {selectedShowtime.movie.title} • {selectedShowtime.room.name}
                </p>
              )}
            </div>
            {(selectedSeats.length > 0 || Object.keys(selectedSnacks).length > 0) && (
              <button
                onClick={handleClearCart}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Xóa giỏ hàng"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cart Items Scroll Area */}
          <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 pr-1 text-xs">
            {/* Selected Seats */}
            {selectedSeats.length > 0 ? (
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Ghế Đã Chọn ({selectedSeats.length} Vé)
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat.id}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1"
                    >
                      {seat.seatCode}
                      <button
                        onClick={() => handleToggleSeat(seat)}
                        className="hover:text-white ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                Chưa chọn ghế xem phim
              </div>
            )}

            {/* Selected Concessions */}
            {Object.keys(selectedSnacks).length > 0 && (
              <div className="space-y-1 pt-1.5 border-t border-slate-800">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Bắp Nước & Combo
                </span>
                <div className="space-y-1">
                  {Object.entries(selectedSnacks).map(([id, qty]) => {
                    const snack = snacks.find((s) => s.id === Number(id));
                    if (!snack) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-1.5 rounded-xl bg-[#0d1117] border border-slate-800"
                      >
                        <div>
                          <span className="font-semibold text-white">{snack.name}</span>
                          <span className="text-slate-500 ml-1.5">x{qty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">
                            {(snack.price * qty).toLocaleString('vi-VN')}₫
                          </span>
                          <button
                            onClick={() => handleUpdateSnackQuantity(Number(id), -qty)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voucher Box */}
            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" /> Mã Giảm Giá (Voucher)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã voucher..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  disabled={isApplyingVoucher || !voucherCode.trim()}
                  onClick={handleApplyVoucher}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 text-xs transition-colors cursor-pointer"
                >
                  {isApplyingVoucher ? '...' : 'Áp dụng'}
                </button>
              </div>
            </div>

            {/* Bill Summary Breakdown */}
            <div className="pt-1.5 border-t border-slate-800 space-y-0.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Tiền vé:</span>
                <span>{seatsTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bắp nước:</span>
                <span>{snacksTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Giảm giá Voucher:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                <span>TỔNG CỘNG:</span>
                <span className="text-amber-400">{finalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Action Footer */}
          <div className="pt-2.5 border-t border-slate-800 space-y-2">
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0d1117] rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${paymentMethod === 'CASH'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tiền Mặt (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Chuyển Khoản QR</span>
              </button>
            </div>

            {/* Payment Action Container */}
            {paymentMethod === 'CASH' ? (
              <CashCalculator
                finalAmount={finalAmount}
                onConfirmCheckout={handleCashCheckout}
                isProcessing={isProcessingCheckout}
              />
            ) : (
              <div className="space-y-2">
                <button
                  disabled={selectedSeats.length === 0 || isProcessingCheckout || finalAmount <= 0}
                  onClick={handleCreateTransferQr}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 cursor-pointer ${selectedSeats.length > 0 && !isProcessingCheckout && finalAmount > 0
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                >
                  {isProcessingCheckout ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>TẠO MÃ QR CHUYỂN KHOẢN NGÂN HÀNG</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Bank Transfer QR Modal */}
      {transferData && (
        <BankTransferQrModal
          transferData={transferData}
          onConfirmSuccess={handleConfirmTransfer}
          onClose={() => setTransferData(null)}
          isConfirming={isConfirmingTransfer}
        />
      )}

      {/* Printable Receipt & Ticket Pass Modal */}
      {receiptData && (
        <PosReceiptModal
          receiptData={receiptData}
          onClose={() => setReceiptData(null)}
          onNewOrder={() => setReceiptData(null)}
        />
      )}
    </div>
  );
};
