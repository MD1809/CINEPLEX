import React, { useState, useEffect } from 'react';
import { adminMovieApi, MovieFormData } from '../../api/adminMovieApi';
import { Movie, Genre, MovieStatus } from '../../types/movie';
import { MovieFormModal } from '../../components/admin/MovieFormModal';
import {
  Film,
  Plus,
  Search,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Play,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filters & Views
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ageRatingFilter, setAgeRatingFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Delete confirm dialog
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [moviesRes, genresRes] = await Promise.all([
        adminMovieApi.getAllMovies(),
        adminMovieApi.getAllGenres(),
      ]);
      setMovies(moviesRes);
      setGenres(genresRes);
    } catch (err: any) {
      console.error('Error fetching movies data:', err);
      toast.error('Không thể tải danh sách phim. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  const handleSubmitMovie = async (formData: MovieFormData) => {
    setSubmitting(true);
    try {
      if (editingMovie) {
        await adminMovieApi.updateMovie(editingMovie.id, formData);
        toast.success(`Cập nhật phim "${formData.title}" thành công!`);
      } else {
        await adminMovieApi.createMovie(formData);
        toast.success(`Thêm mới phim "${formData.title}" thành công!`);
      }
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (movie: Movie, newStatus: string) => {
    try {
      await adminMovieApi.updateMovieStatus(movie.id, newStatus);
      toast.success(`Đã đổi trạng thái "${movie.title}" sang ${getStatusLabel(newStatus)}`);
      setMovies((prev) =>
        prev.map((m) => (m.id === movie.id ? { ...m, status: newStatus as MovieStatus } : m))
      );
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái phim!');
    }
  };

  const handleDeleteMovie = async () => {
    if (!deletingMovie) return;
    try {
      await adminMovieApi.deleteMovie(deletingMovie.id);
      toast.success(`Đã xóa phim "${deletingMovie.title}" thành công!`);
      setDeletingMovie(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể xóa phim này (có thể đã phát sinh lịch chiếu/vé)!');
    }
  };

  // Filtered movies
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      !searchTerm ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.originalTitle && m.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.director && m.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.cast && m.cast.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'NOW_SHOWING' && m.status === 'NOW_SHOWING') ||
      (statusFilter === 'COMING_SOON' && m.status === 'COMING_SOON') ||
      (statusFilter === 'ENDED' && (m.status === 'ENDED' || m.status === 'END_SHOWING'));

    const matchesAge = ageRatingFilter === 'ALL' || m.ageRating === ageRatingFilter;

    return matchesSearch && matchesStatus && matchesAge;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đang Chiếu
          </span>
        );
      case 'COMING_SOON':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Sắp Chiếu
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold">
            Dừng Chiếu
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return 'Đang Chiếu';
      case 'COMING_SOON':
        return 'Sắp Chiếu';
      default:
        return 'Dừng Chiếu';
    }
  };

  const getAgeRatingBadge = (rating: string) => {
    switch (rating) {
      case 'P':
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">P</span>;
      case 'T13':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">T13</span>;
      case 'T16':
        return <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-black text-[10px]">T16</span>;
      case 'T18':
        return <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">T18</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-bold text-[10px]">{rating}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0b0e14] rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span>Quản Lý Danh Mục Phim</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono">
              {movies.length} phim
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Quản lý thông tin phim, phân loại độ tuổi, thời lượng và trạng thái phát hành
          </p>
        </div>

        {/* Action Button */}
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
            Thêm Phim Mới
          </button>
        </div>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#0e121a] rounded-3xl border border-slate-800/80">
        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên phim, đạo diễn, diễn viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141824] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Status Tabs & Age Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'ALL', label: 'Tất Cả' },
              { id: 'NOW_SHOWING', label: '🟢 Đang Chiếu' },
              { id: 'COMING_SOON', label: '🟡 Sắp Chiếu' },
              { id: 'ENDED', label: '🔴 Dừng Chiếu' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Age Rating Select */}
          <select
            value={ageRatingFilter}
            onChange={(e) => setAgeRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#141824] border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả độ tuổi</option>
            <option value="P">P (Mọi lứa tuổi)</option>
            <option value="T13">T13 (13+)</option>
            <option value="T16">T16 (16+)</option>
            <option value="T18">T18 (18+)</option>
          </select>

          {/* View Switcher */}
          <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Xem dạng thẻ lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Movie Content (Grid or Table) */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-medium animate-pulse">
          Đang tải danh sách phim...
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="p-12 text-center bg-[#0e121a] rounded-3xl border border-slate-800 text-slate-400 space-y-2">
          <Film className="w-8 h-8 mx-auto text-slate-600" />
          <h4 className="font-bold text-white">Không tìm thấy phim nào</h4>
          <p className="text-xs">Thử thay đổi từ khóa hoặc bộ lọc trạng thái để tìm kiếm.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-[#0e121a] hover:bg-[#121722] rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full bg-slate-900 overflow-hidden">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Film className="w-12 h-12" />
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e121a] via-transparent to-black/60 opacity-90" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getAgeRatingBadge(movie.ageRating)}
                    {getStatusBadge(movie.status)}
                  </div>

                  {movie.trailerUrl && (
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-red-400 hover:text-white border border-red-500/30 transition-colors"
                      title="Xem Trailer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </a>
                  )}
                </div>

                {/* Bottom Duration info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px]">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {movie.durationMinutes} phút
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px]">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    {movie.releaseDate ? movie.releaseDate.split('T')[0] : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Movie Info & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  {movie.originalTitle && (
                    <p className="text-[11px] text-slate-400 truncate italic">
                      {movie.originalTitle}
                    </p>
                  )}

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {movie.genres && movie.genres.length > 0 ? (
                      movie.genres.slice(0, 3).map((g) => (
                        <span
                          key={g.id}
                          className="px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium"
                        >
                          {g.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">Chưa gắn thể loại</span>
                    )}
                  </div>
                </div>

                {/* Quick Status Dropdown & Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <select
                    value={movie.status}
                    onChange={(e) => handleQuickStatusChange(movie, e.target.value)}
                    className="px-2 py-1 rounded-lg bg-[#141824] border border-slate-800 text-[11px] font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="NOW_SHOWING">Đang Chiếu</option>
                    <option value="COMING_SOON">Sắp Chiếu</option>
                    <option value="ENDED">Dừng Chiếu</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(movie)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                      title="Sửa phim"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingMovie(movie)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                      title="Xóa phim"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                <th className="py-3.5 px-4">Poster & Phim</th>
                <th className="py-3.5 px-4">Thời Lượng & Độ Tuổi</th>
                <th className="py-3.5 px-4">Ngày Khởi Chiếu</th>
                <th className="py-3.5 px-4">Thể Loại</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#141824] transition-colors group">
                  {/* Poster & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                        {movie.posterUrl ? (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 max-w-xs">
                        <h4 className="text-white font-bold truncate group-hover:text-amber-400 transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          /{movie.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Duration & Age */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{movie.durationMinutes} phút</span>
                      </div>
                      <div>{getAgeRatingBadge(movie.ageRating)}</div>
                    </div>
                  </td>

                  {/* Release Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{movie.releaseDate ? movie.releaseDate.split('T')[0] : 'N/A'}</span>
                    </div>
                  </td>

                  {/* Genres */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {movie.genres && movie.genres.length > 0 ? (
                        movie.genres.map((g) => (
                          <span
                            key={g.id}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                          >
                            {g.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500">Chưa có</span>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={movie.status}
                      onChange={(e) => handleQuickStatusChange(movie, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#141824] border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="NOW_SHOWING">🟢 Đang Chiếu</option>
                      <option value="COMING_SOON">🟡 Sắp Chiếu</option>
                      <option value="ENDED">🔴 Dừng Chiếu</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(movie)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                        title="Chỉnh sửa phim"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMovie(movie)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                        title="Xóa phim"
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

      {/* Movie Form Modal */}
      <MovieFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitMovie}
        initialData={editingMovie}
        genres={genres}
        submitting={submitting}
      />

      {/* Delete Confirmation Dialog */}
      {deletingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Xác Nhận Xóa Phim</h3>
                <p className="text-xs text-slate-400 font-medium">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa phim{' '}
              <strong className="text-amber-400">"{deletingMovie.title}"</strong> khỏi hệ thống?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingMovie(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteMovie}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
              >
                Xóa Phim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
