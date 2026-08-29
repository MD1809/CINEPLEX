import React, { useState, useEffect } from 'react';
import { Snack, SnackCategory } from '../../types/snack';
import { SnackFormData } from '../../api/adminSnackApi';
import {
  X,
  Popcorn,
  Sparkles,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SnackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SnackFormData) => Promise<void>;
  initialData?: Snack | null;
  submitting?: boolean;
}

export const SnackFormModal: React.FC<SnackFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting = false,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SnackCategory>('POPCORN');
  const [price, setPrice] = useState<number>(45000);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'POPCORN');
      setPrice(initialData.price || 45000);
      setImageUrl(initialData.imageUrl || '');
      setDescription(initialData.description || '');
      setIsAvailable(initialData.isAvailable ?? true);
    } else {
      setName('');
      setCategory('POPCORN');
      setPrice(45000);
      setImageUrl('');
      setDescription('');
      setIsAvailable(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên món!');
      return;
    }
    if (price <= 0) {
      toast.error('Giá bán phải lớn hơn 0đ!');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        category,
        price: Number(price),
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        isAvailable,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu món!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e121a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#121622] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Popcorn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'Cập Nhật Món F&B' : 'Thêm Món Mới Vào Menu'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Quản lý thông tin bắp rang, thức uống và combo rạp chiếu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Popcorn className="w-3.5 h-3.5 text-amber-400" />
              Tên Sản Phẩm / Combo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Combo Sweet Couple (1 Bắp ngọt + 2 Nước)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors font-bold"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Danh Mục <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SnackCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors font-bold cursor-pointer"
              >
                <option value="POPCORN">🍿 Bắp Rang (POPCORN)</option>
                <option value="DRINK">🥤 Nước Ngọt & Thức Uống (DRINK)</option>
                <option value="COMBO">🍱 Combo Ưu Đãi (COMBO)</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Đơn Giá Bán (VNĐ) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          {/* Image URL with live preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              Đường Dẫn Hình Ảnh (URL)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>

          {/* Image Preview Box */}
          {imageUrl && (
            <div className="p-3 bg-[#141824] rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <img
                  src={imageUrl}
                  alt="Xem trước hình ảnh"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{name || 'Xem trước hình ảnh'}</p>
                <p className="text-[11px] text-amber-400 font-mono font-bold mt-0.5">
                  {Number(price).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Mô Tả Chi Tiết / Thành Phần
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú chi tiết về thành phần bắp nước hoặc ưu đãi đi kèm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Is Available Toggle */}
          <div className="p-3.5 bg-[#141824] rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${isAvailable ? 'text-emerald-400' : 'text-slate-600'}`} />
              <div>
                <span className="text-xs font-bold text-white block">
                  Trạng Thái Kinh Doanh
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAvailable ? 'Đang mở bán trên POS và Website' : 'Tạm hết hàng / Ngưng bán'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isAvailable ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Món' : 'Thêm Món Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
