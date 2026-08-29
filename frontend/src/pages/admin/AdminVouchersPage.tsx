import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Percent,
  Coins,
  Copy,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { adminVoucherApi, VoucherAdminItem } from '../../api/adminVoucherApi';
import { VoucherFormModal } from '../../components/admin/VoucherFormModal';
import { toast } from 'sonner';

export const AdminVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<VoucherAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED_OR_OUT'>(
    'ALL'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState<VoucherAdminItem | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<VoucherAdminItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminVoucherApi.getAllVouchers();
      setVouchers(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách Voucher!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (voucher: VoucherAdminItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !voucher.isActive;

    // Optimistic UI update
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === voucher.id
          ? {
              ...v,
              isActive: newStatus,
              status: !newStatus
                ? 'INACTIVE'
                : v.isExpired
                ? 'EXPIRED'
                : v.usedCount >= v.usageLimit
                ? 'OUT_OF_USES'
                : 'ACTIVE',
            }
          : v
      )
    );

    try {
      await adminVoucherApi.toggleVoucherStatus(voucher.id, newStatus);
      toast.success(
        newStatus
          ? `Đã kích hoạt mã ${voucher.code}`
          : `Đã tạm ngưng mã ${voucher.code}`
      );
    } catch (err) {
      console.error(err);
      toast.error('Không thể thay đổi trạng thái voucher!');
      loadData();
    }
  };

  const handleDeleteVoucher = async () => {
    if (!deletingVoucher) return;
    const toDeleteId = deletingVoucher.id;
    const code = deletingVoucher.code;

    // Optimistic delete
    setVouchers((prev) => prev.filter((v) => v.id !== toDeleteId));
    setDeletingVoucher(null);

    try {
      await adminVoucherApi.deleteVoucher(toDeleteId);
      toast.success(`Đã xóa voucher ${code} thành công!`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể xóa voucher này!');
      loadData();
    }
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    // Status filter
    if (selectedStatus === 'ACTIVE' && v.status !== 'ACTIVE') return false;
    if (selectedStatus === 'INACTIVE' && v.status !== 'INACTIVE') return false;
    if (
      selectedStatus === 'EXPIRED_OR_OUT' &&
      v.status !== 'EXPIRED' &&
      v.status !== 'OUT_OF_USES'
    )
      return false;

    // Search query
    const matchSearch =
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchSearch;
  });

  // Calculate statistics
  const totalCount = vouchers.length;
  const activeCount = vouchers.filter((v) => v.status === 'ACTIVE').length;
  const inactiveCount = vouchers.filter((v) => v.status === 'INACTIVE').length;
  const expiredOrOutCount = vouchers.filter(
    (v) => v.status === 'EXPIRED' || v.status === 'OUT_OF_USES'
  ).length;
  const totalRedemptions = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Đang Hoạt Động
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[10px] font-black uppercase tracking-wider">
            <XCircle className="w-3 h-3" />
            Tạm Ngưng
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            Đã Hết Hạn
          </span>
        );
      case 'OUT_OF_USES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" />
            Hết Lượt Dùng
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e131f] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Quản Lý Khuyến Mãi & Voucher
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Thiết lập mã giảm giá, giới hạn số lượt sử dụng và điều kiện áp dụng cho khách hàng
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setVoucherToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Voucher Mới</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vouchers */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Tổng Mã Voucher
            </p>
            <p className="text-lg font-black text-white font-mono">{totalCount} mã</p>
          </div>
        </div>

        {/* Active Vouchers */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Đang Hoạt Động
            </p>
            <p className="text-lg font-black text-emerald-400 font-mono">{activeCount} mã</p>
          </div>
        </div>

        {/* Expired / Out of Uses */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Hết Hạn / Hết Lượt
            </p>
            <p className="text-lg font-black text-red-400 font-mono">{expiredOrOutCount} mã</p>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Tổng Lượt Đã Đổi
            </p>
            <p className="text-lg font-black text-purple-400 font-mono">
              {totalRedemptions.toLocaleString('vi-VN')} lượt
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0e131f] p-4 rounded-2xl border border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tất Cả ({totalCount})
          </button>
          <button
            onClick={() => setSelectedStatus('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'ACTIVE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Đang Hoạt Động ({activeCount})
          </button>
          <button
            onClick={() => setSelectedStatus('INACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'INACTIVE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Tạm Ngưng ({inactiveCount})
          </button>
          <button
            onClick={() => setSelectedStatus('EXPIRED_OR_OUT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'EXPIRED_OR_OUT'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Hết Hạn / Lượt ({expiredOrOutCount})
          </button>
        </div>

        {/* Search and View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã hoặc mô tả..."
              className="w-full bg-[#141824] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Xem dạng thẻ vé"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400">Đang tải danh sách voucher...</p>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="py-20 text-center bg-[#0e131f] rounded-3xl border border-slate-800">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Không tìm thấy voucher nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không có mã khuyến mãi nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: PERFORATED CINEMA TICKET CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const usagePercent = Math.min(
              100,
              Math.round((voucher.usedCount / voucher.usageLimit) * 100)
            );
            const isFinished = voucher.status === 'EXPIRED' || voucher.status === 'OUT_OF_USES';

            return (
              <div
                key={voucher.id}
                className={`relative bg-gradient-to-br from-[#121624] via-[#0e121d] to-[#0a0d14] rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl ${
                  isFinished
                    ? 'border-slate-800/60 opacity-70'
                    : voucher.isActive
                    ? 'border-amber-500/30 hover:border-amber-500 hover:shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Upper Part (Header & Big Discount) */}
                <div className="p-5 pb-2">
                  {/* Top Row: Promo Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      {voucher.discountType === 'PERCENTAGE' ? (
                        <Percent className="w-3 h-3" />
                      ) : (
                        <Coins className="w-3 h-3" />
                      )}
                      {voucher.discountType === 'PERCENTAGE' ? 'PHẦN TRĂM' : 'TIỀN MẶT'}
                    </span>
                    {getStatusBadge(voucher.status)}
                  </div>

                  {/* Big Discount Value */}
                  <div className="mt-3.5">
                    <div className="text-3xl font-black text-amber-400 tracking-tight font-mono group-hover:text-amber-300 transition-colors">
                      {voucher.discountType === 'PERCENTAGE'
                        ? `-${voucher.discountValue}%`
                        : `-${Number(voucher.discountValue).toLocaleString('vi-VN')}đ`}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-1 line-clamp-2 min-h-[32px]">
                      {voucher.description || 'Chương trình khuyến mãi rạp Cineplex'}
                    </p>
                  </div>
                </div>

                {/* Perforation Dashed Line with dynamically aligned Cutout Notches */}
                <div className="relative my-1">
                  <div className="absolute -left-3.5 -top-2.5 w-6 h-6 rounded-full bg-[#080b11] border-r-2 border-slate-800 z-10" />
                  <div className="border-b-2 border-dashed border-slate-800 group-hover:border-amber-500/30 transition-colors mx-4" />
                  <div className="absolute -right-3.5 -top-2.5 w-6 h-6 rounded-full bg-[#080b11] border-l-2 border-slate-800 z-10" />
                </div>

                {/* Card Lower Part (Code Box & Stats) */}
                <div className="p-5 pt-2 space-y-4">
                  {/* Promo Code Copy Box */}
                  <div className="bg-black/60 border border-slate-800 group-hover:border-amber-500/40 rounded-2xl p-3 flex items-center justify-between transition-colors">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                        MÃ GIẢM GIÁ
                      </span>
                      <span className="text-lg font-black text-amber-300 font-mono tracking-widest">
                        {voucher.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(voucher.code)}
                      className="p-2 rounded-xl bg-[#141a29] hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all cursor-pointer"
                      title="Sao chép mã"
                    >
                      {copiedCode === voucher.code ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Usage Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-400">Đã dùng:</span>
                      <span className="font-mono text-white">
                        <strong className="text-amber-400">{voucher.usedCount}</strong> /{' '}
                        {voucher.usageLimit} lượt ({usagePercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          usagePercent >= 100
                            ? 'bg-red-500'
                            : usagePercent >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Condition Tags */}
                  <div className="space-y-1.5 text-[11px] text-slate-400 bg-[#131825] p-2.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {Number(voucher.minOrderAmount || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    {voucher.maxDiscountAmount && (
                      <div className="flex items-center justify-between">
                        <span>Giảm tối đa:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Hạn áp dụng:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status Switch Footer */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(voucher, e)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                        voucher.isActive
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                      title="Bật/Tắt kích hoạt voucher"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          voucher.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <span>{voucher.isActive ? 'Kích hoạt' : 'Tạm ngưng'}</span>
                    </button>

                    {/* Edit and Delete Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setVoucherToEdit(voucher);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#141a29] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                        title="Chỉnh sửa voucher"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingVoucher(voucher)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW: COMPACT DETAILED LIST */
        <div className="bg-[#0e131f] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#131722] text-slate-400 border-b border-slate-800/80 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Mã Voucher</th>
                  <th className="py-3.5 px-4">Mức Giảm</th>
                  <th className="py-3.5 px-4 text-center">Điều Kiện Đơn</th>
                  <th className="py-3.5 px-4 text-center">Tiến Độ Sử Dụng</th>
                  <th className="py-3.5 px-4 text-center">Hạn Sử Dụng</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredVouchers.map((voucher) => {
                  const usagePercent = Math.min(
                    100,
                    Math.round((voucher.usedCount / voucher.usageLimit) * 100)
                  );

                  return (
                    <tr
                      key={voucher.id}
                      className="hover:bg-[#141824] transition-colors group"
                    >
                      {/* Code and Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                            {voucher.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(voucher.code)}
                            className="text-slate-500 hover:text-amber-400 transition-colors"
                            title="Sao chép"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                          {voucher.description || 'Chưa có mô tả'}
                        </p>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {voucher.discountType === 'PERCENTAGE'
                          ? `-${voucher.discountValue}%`
                          : `-${Number(voucher.discountValue).toLocaleString('vi-VN')}đ`}
                        {voucher.maxDiscountAmount && (
                          <div className="text-[10px] text-amber-400/80 font-normal">
                            Max {Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </td>

                      {/* Minimum Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {Number(voucher.minOrderAmount || 0).toLocaleString('vi-VN')}đ
                      </td>

                      {/* Usage Progress */}
                      <td className="py-3.5 px-4 text-center min-w-[140px]">
                        <div className="text-[10px] font-mono text-slate-300 mb-1">
                          {voucher.usedCount} / {voucher.usageLimit} ({usagePercent}%)
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${
                              usagePercent >= 100 ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(voucher.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setVoucherToEdit(voucher);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#141a29] hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Sửa voucher"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingVoucher(voucher)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Xóa voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voucher Form Modal */}
      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVoucherToEdit(null);
        }}
        onSuccess={loadData}
        voucherToEdit={voucherToEdit}
      />

      {/* Delete Confirmation Modal */}
      {deletingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e131f] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Xác Nhận Xóa Voucher</h3>
                <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa mã voucher{' '}
              <strong className="text-amber-400 font-mono font-bold">
                {deletingVoucher.code}
              </strong>
              ? Nếu voucher đã có khách hàng sử dụng trong các đơn hàng trước, hệ thống sẽ tự
              động lưu trữ an toàn để bảo toàn dữ liệu lịch sử hóa đơn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingVoucher(null)}
                className="px-4 py-2 rounded-xl bg-[#141a29] text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteVoucher}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
