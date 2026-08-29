import React, { useState, useEffect } from 'react';
import { Movie, Genre } from '../../types/movie';
import { MovieFormData } from '../../api/adminMovieApi';
import {
  X,
  Film,
  Calendar,
  Clock,
  ShieldAlert,
  Image,
  Video,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovieFormData) => Promise<void>;
  initialData?: Movie | null;
  genres: Genre[];
  submitting?: boolean;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  genres,
  submitting = false,
}) => {
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    originalTitle: '',
    slug: '',
    director: '',
    cast: '',
    synopsis: '',
    durationMinutes: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    endDate: '',
    ageRating: 'P',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    status: 'NOW_SHOWING',
    genreIds: [],
  });

  const [autoSlug, setAutoSlug] = useState<boolean>(!initialData);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        originalTitle: initialData.originalTitle || '',
        slug: initialData.slug || '',
        director: initialData.director || '',
        cast: initialData.cast || '',
        synopsis: initialData.synopsis || '',
        durationMinutes: initialData.durationMinutes || 120,
        releaseDate: initialData.releaseDate ? initialData.releaseDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        ageRating: initialData.ageRating || 'P',
        posterUrl: initialData.posterUrl || '',
        bannerUrl: initialData.bannerUrl || '',
        trailerUrl: initialData.trailerUrl || '',
        status: initialData.status || 'NOW_SHOWING',
        genreIds: initialData.genres ? initialData.genres.map((g) => g.id) : [],
      });
      setAutoSlug(false);
    } else {
      setFormData({
        title: '',
        originalTitle: '',
        slug: '',
        director: '',
        cast: '',
        synopsis: '',
        durationMinutes: 120,
        releaseDate: new Date().toISOString().split('T')[0],
        endDate: '',
        ageRating: 'P',
        posterUrl: '',
        bannerUrl: '',
        trailerUrl: '',
        status: 'NOW_SHOWING',
        genreIds: [],
      });
      setAutoSlug(true);
    }
  }, [initialData, isOpen]);

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
    }));
  };

  const toggleGenre = (genreId: number) => {
    setFormData((prev) => {
      const current = prev.genreIds || [];
      const updated = current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId];
      return { ...prev, genreIds: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên phim!');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Vui lòng nhập mã định danh URL (slug)!');
      return;
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      toast.error('Thời lượng phim phải lớn hơn 0 phút!');
      return;
    }
    if (!formData.releaseDate) {
      toast.error('Vui lòng chọn ngày khởi chiếu!');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phim!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e121a] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#121622] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'Chỉnh Sửa Thông Tin Phim' : 'Thêm Phim Mới Vào Hệ Thống'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {initialData
                  ? `Cập nhật thông tin chi tiết cho "${initialData.title}"`
                  : 'Điền thông tin và liên kết media để khởi tạo phim mới'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Thông Tin Cơ Bản
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên phim tiếng Việt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Tên Phim (Tiếng Việt) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đất Rừng Phương Nam"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Tên gốc quốc tế */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tên Gốc / Quốc Tế</label>
                <input
                  type="text"
                  placeholder="VD: Song of the South"
                  value={formData.originalTitle || ''}
                  onChange={(e) => setFormData({ ...formData, originalTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Định Danh URL (Slug) <span className="text-red-400">*</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  Tự động sinh từ tên phim
                </label>
              </div>
              <input
                type="text"
                required
                placeholder="VD: dat-rung-phuong-nam"
                value={formData.slug}
                disabled={autoSlug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
              />
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Đạo Diễn</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Quang Dũng"
                  value={formData.director || ''}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Diễn Viên Chính</label>
                <input
                  type="text"
                  placeholder="VD: Hạo Khang, Trấn Thành, Tuấn Trần..."
                  value={formData.cast || ''}
                  onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Thời lượng, Độ tuổi & Trạng thái */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Thông Số Chiếu & Phân Loại
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Thời Lượng (Phút) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={400}
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Age Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Phân Loại Độ Tuổi <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.ageRating}
                  onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                >
                  <option value="P">P - Phổ biến mọi độ tuổi</option>
                  <option value="T13">T13 - Khán giả từ 13 tuổi trở lên</option>
                  <option value="T16">T16 - Khán giả từ 16 tuổi trở lên</option>
                  <option value="T18">T18 - Khán giả từ 18 tuổi trở lên</option>
                </select>
              </div>

              {/* Release Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Ngày Khởi Chiếu <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Trạng Thái Chiếu</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                >
                  <option value="NOW_SHOWING">🟢 Đang Chiếu (Now Showing)</option>
                  <option value="COMING_SOON">🟡 Sắp Chiếu (Coming Soon)</option>
                  <option value="ENDED">🔴 Dừng Chiếu (Ended)</option>
                </select>
              </div>
            </div>

            {/* Multi-Genre Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-300">
                Thể Loại Phim (Chọn nhiều thể loại)
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const selected = (formData.genreIds || []).includes(g.id);
                  return (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                          : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 stroke-[3]" />}
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Media Links & Poster Preview */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> Hình Ảnh & Trailer Media
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Poster URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Image className="w-3.5 h-3.5 text-purple-400" />
                  Đường Dẫn Poster (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.posterUrl || ''}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Trailer URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  Đường Dẫn Trailer YouTube (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.trailerUrl || ''}
                  onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Poster Preview */}
            {formData.posterUrl && (
              <div className="flex items-center gap-4 p-3 bg-[#141824] rounded-2xl border border-slate-800">
                <div className="w-16 h-22 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img
                    src={formData.posterUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.target as any).style.display = 'none')}
                  />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-white block">Xem trước Poster</span>
                  <span className="text-slate-400 text-[11px] block truncate max-w-sm">
                    {formData.posterUrl}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Tóm tắt nội dung */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-300">Tóm Tắt Nội Dung Phim (Synopsis)</label>
            <textarea
              rows={3}
              placeholder="Tóm tắt ngắn gọn cốt truyện, bối cảnh và điểm nhấn của bộ phim..."
              value={formData.synopsis || ''}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {submitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Phim' : 'Thêm Phim Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
