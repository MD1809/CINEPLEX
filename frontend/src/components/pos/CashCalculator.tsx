import React, { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

interface CashCalculatorProps {
  finalAmount: number;
  onConfirmCheckout: (cashReceived: number) => void;
  isProcessing: boolean;
}

export const CashCalculator: React.FC<CashCalculatorProps> = ({
  finalAmount,
  onConfirmCheckout,
  isProcessing,
}) => {
  const [cashReceived, setCashReceived] = useState<number>(finalAmount);

  useEffect(() => {
    setCashReceived(finalAmount);
  }, [finalAmount]);

  const quickTenders = [
    { label: 'Đúng Tiền', value: finalAmount },
    { label: '50.000₫', value: 50000 },
    { label: '100.000₫', value: 100000 },
    { label: '200.000₫', value: 200000 },
    { label: '500.000₫', value: 500000 },
    { label: '1.000.000₫', value: 1000000 },
  ];

  const changeAmount = cashReceived - finalAmount;
  const isSufficient = changeAmount >= 0 && finalAmount > 0;

  const handleSetExact = (amount: number) => {
    setCashReceived(amount);
  };

  return (
    <div className="space-y-3 select-none">
      {/* Tender Inputs & Change Summary Card */}
      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Tiền cần thu:</span>
          <span className="text-base font-black text-amber-400">
            {finalAmount.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Input Cash Received */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold">Khách đưa (VND):</span>
            <button
              type="button"
              onClick={() => setCashReceived(finalAmount)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
            >
              <RotateCcw className="w-3 h-3" /> Đặt lại
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="1000"
              min={0}
              value={cashReceived === 0 ? '' : cashReceived}
              onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
              className="w-full bg-[#161b22] border border-slate-700/80 rounded-xl px-3 py-2 text-base font-black text-white text-right focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="0"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
              VND
            </span>
          </div>
        </div>

        {/* Change Return Calculation */}
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
            isSufficient
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isSufficient ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isSufficient ? 'Tiền thối lại' : 'Còn thiếu'}
            </span>
          </div>
          <span className="text-base font-black tracking-tight">
            {Math.abs(changeAmount).toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

      {/* Quick Cash Tender Buttons */}
      <div className="space-y-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          Mệnh giá tiền mặt nhanh:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {quickTenders.map((tender, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSetExact(tender.value)}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                cashReceived === tender.value
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80'
              }`}
            >
              {tender.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Submit */}
      <button
        disabled={!isSufficient || isProcessing || finalAmount <= 0}
        onClick={() => onConfirmCheckout(cashReceived)}
        className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 cursor-pointer ${
          isSufficient && !isProcessing && finalAmount > 0
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        {isProcessing ? (
          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Banknote className="w-4 h-4" />
            <span>XUẤT VÉ & THANH TOÁN TIỀN MẶT</span>
          </>
        )}
      </button>
    </div>
  );
};
