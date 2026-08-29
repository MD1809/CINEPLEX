import React, { useState, useEffect } from 'react';
import { adminSnackApi, SnackFormData } from '../../api/adminSnackApi';
import { Snack, SnackCategory } from '../../types/snack';
import { SnackFormModal } from '../../components/admin/SnackFormModal';
import {
  Popcorn,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  AlertTriangle,
  Sparkles,
  CupSoda,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminConcessionsPage: React.FC = () => {
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSnack, setEditingSnack] = useState<Snack | null>(null);
  const [deletingSnack, setDeletingSnack] = useState<Snack | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminSnackApi.getAllSnacksForAdmin();
      setSnacks(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách bắp nước & combo!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSnack(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (snack: Snack) => {
    setEditingSnack(snack);
    setIsModalOpen(true);
  };

  const handleSubmitSnack = async (formData: SnackFormData) => {
    setSubmitting(true);
    try {
      if (editingSnack) {
        await adminSnackApi.updateSnack(editingSnack.id, formData);
        toast.success('Cập nhật món thành công!');
      } else {
        await adminSnackApi.createSnack(formData);
        toast.success('Thêm món mới thành công!');
      }
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (snack: Snack, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !snack.isAvailable;

    // Optimistic UI update
    setSnacks((prev) =>
      prev.map((s) => (s.id === snack.id ? { ...s, isAvailable: newStatus } : s))
    );

    try {
      await adminSnackApi.toggleAvailability(snack.id, newStatus);
      toast.success(
        newStatus
          ? `Đã mở bán lại món "${snack.name}"`
          : `Đã đánh dấu hết hàng món "${snack.name}"`
      );
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái món!');
      loadData(); // Revert on failure
    }
  };

  const handleDeleteSnack = async () => {
    if (!deletingSnack) return;
    const toDeleteId = deletingSnack.id;

    // Optimistic UI delete
    setSnacks((prev) => prev.filter((s) => s.id !== toDeleteId));
    setDeletingSnack(null);

    try {
      await adminSnackApi.deleteSnack(toDeleteId);
      toast.success('Đã xóa món thành công!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể xóa món này!');
      loadData();
    }
  };

  // Filtered snacks
  const filteredSnacks = snacks.filter((snack) => {
    const matchesCategory =
      selectedCategory === 'ALL' || snack.category === selectedCategory;
    const matchesSearch =
      snack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (snack.description &&
        snack.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalCount = snacks.length;
  const availableCount = snacks.filter((s) => s.isAvailable).length;
  const outOfStockCount = totalCount - availableCount;
  const averagePrice =
    totalCount > 0
      ? Math.round(
        snacks.reduce((sum, s) => sum + Number(s.price), 0) / totalCount
      )
      : 0;

  const getCategoryBadge = (category: SnackCategory) => {
    switch (category) {
      case 'POPCORN':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Popcorn className="w-3 h-3" />
            Bắp Rang
          </span>
        );
      case 'DRINK':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <CupSoda className="w-3 h-3" />
            Nước Ngọt
          </span>
        );
      case 'COMBO':
        return (
          <span className=" inline-flex px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Combo F&B
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0b0e14] rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span>Quản Lý Bắp Nước & Menu F&B</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono">
              {snacks.length} món
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Quản lý danh mục đồ ăn thức uống, cập nhật giá bán và bật/tắt trạng thái kinh doanh
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#131722] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Thêm Món Mới
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Snacks */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Popcorn className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Menu F&B</p>
            <p className="text-lg font-black text-white font-mono">{totalCount} món</p>
          </div>
        </div>

        {/* Available */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang Phục Vụ</p>
            <p className="text-lg font-black text-emerald-400 font-mono">{availableCount} món</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tạm Hết Hàng</p>
            <p className="text-lg font-black text-red-400 font-mono">{outOfStockCount} món</p>
          </div>
        </div>

        {/* Average Price */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Giá Bán Trung Bình</p>
            <p className="text-lg font-black text-amber-400 font-mono">{averagePrice.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#0e121a] rounded-3xl border border-slate-800/80">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategory === 'ALL'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            Tất Cả ({totalCount})
          </button>
          <button
            onClick={() => setSelectedCategory('POPCORN')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedCategory === 'POPCORN'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            <Popcorn className="w-3.5 h-3.5" />
            Bắp Rang
          </button>
          <button
            onClick={() => setSelectedCategory('DRINK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedCategory === 'DRINK'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            <CupSoda className="w-3.5 h-3.5" />
            Nước Ngọt
          </button>
          <button
            onClick={() => setSelectedCategory('COMBO')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedCategory === 'COMBO'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Combo F&B
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm bắp nước, combo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
              title="Xem dạng thẻ ảnh"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'table'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
              title="Xem dạng bảng chi tiết"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-medium animate-pulse">
          Đang tải danh mục bắp nước & combo...
        </div>
      ) : filteredSnacks.length === 0 ? (
        <div className="py-16 text-center bg-[#0e121a] rounded-3xl border border-slate-800/80 space-y-2">
          <Popcorn className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-white font-bold text-sm">Không tìm thấy món bắp nước nào</p>
          <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredSnacks.map((snack) => (
            <div
              key={snack.id}
              className={`bg-[#0b0e14] rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:border-slate-700 shadow-xl ${snack.isAvailable
                ? 'border-slate-800/80 hover:shadow-amber-500/5'
                : 'border-red-950/40 opacity-75'
                }`}
            >
              <div>
                {/* Photo Image Banner */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {snack.imageUrl ? (
                    <img
                      src={snack.imageUrl}
                      alt={snack.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 space-y-1">
                      <Popcorn className="w-8 h-8" />
                      <span className="text-[10px] font-mono">Chưa có ảnh</span>
                    </div>
                  )}

                  {/* Top Stock Status Badge Overlay */}
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase font-mono shadow-md ${snack.isAvailable
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-red-600 text-white'
                        }`}
                    >
                      {snack.isAvailable ? 'Còn Hàng' : 'Hết Hàng'}
                    </span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-black text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {snack.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                    {snack.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                  </p>

                  {/* Category (Left) & Price (Right) Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div>{getCategoryBadge(snack.category)}</div>
                    <span className="text-amber-400 font-mono font-black text-sm">
                      {Number(snack.price).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-slate-800/60 mt-3 flex items-center justify-between">
                {/* 1-Click Availability Toggle Switch */}
                <button
                  type="button"
                  onClick={(e) => handleToggleAvailability(snack, e)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer ${snack.isAvailable
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-red-400 hover:text-red-300'
                    }`}
                  title="Nhấp để bật/tắt trạng thái kinh doanh"
                >
                  <div
                    className={`w-7 h-4 rounded-full transition-colors relative ${snack.isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${snack.isAvailable ? 'right-0.5' : 'left-0.5'
                        }`}
                    />
                  </div>
                  <span>{snack.isAvailable ? 'Đang bán' : 'Tạm ngưng'}</span>
                </button>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(snack)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                    title="Chỉnh sửa món"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingSnack(snack)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                    title="Xóa món"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-[#0e121a]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#131722] text-slate-400 border-b border-slate-800/80 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4 text-center">Danh Mục</th>
                <th className="py-3.5 px-4 text-center">Đơn Giá</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSnacks.map((snack) => (
                <tr key={snack.id} className="hover:bg-[#141824] transition-colors group">
                  {/* Snack Info */}
                  <td className="py-3.5 px-4 w-[480px]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 text-left rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                        {snack.imageUrl ? (
                          <img
                            src={snack.imageUrl}
                            alt={snack.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Popcorn className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 max-w-xs">
                        <h4 className="text-white text-left font-bold truncate group-hover:text-amber-400 transition-colors">
                          {snack.name}
                        </h4>
                        <p className="text-[10px] text-left text-slate-400 truncate">
                          {snack.description || 'Chưa có mô tả'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-center">
                    {getCategoryBadge(snack.category)}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-amber-400 font-mono font-bold">
                      {Number(snack.price).toLocaleString('vi-VN')}đ
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => handleToggleAvailability(snack, e)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${snack.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                    >
                      {snack.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đang Mở Bán</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tạm Hết Hàng</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(snack)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                        title="Sửa món"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSnack(snack)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                        title="Xóa món"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Snack Form Modal */}
      <SnackFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSnack}
        initialData={editingSnack}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      {deletingSnack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Xác Nhận Xóa Sản Phẩm</h3>
                <p className="text-xs text-slate-400 font-medium">Hành động này sẽ gỡ bỏ món khỏi Menu</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa món <strong className="text-amber-400">"{deletingSnack.name}"</strong> (
              <span className="text-emerald-400 font-mono font-bold">
                {Number(deletingSnack.price).toLocaleString('vi-VN')}đ
              </span>
              )?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingSnack(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteSnack}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
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
