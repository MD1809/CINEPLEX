import React, { useState, useEffect } from 'react';
import { adminAnalyticsApi } from '../../api/adminAnalyticsApi';
import {
  DashboardMetrics,
  PaymentStat,
  RevenueChartPoint,
  SoldTicket,
  TopMovieRevenue,
} from '../../types/adminAnalytics';
import { RevenueAreaChart } from '../../components/admin/RevenueAreaChart';
import { TopMoviesLeaderboard } from '../../components/admin/TopMoviesLeaderboard';
import { PaymentMethodDistribution } from '../../components/admin/PaymentMethodDistribution';
import { SoldTicketsTable } from '../../components/admin/SoldTicketsTable';
import {
  Coins,
  Ticket,
  Popcorn,
  Percent,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('7days');
  const [loading, setLoading] = useState<boolean>(true);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<RevenueChartPoint[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovieRevenue[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStat[]>([]);
  const [soldTickets, setSoldTickets] = useState<SoldTicket[]>([]);

  const loadData = async (selectedPeriod = period) => {
    setLoading(true);
    try {
      const [metricsRes, chartRes, topMoviesRes, paymentRes, ticketsRes] = await Promise.all([
        adminAnalyticsApi.getMetrics(selectedPeriod),
        adminAnalyticsApi.getRevenueChart(selectedPeriod),
        adminAnalyticsApi.getTopMovies(5, selectedPeriod),
        adminAnalyticsApi.getPaymentStats(selectedPeriod),
        adminAnalyticsApi.getSoldTickets(selectedPeriod, undefined, 50),
      ]);

      setMetrics(metricsRes);
      setChartData(chartRes);
      setTopMovies(topMoviesRes);
      setPaymentStats(paymentRes);
      setSoldTickets(ticketsRes);
    } catch (err: any) {
      console.error('Error fetching admin dashboard analytics:', err);
      toast.error('Không thể tải dữ liệu thống kê doanh thu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0b0e14] rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span>Bảng Thống Kê & Báo Cáo Hiệu Suất</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Dữ liệu doanh thu tổng hợp từ phòng vé trực tuyến & hệ thống quầy POS
          </p>
        </div>

        {/* Period Filter Buttons & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#131722] p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'today', label: 'Hôm Nay' },
              { id: '7days', label: '7 Ngày Qua' },
              { id: 'month', label: 'Tháng Này' },
              { id: 'all', label: 'Toàn Thời Gian' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === p.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(period)}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#131722] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng Doanh Thu */}
        <div className="p-5 bg-gradient-to-br from-[#121622] to-[#0c0f17] rounded-3xl border border-amber-500/30 shadow-xl shadow-amber-500/5 space-y-3 relative overflow-hidden group hover:border-amber-500/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tổng Doanh Thu</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {metrics
                ? new Intl.NumberFormat('vi-VN').format(metrics.totalRevenue) + ' ₫'
                : '0 ₫'}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-medium">
              <span className="text-blue-400 font-mono">
                Vé: {metrics ? new Intl.NumberFormat('vi-VN').format(metrics.ticketRevenue) : '0'} ₫
              </span>
              <span>•</span>
              <span className="text-red-400 font-mono">
                F&B: {metrics ? new Intl.NumberFormat('vi-VN').format(metrics.snackRevenue) : '0'} ₫
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* KPI 2: Tổng Vé Bán */}
        <div className="p-5 bg-gradient-to-br from-[#121622] to-[#0c0f17] rounded-3xl border border-blue-500/30 shadow-xl shadow-blue-500/5 space-y-3 relative overflow-hidden group hover:border-blue-500/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tổng Vé Đã Bán</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {metrics ? metrics.totalTicketsSold.toLocaleString('vi-VN') : '0'} <span className="text-sm font-bold text-blue-400">vé</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-medium">
              <span className="text-slate-300">
                Từ <strong className="text-white">{metrics?.totalOrders || 0}</strong> đơn hàng đã thanh toán
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* KPI 3: Bắp Nước & F&B */}
        <div className="p-5 bg-gradient-to-br from-[#121622] to-[#0c0f17] rounded-3xl border border-red-500/30 shadow-xl shadow-red-500/5 space-y-3 relative overflow-hidden group hover:border-red-500/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Doanh Thu Bắp Nước</span>
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 group-hover:scale-110 transition-transform">
              <Popcorn className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {metrics
                ? new Intl.NumberFormat('vi-VN').format(metrics.snackRevenue) + ' ₫'
                : '0 ₫'}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-medium">
              <span className="text-slate-300">
                {metrics && metrics.totalRevenue > 0
                  ? ((metrics.snackRevenue / metrics.totalRevenue) * 100).toFixed(1)
                  : '0'}% tỷ trọng toàn rạp
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* KPI 4: Tỷ Lệ Lấp Đầy */}
        <div className="p-5 bg-gradient-to-br from-[#121622] to-[#0c0f17] rounded-3xl border border-emerald-500/30 shadow-xl shadow-emerald-500/5 space-y-3 relative overflow-hidden group hover:border-emerald-500/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tỷ Lệ Lấp Đầy Ghế</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {metrics ? metrics.roomOccupancyRate : '0.0'}%
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold">
                {metrics?.totalActiveMovies || 0} phim đang chiếu
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Full Width Revenue & Ticket Trend Chart */}
      <RevenueAreaChart data={chartData} loading={loading} />

      {/* 2-Column Grid: Top Movies (7 cols) + Payment Methods Breakdown (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <TopMoviesLeaderboard movies={topMovies} loading={loading} />
        </div>
        <div className="lg:col-span-5">
          <PaymentMethodDistribution stats={paymentStats} loading={loading} />
        </div>
      </div>

      {/* Full Width Sold Tickets Table Section */}
      <SoldTicketsTable tickets={soldTickets} loading={loading} />
    </div>
  );
};
