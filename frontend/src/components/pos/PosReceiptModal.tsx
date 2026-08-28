import React from 'react';
import { PosCheckoutResponse } from '../../types/staff';
import { Printer, CheckCircle, Ticket as TicketIcon, Popcorn, X } from 'lucide-react';

interface PosReceiptModalProps {
  receiptData: PosCheckoutResponse;
  onClose: () => void;
  onNewOrder: () => void;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  receiptData,
  onClose,
  onNewOrder,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Xuất Vé Thành Công!</h3>
              <p className="text-xs text-slate-400">
                Mã đơn: <span className="font-mono text-amber-400 font-bold">{receiptData.bookingCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Printable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cinema Receipt Paper */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-inner">
            {/* Header branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-700">
              <h2 className="text-xl font-black tracking-wider text-amber-400">CINEPLEX CINEMAS</h2>
              <p className="text-xs text-slate-400 mt-0.5">Hóa Đơn & Vé Xem Phim Điện Tử</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Thời gian: {formatDateTime(receiptData.createdAt)}
              </p>
            </div>

            {/* Movie Info */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Phim:</span>
                <span className="font-bold text-white text-sm">{receiptData.movieTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phòng chiếu:</span>
                <span className="font-semibold text-slate-200">{receiptData.roomName} ({receiptData.screenType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suất chiếu:</span>
                <span className="font-bold text-amber-300">
                  {formatDateTime(receiptData.showtimeStart)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thu ngân:</span>
                <span className="font-medium text-slate-300">{receiptData.staffName}</span>
              </div>
            </div>

            {/* Tickets Grid */}
            <div className="space-y-3 pt-3 border-t border-dashed border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TicketIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Danh Sách Vé ({receiptData.tickets.length} Vé)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {receiptData.tickets.map((t) => (
                  <div
                    key={t.ticketCode}
                    className="p-3 bg-[#0d1117] rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-amber-400">
                          Ghế {t.seatCode}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {t.seatType}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">Mã: {t.ticketCode}</p>
                      <p className="text-xs font-bold text-slate-200">
                        {t.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>

                    {t.qrCodeImageBase64 && (
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        <img
                          src={t.qrCodeImageBase64}
                          alt={`QR ${t.ticketCode}`}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Concessions Summary */}
            {receiptData.totalSnacksPrice > 0 && (
              <div className="space-y-2 pt-3 border-t border-dashed border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Popcorn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bắp Nước & Combo</span>
                </h4>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Tổng tiền bắp nước:</span>
                  <span className="font-semibold text-white">
                    {receiptData.totalSnacksPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            )}

            {/* Financials & Change */}
            <div className="space-y-1.5 pt-3 border-t border-dashed border-slate-700 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tổng tiền vé & bắp nước:</span>
                <span>{(receiptData.totalSeatsPrice + receiptData.totalSnacksPrice).toLocaleString('vi-VN')}₫</span>
              </div>
              {receiptData.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Giảm giá Voucher:</span>
                  <span>-{receiptData.discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-slate-800">
                <span>Thành tiền:</span>
                <span className="text-amber-400">{receiptData.finalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Hình thức:</span>
                <span className="font-bold text-cyan-300">
                  {receiptData.paymentMethod === 'CASH' ? 'Tiền Mặt (CASH)' : 'Chuyển Khoản QR'}
                </span>
              </div>
              {receiptData.paymentMethod === 'CASH' && receiptData.cashReceived && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>Khách đưa:</span>
                    <span>{receiptData.cashReceived.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-400">
                    <span>Tiền thối lại:</span>
                    <span>{(receiptData.changeAmount || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-[#0d1117] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn & Vé</span>
          </button>

          <button
            type="button"
            onClick={onNewOrder}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            Bán Đơn Mới
          </button>
        </div>
      </div>
    </div>
  );
};
