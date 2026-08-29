import React, { useState, useEffect } from 'react';
import { Room, ScreenType, RoomStatus } from '../../types/room';
import { RoomFormData } from '../../api/adminRoomApi';
import {
  X,
  Tv,
  Save,
  AlertTriangle,
  Grid3X3,
} from 'lucide-react';
import { toast } from 'sonner';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomFormData) => Promise<void>;
  initialData?: Room | null;
  submitting?: boolean;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting = false,
}) => {
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    screenType: 'STANDARD_2D',
    totalRows: 6,
    totalColumns: 10,
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        screenType: initialData.screenType || 'STANDARD_2D',
        totalRows: initialData.totalRows || 6,
        totalColumns: initialData.totalColumns || 10,
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        screenType: 'STANDARD_2D',
        totalRows: 6,
        totalColumns: 10,
        status: 'ACTIVE',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên phòng chiếu!');
      return;
    }
    if (formData.totalRows < 1 || formData.totalRows > 26) {
      toast.error('Số hàng ghế phải từ 1 đến 26 (tương ứng A-Z)!');
      return;
    }
    if (formData.totalColumns < 1 || formData.totalColumns > 30) {
      toast.error('Số cột ghế phải từ 1 đến 30!');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phòng chiếu!');
    }
  };

  if (!isOpen) return null;

  const totalCalculatedSeats = formData.totalRows * formData.totalColumns;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#121622] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'Chỉnh Sửa Phòng Chiếu' : 'Khởi Tạo Phòng Chiếu Mới'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {initialData
                  ? `Cập nhật kích thước & công nghệ phòng "${initialData.name}"`
                  : 'Cấu hình công nghệ màn chiếu và kích thước ma trận ghế'}
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
          {/* Room Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Tên Phòng Chiếu <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Phòng Chiếu 3 (IMAX Laser)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          {/* Screen Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Screen Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Công Nghệ Màn Chiếu <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.screenType}
                onChange={(e) => setFormData({ ...formData, screenType: e.target.value as ScreenType })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-bold"
              >
                <option value="STANDARD_2D">🎬 Standard 2D</option>
                <option value="THREE_D">👓 3D Digital</option>
                <option value="IMAX">🚀 IMAX Laser</option>
                <option value="FOUR_DX">⚡ 4DX Cinematic</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Trạng Thái Vận Hành</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-bold"
              >
                <option value="ACTIVE">🟢 Đang Hoạt Động</option>
                <option value="MAINTENANCE">🟡 Đang Bảo Trì</option>
                <option value="INACTIVE">🔴 Tạm Dừng Hoạt Động</option>
              </select>
            </div>
          </div>

          {/* Matrix Dimensions (Rows x Cols) */}
          <div className="space-y-3 p-4 bg-[#141824]/80 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Grid3X3 className="w-4 h-4" /> Kích Thước Ma Trận Ghế
              </h4>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-black">
                {totalCalculatedSeats} Ghế ({formData.totalRows} Hàng × {formData.totalColumns} Cột)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Rows */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Số Hàng Ghế (A-Z)</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {String.fromCharCode(64 + formData.totalRows)} ({formData.totalRows})
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={26}
                  required
                  value={formData.totalRows}
                  onChange={(e) =>
                    setFormData({ ...formData, totalRows: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* Columns */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Số Cột Ghế (1-30)</span>
                  <span className="text-amber-400 font-mono font-bold">{formData.totalColumns} Cột</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={formData.totalColumns}
                  onChange={(e) =>
                    setFormData({ ...formData, totalColumns: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            {initialData && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-300/90 leading-tight">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  Lưu ý: Thay đổi số hàng/cột sẽ tạo lại sơ đồ ghế mặc định cho phòng chiếu này.
                </span>
              </div>
            )}
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
              {submitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Phòng' : 'Tạo Phòng Chiếu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
