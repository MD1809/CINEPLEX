import React, { useState, useEffect } from 'react';
import { staffApi } from '../../api/staffApi';
import {
  StaffOrderSummaryDto,
  ShiftReportResponse,
  PosCheckoutResponse,
  PageResponse,
} from '../../types/staff';
import { PosReceiptModal } from '../../components/pos/PosReceiptModal';
import {
  Receipt,
  Search,
  RotateCcw,
  Calendar,
  Banknote,
  QrCode,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export const ShiftHistoryPage: React.FC = () => {
  // Filter States
  const [datePreset, setDatePreset] = useState<'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM'>('TODAY');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 10;

  // Data States
  const [ordersData, setOrdersData] = useState<PageResponse<StaffOrderSummaryDto> | null>(null);
  const [summaryData, setSummaryData] = useState<ShiftReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Order for Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<PosCheckoutResponse | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState<boolean>(false);

  // Date Preset handler
  const handleSelectDatePreset = (preset: 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM') => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7DAYS') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 6);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === '30DAYS') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 29);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
    setCurrentPage(0);
  };

  // Reset Filters
  const handleResetFilters = () => {
    handleSelectDatePreset('TODAY');
    setPaymentMethod('ALL');
    setSearchQuery('');
    setCurrentPage(0);
  };

  // Fetch Summary and Orders
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch KPI Summary for date range
      const summaryRes = await staffApi.getShiftReport(startDate, endDate);
      if (summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }

      // 2. Fetch Paginated Orders
      const ordersRes = await staffApi.getStaffOrders({
        startDate,
        endDate,
        paymentMethod: paymentMethod === 'ALL' ? undefined : paymentMethod,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        size: pageSize,
      });

      if (ordersRes.success && ordersRes.data) {
        setOrdersData(ordersRes.data);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải dữ liệu lịch sử ca trực: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, paymentMethod, currentPage]);

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchData();
  };

  // View Receipt handler
  const handleViewReceipt = async (bookingCode: string) => {
    try {
      setIsLoadingReceipt(true);
      const res = await staffApi.getBookingReceipt(bookingCode);
      if (res.success && res.data) {
        setSelectedReceipt(res.data);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải chi tiết hóa đơn: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • ${d.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] text-slate-100 overflow-hidden select-none p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wide">
                Lịch Sử Đơn Hàng & Báo Cáo Ca Trực
              </h1>
              <p className="text-xs text-slate-400">
                Tra cứu, thống kê doanh thu và in lại hóa đơn các ca làm việc của bạn
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm Mới Dữ Liệu</span>
        </button>
      </div>

      {/* KPI Stat Cards (Filtered Period) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        {/* Total Orders */}
        <div className="p-3.5 bg-gradient-to-b from-[#161b22] to-[#11161d] rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng Số Đơn</span>
            <Receipt className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black text-white">
              {summaryData?.totalOrders ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">đơn hàng</span>
          </div>
        </div>

        {/* Tickets Sold */}
        <div className="p-3.5 bg-gradient-to-b from-[#161b22] to-[#11161d] rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng Vé Bán Ra</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400">
              {summaryData?.totalTicketsSold ?? 0}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">vé xem phim</span>
          </div>
        </div>

        {/* Cash vs Bank Breakdown */}
        <div className="p-3.5 bg-gradient-to-b from-[#161b22] to-[#11161d] rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tiền Mặt / Chuyển Khoản</span>
            <Banknote className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-1 space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiền mặt:</span>
              <span className="font-bold text-emerald-300">
                {(summaryData?.cashRevenue ?? 0).toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CK Ngân hàng:</span>
              <span className="font-bold text-cyan-300">
                {(summaryData?.transferRevenue ?? 0).toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-3.5 bg-gradient-to-b from-[#1c1a14] via-[#161b22] to-[#11161d] rounded-2xl border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between text-amber-400/90 text-xs font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Tổng Doanh Thu Kỳ
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black text-amber-400 tracking-tight">
              {(summaryData?.totalRevenue ?? 0).toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#161b22] rounded-2xl border border-slate-800/90 p-3.5 space-y-3 shrink-0 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Presets */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleSelectDatePreset('TODAY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                datePreset === 'TODAY'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hôm Nay
            </button>
            <button
              onClick={() => handleSelectDatePreset('7DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                datePreset === '7DAYS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Ngày Qua
            </button>
            <button
              onClick={() => handleSelectDatePreset('30DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                datePreset === '30DAYS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Ngày Qua
            </button>
          </div>

          {/* Custom Date Range Pickers */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#0d1117] border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setStartDate(e.target.value);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-slate-500 font-bold">đến</span>
            <div className="flex items-center gap-1.5 bg-[#0d1117] border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setEndDate(e.target.value);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setPaymentMethod('ALL');
                setCurrentPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả PTTT
            </button>
            <button
              onClick={() => {
                setPaymentMethod('CASH');
                setCurrentPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-3 h-3" /> Tiền Mặt
            </button>
            <button
              onClick={() => {
                setPaymentMethod('BANK_TRANSFER');
                setCurrentPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3 h-3" /> Chuyển Khoản
            </button>
          </div>
        </div>

        {/* Search Bar Row */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm nhanh theo mã đơn (CPX-...), tên phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0"
          >
            Tìm Kiếm
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer shrink-0"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Orders Table Container */}
      <div className="flex-1 bg-[#161b22] rounded-2xl border border-slate-800/90 flex flex-col overflow-hidden shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0d1117] text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">Phim & Phòng</th>
                <th className="py-3 px-3 text-center">Ghế ({summaryData?.totalTicketsSold ?? 0})</th>
                <th className="py-3 px-3 text-center">Bắp Nước</th>
                <th className="py-3 px-3 text-right">Tổng Tiền</th>
                <th className="py-3 px-3 text-center">Phương Thức</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách đơn hàng ca trực...</span>
                    </div>
                  </td>
                </tr>
              ) : !ordersData || ordersData.content.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Không tìm thấy đơn hàng nào</p>
                      <p className="text-xs">Thử thay đổi khoảng thời gian hoặc từ khóa tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ordersData.content.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Booking Code */}
                    <td className="py-3 px-4 font-mono font-black text-amber-400">
                      {order.bookingCode}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </td>

                    {/* Movie & Room */}
                    <td className="py-3 px-3 min-w-[180px]">
                      <p className="font-bold text-white line-clamp-1">{order.movieTitle}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {order.roomName} • {order.screenType}
                      </p>
                    </td>

                    {/* Seats */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[140px] mx-auto">
                        {order.seatCodes.map((code) => (
                          <span
                            key={code}
                            className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Snacks */}
                    <td className="py-3 px-3 text-center text-slate-400 font-bold">
                      {order.snacksCount > 0 ? `x${order.snacksCount}` : '—'}
                    </td>

                    {/* Final Amount */}
                    <td className="py-3 px-3 text-right font-black text-white whitespace-nowrap">
                      {order.finalAmount.toLocaleString('vi-VN')}₫
                      {order.discountAmount > 0 && (
                        <p className="text-[9px] text-emerald-400 font-medium">
                          Giảm {order.discountAmount.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {order.paymentMethod === 'CASH' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          <Banknote className="w-3 h-3" /> Tiền Mặt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                          <QrCode className="w-3 h-3" /> Chuyển Khoản
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/30">
                        {order.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleViewReceipt(order.bookingCode)}
                        disabled={isLoadingReceipt}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700 transition-all cursor-pointer"
                        title="Xem chi tiết & In lại hóa đơn"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {ordersData && ordersData.totalPages > 1 && (
          <div className="bg-[#0d1117] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div>
              Hiển thị trang <span className="font-bold text-white">{ordersData.pageNumber + 1}</span> / {ordersData.totalPages} ({ordersData.totalElements} đơn hàng)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className={`p-1.5 rounded-xl border transition-colors ${
                  currentPage <= 0
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={ordersData.last}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  ordersData.last
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt & Ticket Pass Modal */}
      {selectedReceipt && (
        <PosReceiptModal
          receiptData={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onNewOrder={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
