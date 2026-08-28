import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Ticket, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { PaymentResult } from '../types/payment';
import { useBookingStore } from '../stores/bookingStore';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearBooking } = useBookingStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        const queryParams: Record<string, string> = {};
        searchParams.forEach((val, key) => {
          queryParams[key] = val;
        });

        const res = await paymentApi.verifyVnpayReturn(queryParams);
        if (res.success && res.data) {
          setResult(res.data);
          if (res.data.status === 'SUCCESS') {
            clearBooking();
          }
        } else {
          setResult({
            bookingCode: queryParams['vnp_TxnRef'] || 'UNKNOWN',
            amount: 0,
            status: 'FAILED',
            responseCode: queryParams['vnp_ResponseCode'] || '99',
            message: res.message || 'Xác thực thanh toán không thành công.',
          });
        }
      } catch (err: any) {
        console.error('Payment verification failed:', err);
        setResult({
          bookingCode: searchParams.get('vnp_TxnRef') || 'UNKNOWN',
          amount: 0,
          status: 'FAILED',
          responseCode: '99',
          message: err.response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch.',
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, clearBooking]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Đang đối soát giao dịch VNPAY...</p>
      </div>
    );
  }

  const isSuccess = result?.status === 'SUCCESS';

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#18191E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isSuccess ? 'bg-emerald-500' : 'bg-red-600'
          }`}
        />

        {/* Icon & Status */}
        <div className="relative flex flex-col items-center space-y-3">
          <div
            className={`w-18 h-18 rounded-2xl flex items-center justify-center shadow-2xl ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                : 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-red-500/20'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-serif">
            {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs">
            {isSuccess
              ? 'Chúc mừng bạn đã đặt vé thành công. Mã QR vé đã được gửi về Email và lưu trong mục Vé Của Tôi.'
              : result?.message || 'Giao dịch chưa được hoàn tất hoặc đã bị hủy từ cổng thanh toán VNPAY.'}
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-[#121317] border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs text-left">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400">Mã đơn đặt vé:</span>
            <span className="font-mono font-bold text-white uppercase">{result?.bookingCode}</span>
          </div>

          {result?.transactionId && (
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">Mã giao dịch VNPAY:</span>
              <span className="font-mono font-semibold text-slate-300">{result.transactionId}</span>
            </div>
          )}

          {result?.vnpBankCode && (
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">Ngân hàng thanh toán:</span>
              <span className="font-bold text-slate-200">{result.vnpBankCode}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Số tiền thanh toán:</span>
            <span className="font-mono text-base font-black text-red-500">
              {formatPrice(result?.amount || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isSuccess ? (
            <>
              <button
                onClick={() => navigate('/my-tickets')}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Xem Vé Của Tôi (Mã QR Check-in)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/"
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 border border-white/5"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ</span>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2"
              >
                <span>Thực Hiện Lại Đặt Vé</span>
              </button>

              <Link
                to="/"
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 border border-white/5"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ</span>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Hệ thống vé CINEPLEX Sandbox</span>
        </div>

      </div>
    </div>
  );
};
