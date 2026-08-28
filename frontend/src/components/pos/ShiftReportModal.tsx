import React, { useEffect, useState } from 'react';
import { ShiftReportResponse } from '../../types/staff';
import { staffApi } from '../../api/staffApi';
import { DollarSign, Ticket, Banknote, QrCode, Calendar, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ShiftReportModalProps {
  onClose: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({ onClose }) => {
  const [report, setReport] = useState<ShiftReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await staffApi.getShiftReport();
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err: any) {
      toast.error('Không thể tải báo cáo ca trực: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Báo Cáo Doanh Thu Ca Trực</h3>
              <p className="text-xs text-slate-400">
                Thống kê doanh số bán vé & phụ thu trong ngày
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReport}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Đang tải số liệu ca trực...</span>
          </div>
        ) : report ? (
          <div className="space-y-4">
            {/* Staff Info */}
            <div className="bg-[#0d1117] p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Nhân viên:</span>
                <span className="font-bold text-white">{report.staffName} ({report.staffEmail})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Xuất lúc:
                </span>
                <span className="font-mono">{formatDateTime(report.generatedAt)}</span>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0d1117] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Tổng Đơn Hàng</span>
                <div className="text-xl font-black text-white">{report.totalOrders}</div>
              </div>
              <div className="bg-[#0d1117] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Ticket className="w-3 h-3 text-amber-400" /> Vé Đã Bán
                </span>
                <div className="text-xl font-black text-amber-400">{report.totalTicketsSold}</div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-[#0d1117] p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Phân Loại Doanh Thu
              </h4>

              <div className="space-y-2 text-xs">
                {/* Cash */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Banknote className="w-4 h-4" />
                    <span>Tiền Mặt (Cash)</span>
                  </div>
                  <span className="font-extrabold text-white text-sm">
                    {report.cashRevenue.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {/* Transfer */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <QrCode className="w-4 h-4" />
                    <span>Chuyển Khoản (Bank QR)</span>
                  </div>
                  <span className="font-extrabold text-white text-sm">
                    {report.transferRevenue.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">TỔNG DOANH THU CA:</span>
                <span className="text-xl font-black text-amber-400">
                  {report.totalRevenue.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
