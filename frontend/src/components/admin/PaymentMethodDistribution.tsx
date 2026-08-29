import React from 'react';
import { PaymentStat } from '../../types/adminAnalytics';
import { CreditCard, Banknote, QrCode, PieChart } from 'lucide-react';

interface PaymentMethodDistributionProps {
  stats: PaymentStat[];
  loading?: boolean;
}

export const PaymentMethodDistribution: React.FC<PaymentMethodDistributionProps> = ({
  stats,
  loading,
}) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'VNPAY':
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'CASH':
        return <Banknote className="w-4 h-4 text-emerald-400" />;
      case 'BANK_TRANSFER':
        return <QrCode className="w-4 h-4 text-purple-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-amber-400" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'VNPAY':
        return 'from-blue-500 to-cyan-400';
      case 'CASH':
        return 'from-emerald-500 to-teal-400';
      case 'BANK_TRANSFER':
        return 'from-purple-500 to-indigo-400';
      default:
        return 'from-amber-500 to-yellow-400';
    }
  };

  return (
    <div className="p-6 bg-[#0e121a] rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-400" />
            Cổng Thanh Toán
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Tỷ trọng doanh thu theo hình thức thanh toán
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm font-medium animate-pulse">
            Đang tải dữ liệu cổng thanh toán...
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Chưa có số liệu phương thức thanh toán.
          </div>
        ) : (
          stats.map((item) => (
            <div
              key={item.method}
              className="p-3.5 bg-[#131722] rounded-2xl border border-slate-800/70 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#1a202c] border border-slate-700/60">
                    {getMethodIcon(item.method)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.methodName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.transactionCount} giao dịch thành công
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-amber-400 block">
                    {new Intl.NumberFormat('vi-VN').format(item.amount)} ₫
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {item.percentage}% tổng doanh thu
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getMethodColor(
                    item.method
                  )} rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
