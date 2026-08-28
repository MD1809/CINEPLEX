import React, { useState } from 'react';
import { Tag, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Voucher } from '../../types/voucher';

interface VoucherInputProps {
  voucherCode: string | null;
  discountAmount: number;
  availableVouchers: Voucher[];
  onApplyVoucher: (code: string) => Promise<void>;
  onRemoveVoucher: () => void;
  loading?: boolean;
}

export const VoucherInput: React.FC<VoucherInputProps> = ({
  voucherCode,
  discountAmount,
  availableVouchers,
  onApplyVoucher,
  onRemoveVoucher,
  loading = false,
}) => {
  const [inputCode, setInputCode] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    await onApplyVoucher(inputCode.trim().toUpperCase());
  };

  const handleQuickSelect = (code: string) => {
    setInputCode(code);
    onApplyVoucher(code);
  };

  return (
    <div className="bg-[#18191E] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-red-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-tight font-serif">
            Mã Giảm Giá / Voucher Khuyến Mãi
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Nhập mã ưu đãi</span>
      </div>

      {voucherCode ? (
        /* Active Applied Voucher Banner */
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-black text-xs uppercase text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded">
                  {voucherCode}
                </span>
                <span className="text-xs font-semibold text-emerald-300">Đã áp dụng</span>
              </div>
              <p className="text-[11px] text-emerald-400/90 mt-0.5 font-mono">
                Tiết kiệm được: -{formatPrice(discountAmount)}
              </p>
            </div>
          </div>

          <button
            onClick={onRemoveVoucher}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800/40 transition-colors cursor-pointer"
            title="Hủy áp dụng mã giảm giá"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Voucher Input Form */
        <form onSubmit={handleApply} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã (VD: CINEPLEX20, CHAOBANMOI)"
              className="w-full bg-[#121317] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-slate-500 focus:outline-hidden focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!inputCode.trim() || loading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md ${
              inputCode.trim() && !loading
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
          </button>
        </form>
      )}

      {/* Quick Select Voucher Pills */}
      {availableVouchers.length > 0 && !voucherCode && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>Mã ưu đãi gợi ý cho bạn:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {availableVouchers.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleQuickSelect(v.code)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121317] hover:bg-[#202127] border border-dashed border-white/20 hover:border-yellow-500/50 text-slate-300 hover:text-yellow-400 text-xs font-mono transition-all cursor-pointer group"
              >
                <span className="font-bold text-white group-hover:text-yellow-400">{v.code}</span>
                <span className="text-[10px] text-slate-400 font-sans">({v.description})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
