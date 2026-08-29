import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  Percent,
  Coins,
  Calendar,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  adminVoucherApi,
  VoucherAdminItem,
  VoucherCreateUpdateRequest,
} from '../../api/adminVoucherApi';
import { toast } from 'sonner';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucherToEdit?: VoucherAdminItem | null;
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>(100);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Helper to format ISO to datetime-local input string
  const formatForInput = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (voucherToEdit) {
      setCode(voucherToEdit.code);
      setDescription(voucherToEdit.description || '');
      setDiscountType(voucherToEdit.discountType);
      setDiscountValue(voucherToEdit.discountValue);
      setMinOrderAmount(voucherToEdit.minOrderAmount || 0);
      setMaxDiscountAmount(voucherToEdit.maxDiscountAmount || '');
      setStartDate(formatForInput(voucherToEdit.startDate));
      setEndDate(formatForInput(voucherToEdit.endDate));
      setUsageLimit(voucherToEdit.usageLimit);
      setIsActive(voucherToEdit.isActive);
    } else {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);

      setCode('');
      setDescription('');
      setDiscountType('PERCENTAGE');
      setDiscountValue(20);
      setMinOrderAmount(100000);
      setMaxDiscountAmount(50000);
      setStartDate(formatForInput(now.toISOString()));
      setEndDate(formatForInput(in30Days.toISOString()));
      setUsageLimit(100);
      setIsActive(true);
    }
  }, [voucherToEdit, isOpen]);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'CINE';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const setValidityPreset = (days: number) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    setStartDate(formatForInput(now.toISOString()));
    setEndDate(formatForInput(future.toISOString()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Vui lòng nhập mã Voucher!');
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      toast.error('Giá trị giảm giá phải lớn hơn 0!');
      return;
    }

    if (discountType === 'PERCENTAGE' && Number(discountValue) > 100) {
      toast.error('Giảm giá phần trăm không được vượt quá 100%!');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn thời gian áp dụng!');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('Thời gian bắt đầu phải trước thời gian kết thúc!');
      return;
    }

    if (!usageLimit || Number(usageLimit) < 1) {
      toast.error('Giới hạn lượt sử dụng tối thiểu là 1!');
      return;
    }

    const payload: VoucherCreateUpdateRequest = {
      code: cleanCode,
      description: description.trim() || undefined,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount:
        discountType === 'PERCENTAGE' && maxDiscountAmount
          ? Number(maxDiscountAmount)
          : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: Number(usageLimit),
      isActive,
    };

    try {
      setSubmitting(true);
      if (voucherToEdit) {
        await adminVoucherApi.updateVoucher(voucherToEdit.id, payload);
        toast.success(`Cập nhật voucher ${cleanCode} thành công!`);
      } else {
        await adminVoucherApi.createVoucher(payload);
        toast.success(`Tạo mới voucher ${cleanCode} thành công!`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e131f] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#141a29]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {voucherToEdit ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi / Voucher Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập quy tắc giảm giá, hạn sử dụng và ngân sách khuyến mãi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Inputs Column (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Voucher Code & Generate Button */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mã Voucher (Promo Code) <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: CINEPLEX20, VIP50K..."
                    className="flex-1 bg-[#141a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-white font-mono text-sm font-bold tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Tạo mã ngẫu nhiên"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tạo Ngẫu Nhiên
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mô Tả Chương Trình Khuyến Mãi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Giảm 20% cho khách hàng thành viên khi mua từ 2 vé..."
                  className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Discount Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Hình Thức Giảm Giá <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENTAGE')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      discountType === 'PERCENTAGE'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    Giảm Theo Phần Trăm (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FIXED_AMOUNT')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      discountType === 'FIXED_AMOUNT'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    Giảm Tiền Trực Tiếp (VNĐ)
                  </button>
                </div>
              </div>

              {/* Discount Value & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {discountType === 'PERCENTAGE' ? 'Mức Giảm (%)' : 'Số Tiền Giảm (VNĐ)'}{' '}
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === 'PERCENTAGE' ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) =>
                        setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder={discountType === 'PERCENTAGE' ? '20' : '50000'}
                      className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-4 pr-10 py-2.5 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                      {discountType === 'PERCENTAGE' ? '%' : 'đ'}
                    </div>
                  </div>
                </div>

                {discountType === 'PERCENTAGE' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Giảm Tối Đa (VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={maxDiscountAmount}
                        onChange={(e) =>
                          setMaxDiscountAmount(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        placeholder="VD: 50000 (Để trống = Không giới hạn)"
                        className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-4 pr-10 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                        đ
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Đơn Tối Thiểu Áp Dụng (VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={minOrderAmount}
                        onChange={(e) =>
                          setMinOrderAmount(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        placeholder="VD: 100000"
                        className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-4 pr-10 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                        đ
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Min Order if PERCENTAGE and Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Đơn Tối Thiểu (VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={minOrderAmount}
                        onChange={(e) =>
                          setMinOrderAmount(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        placeholder="VD: 100000"
                        className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-4 pr-10 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                        đ
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tổng Lượt Dùng Tối Đa <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={usageLimit}
                      onChange={(e) =>
                        setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="VD: 100"
                      className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-4 pr-12 py-2.5 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                      lượt
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Presets and Date Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Thời Hạn Áp Dụng <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">Nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setValidityPreset(7)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold"
                    >
                      7 ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidityPreset(14)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold"
                    >
                      14 ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidityPreset(30)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold"
                    >
                      30 ngày
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Từ ngày / giờ:</label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Đến ngày / giờ:</label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141a29] border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isActive ? 'Kích Hoạt Ngay' : 'Tạm Ngưng Khuyến Mãi'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isActive
                        ? 'Khách hàng có thể áp dụng mã này khi đặt vé trực tuyến & POS'
                        : 'Mã sẽ tạm thời bị vô hiệu hóa, không thể áp dụng'}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* Right Preview Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Xem Trước Vé Khuyến Mãi (Live Preview)
                </label>

                {/* Voucher Ticket Preview Card */}
                <div className="relative bg-gradient-to-br from-[#1b1712] via-[#161924] to-[#0d1017] rounded-2xl border-2 border-amber-500/40 p-5 shadow-xl overflow-hidden group">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                      CINEPLEX PROMO
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                      }`}
                    >
                      {isActive ? 'ĐANG KÍCH HOẠT' : 'TẠM NGƯNG'}
                    </span>
                  </div>

                  {/* Discount Big Banner */}
                  <div className="my-2">
                    <div className="text-3xl font-black text-amber-400 tracking-tight font-mono">
                      {discountType === 'PERCENTAGE'
                        ? `GIẢM ${discountValue || 0}%`
                        : `GIẢM ${Number(discountValue || 0).toLocaleString('vi-VN')}đ`}
                    </div>
                    <div className="text-xs text-slate-300 font-semibold mt-1">
                      {description || 'Chưa có mô tả khuyến mãi'}
                    </div>
                  </div>

                  {/* Perforation Line with dynamically aligned Cutout Notches */}
                  <div className="relative my-3">
                    <div className="absolute -left-7 -top-2.5 w-6 h-6 rounded-full bg-[#0e131f] border-r-2 border-amber-500/40 z-10" />
                    <div className="border-b-2 border-dashed border-slate-700/80 mx-2" />
                    <div className="absolute -right-7 -top-2.5 w-6 h-6 rounded-full bg-[#0e131f] border-l-2 border-amber-500/40 z-10" />
                  </div>

                  {/* Promo Code Box */}
                  <div className="bg-black/50 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                        MÃ VOUCHER
                      </div>
                      <div className="text-base font-black text-amber-300 font-mono tracking-widest">
                        {code || 'CHƯA NHẬP MÃ'}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30 font-mono">
                      {usageLimit || 0} LƯỢT
                    </div>
                  </div>

                  {/* Terms / Constraints */}
                  <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>
                        Đơn tối thiểu:{' '}
                        <strong className="text-slate-200">
                          {Number(minOrderAmount || 0).toLocaleString('vi-VN')}đ
                        </strong>
                      </span>
                    </div>
                    {discountType === 'PERCENTAGE' && maxDiscountAmount && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>
                          Giảm tối đa:{' '}
                          <strong className="text-slate-200">
                            {Number(maxDiscountAmount).toLocaleString('vi-VN')}đ
                          </strong>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>
                        Hạn dùng:{' '}
                        <strong className="text-slate-200">
                          {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '---'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Note */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Mẹo cấu hình Voucher hiệu quả
                </div>
                <p className="text-[11px] leading-relaxed">
                  Đối với mã giảm theo phần trăm, nên đặt <strong>Giảm tối đa (Cap)</strong> để
                  kiểm soát ngân sách marketing rạp chiếu.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#141a29] text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{voucherToEdit ? 'Lưu Thay Đổi' : 'Tạo Voucher'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
