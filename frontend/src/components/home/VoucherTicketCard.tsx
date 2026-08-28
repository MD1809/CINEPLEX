import React, { useState } from 'react';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface VoucherTicketProps {
  code: string;
  discountTitle: string;
  description: string;
  validUntil: string;
  tagLabel?: string;
  accentColor?: 'red' | 'gold';
}

export const VoucherTicketCard: React.FC<VoucherTicketProps> = ({
  code,
  discountTitle,
  description,
  validUntil,
  tagLabel = 'ƯU ĐÃI THÀNH VIÊN',
  accentColor = 'red',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Đã sao chép mã ưu đãi ${code}!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const isGold = accentColor === 'gold';

  return (
    <div className="relative flex flex-col sm:flex-row bg-[#18191E] rounded-2xl border border-white/10 shadow-xl overflow-hidden group hover:border-white/20 transition-all">
      {/* Left Stub: Discount Details */}
      <div className="flex-1 p-5 sm:p-6 space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isGold
                  ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{tagLabel}</span>
            </span>
          </div>

          <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {discountTitle}
          </h4>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
          <span>Hạn sử dụng: {validUntil}</span>
          <span className="text-slate-400 font-mono">Tất cả phòng chiếu</span>
        </div>
      </div>

      {/* Ticket Tear Perforation / Side Notches */}
      <div className="relative hidden sm:flex flex-col justify-between items-center py-3">
        {/* Top Notch Hole */}
        <div className="w-5 h-5 bg-[#121317] rounded-full -mt-5.5 border-b border-white/10" />
        
        {/* Dashed Line */}
        <div className="w-px h-full border-r border-dashed border-white/20 my-1" />

        {/* Bottom Notch Hole */}
        <div className="w-5 h-5 bg-[#121317] rounded-full -mb-5.5 border-t border-white/10" />
      </div>

      {/* Right Stub: Voucher Code & Barcode */}
      <div className="w-full sm:w-56 p-5 sm:p-6 bg-[#131418] flex flex-col items-center justify-center space-y-3 border-t sm:border-t-0 sm:border-l border-white/5">
        <div className="text-center w-full">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium block mb-1">
            MÃ VOUCHER
          </span>
          <div
            onClick={handleCopy}
            className="group/code relative flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 border border-white/10 hover:border-red-500/50 cursor-pointer transition-all"
            title="Nhấn để sao chép"
          >
            <span className="font-mono font-bold text-sm text-white tracking-wider">
              {code}
            </span>
            <button
              type="button"
              className="p-1 rounded text-slate-400 group-hover/code:text-white"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Barcode graphic visual simulation */}
        <div className="w-full h-7 flex items-center justify-center space-x-1 opacity-40 group-hover:opacity-75 transition-opacity px-2">
          <div className="w-1.5 h-full bg-white rounded-xs" />
          <div className="w-0.5 h-full bg-white" />
          <div className="w-2 h-full bg-white" />
          <div className="w-0.5 h-full bg-white" />
          <div className="w-1 h-full bg-white" />
          <div className="w-2.5 h-full bg-white" />
          <div className="w-0.5 h-full bg-white" />
          <div className="w-1.5 h-full bg-white" />
          <div className="w-1 h-full bg-white" />
          <div className="w-2 h-full bg-white" />
          <div className="w-0.5 h-full bg-white" />
          <div className="w-1.5 h-full bg-white" />
        </div>

        <button
          onClick={handleCopy}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : isGold
              ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30'
              : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>ĐÃ SAO CHÉP</span>
            </>
          ) : (
            <>
              <Tag className="w-3.5 h-3.5" />
              <span>SAO CHÉP MÃ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
