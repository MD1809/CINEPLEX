import React, { useState } from 'react';
import { PosTransferResponse } from '../../types/staff';
import { QrCode, Copy, Check, X, Building, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface BankTransferQrModalProps {
  transferData: PosTransferResponse;
  onConfirmSuccess: () => void;
  onClose: () => void;
  isConfirming: boolean;
}

export const BankTransferQrModal: React.FC<BankTransferQrModalProps> = ({
  transferData,
  onConfirmSuccess,
  onClose,
  isConfirming,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chuyển Khoản Ngân Hàng</h3>
              <p className="text-xs text-slate-400">Mã đơn: <span className="font-mono text-amber-400 font-bold">{transferData.bookingCode}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display Card */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#0d1117] rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-amber-400/40 relative group">
            {transferData.qrCodeUrl ? (
              <img
                src={transferData.qrCodeUrl}
                alt="Mã QR Chuyển Khoản"
                className="w-56 h-56 object-contain rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-500">
                Không thể tải mã QR
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Mời khách mở App Ngân hàng hoặc Ví điện tử để quét mã</span>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-[#0d1117] rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
          {/* Bank Name */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Building className="w-3.5 h-3.5" /> Ngân hàng:
            </span>
            <span className="font-bold text-white">{transferData.bankCode || 'MBBank'}</span>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CreditCard className="w-3.5 h-3.5" /> Số tài khoản:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                {transferData.bankAccountNo}
              </span>
              <button
                onClick={() => handleCopy(transferData.bankAccountNo, 'Số tài khoản')}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Sao chép"
              >
                {copiedField === 'Số tài khoản' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Account Holder */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Chủ tài khoản:</span>
            <span className="font-bold text-white uppercase">{transferData.bankAccountName || 'CINEPLEX CINEMA'}</span>
          </div>

          {/* Transfer Amount */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Số tiền chuyển:</span>
            <span className="font-extrabold text-base text-emerald-400">
              {transferData.finalAmount.toLocaleString('vi-VN')}₫
            </span>
          </div>

          {/* Transfer Content */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nội dung chuyển:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-300">
                {transferData.transferContent}
              </span>
              <button
                onClick={() => handleCopy(transferData.transferContent, 'Nội dung chuyển khoản')}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Sao chép"
              >
                {copiedField === 'Nội dung chuyển khoản' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            disabled={isConfirming}
            onClick={onConfirmSuccess}
            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
          >
            {isConfirming ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Khách Đã Chuyển Khoản & Xuất Vé</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
