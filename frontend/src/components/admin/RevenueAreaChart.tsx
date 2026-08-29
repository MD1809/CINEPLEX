import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { RevenueChartPoint } from '../../types/adminAnalytics';
import { BarChart3, TrendingUp, Ticket } from 'lucide-react';

interface RevenueAreaChartProps {
  data: RevenueChartPoint[];
  loading?: boolean;
}

export const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({ data, loading }) => {
  const [metricMode, setMetricMode] = useState<'revenue' | 'tickets'>('revenue');

  const formatVND = (val: number) => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}M ₫`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toFixed(0)}k ₫`;
    }
    return `${val} ₫`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload as RevenueChartPoint;
      return (
        <div className="bg-[#121620]/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl space-y-2 min-w-[200px]">
          <p className="text-xs font-black text-slate-300 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>Thời điểm:</span>
            <span className="text-amber-400 font-mono">{pData.displayDate || label}</span>
          </p>
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Tổng Doanh Thu:
              </span>
              <span className="font-mono font-bold">
                {new Intl.NumberFormat('vi-VN').format(pData.totalRevenue)} ₫
              </span>
            </div>
            <div className="flex items-center justify-between text-blue-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Doanh Thu Vé:
              </span>
              <span className="font-mono">
                {new Intl.NumberFormat('vi-VN').format(pData.ticketRevenue)} ₫
              </span>
            </div>
            <div className="flex items-center justify-between text-red-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Doanh Thu Bắp Nước:
              </span>
              <span className="font-mono">
                {new Intl.NumberFormat('vi-VN').format(pData.snackRevenue)} ₫
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Số Vé Đã Bán:
              </span>
              <span className="font-mono font-bold">{pData.ticketsCount} vé</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-[#0e121a] rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between">
      {/* Chart Header & Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Biểu Đồ Doanh Thu & Lượng Vé
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Diễn biến tăng trưởng doanh thu vé, đồ ăn và lưu lượng khách theo thời gian
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center bg-[#161b22] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('revenue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${metricMode === 'revenue'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Doanh Thu (VNĐ)</span>
          </button>
          <button
            onClick={() => setMetricMode('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${metricMode === 'tickets'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Lượng Vé (Vé)</span>
          </button>
        </div>
      </div>

      {/* Chart Area Container */}
      <div className="h-80 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium animate-pulse">
            Đang tải dữ liệu biểu đồ phân tích...
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Chưa có dữ liệu giao dịch trong khoảng thời gian này.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Revenue Gradient */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                {/* Ticket Revenue Gradient */}
                <linearGradient id="ticketRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                {/* Snack Revenue Gradient */}
                <linearGradient id="snackRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                {/* Tickets Count Gradient */}
                <linearGradient id="ticketsCountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={metricMode === 'revenue' ? formatVND : (v) => `${v}`}
              />

              <Tooltip content={<CustomTooltip />} />

              {metricMode === 'revenue' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    name="Tổng Doanh Thu"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ticketRevenue"
                    name="Doanh Thu Vé"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#ticketRevGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="snackRevenue"
                    name="Doanh Thu Bắp Nước"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#snackRevGradient)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="ticketsCount"
                  name="Số Vé Bán"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#ticketsCountGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
