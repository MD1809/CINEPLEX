import React, { useState } from 'react';
import { SoldTicket } from '../../types/adminAnalytics';
import {
  Ticket,
  Search,
  CheckCircle2,
  Clock,
  Film,
  Armchair,
  CreditCard,
  Banknote,
  QrCode,
  User,
  Store,
  Globe,
} from 'lucide-react';

interface SoldTicketsTableProps {
  tickets: SoldTicket[];
  loading?: boolean;
}

export const SoldTicketsTable: React.FC<SoldTicketsTableProps> = ({ tickets, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN'>('ALL');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'ONLINE' | 'POS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter tickets
  const filteredTickets = (tickets || []).filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.seatCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CHECKED_IN' && t.isCheckedIn) ||
      (statusFilter === 'NOT_CHECKED_IN' && !t.isCheckedIn);

    const matchesChannel =
      channelFilter === 'ALL' || t.bookingChannel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getSeatTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case 'VIP':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
            VIP
          </span>
        );
      case 'SWEETBOX':
        return (
          <span className="px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-400 text-[10px] font-bold">
            SWEETBOX
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-700/40 border border-slate-600/40 text-slate-300 text-[10px] font-medium">
            Thường
          </span>
        );
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'VNPAY':
        return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
      case 'BANK_TRANSFER':
        return <QrCode className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="p-6 bg-[#0e121a] rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" />
              Danh Sách Vé Đã Bán Chi Tiết
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Theo dõi chi tiết từng vé đã xuất bán, vị trí ghế, kênh đặt và trạng thái soát vé
          </p>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã vé, mã đơn, tên phim..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#131722] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-[#131722] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => {
                setStatusFilter('CHECKED_IN');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'CHECKED_IN'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Đã Soát
            </button>
            <button
              onClick={() => {
                setStatusFilter('NOT_CHECKED_IN');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'NOT_CHECKED_IN'
                ? 'bg-blue-500 text-white font-black'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Chưa Soát
            </button>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center bg-[#131722] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setChannelFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${channelFilter === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setChannelFilter('ONLINE');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${channelFilter === 'ONLINE'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Online
            </button>
            <button
              onClick={() => {
                setChannelFilter('POS');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${channelFilter === 'POS'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              POS Quầy
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#131722] text-slate-400 border-b border-slate-800/80 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Mã Vé / Đơn</th>
              <th className="py-3.5 px-4">Phim & Phòng</th>
              <th className="py-3.5 px-4">Suất Chiếu</th>
              <th className="py-3.5 px-4">Vị Trí Ghế</th>
              <th className="py-3.5 px-4">Giá Vé & Cổng TT</th>
              <th className="py-3.5 px-4">Khách Hàng / Kênh</th>
              <th className="py-3.5 px-4 text-center">Trạng Thái Soát</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                  Đang tải danh sách vé đã bán...
                </td>
              </tr>
            ) : paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Không tìm thấy vé nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              paginatedTickets.map((t) => (
                <tr
                  key={t.ticketId || t.ticketCode}
                  className="hover:bg-[#141824] transition-colors group"
                >
                  {/* Ticket Code & Booking Code */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md block w-fit">
                        {t.ticketCode}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Đơn: #{t.bookingCode}
                      </span>
                    </div>
                  </td>

                  {/* Movie & Room */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                        {t.posterUrl ? (
                          <img
                            src={t.posterUrl}
                            alt={t.movieTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 max-w-[160px]">
                        <h4 className="text-white font-bold truncate group-hover:text-amber-400 transition-colors">
                          {t.movieTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                            {t.screenType.replace('_', ' ')}
                          </span>
                          <span className="truncate">{t.roomName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Showtime */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {formatTime(t.showtimeStart)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(t.showtimeStart)}
                      </span>
                    </div>
                  </td>

                  {/* Seat & Seat Type */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-mono font-black text-white text-sm">
                        <Armchair className="w-4 h-4 text-blue-400" />
                        {t.seatCode}
                      </div>
                      <div>{getSeatTypeBadge(t.seatType)}</div>
                    </div>
                  </td>

                  {/* Price & Payment Method */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-amber-400 block">
                        {new Intl.NumberFormat('vi-VN').format(t.price)} ₫
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {getPaymentIcon(t.paymentMethod)}
                        <span>{t.paymentMethod}</span>
                      </div>
                    </div>
                  </td>

                  {/* Customer / Staff & Channel */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-200 truncate max-w-[130px]">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{t.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        {t.bookingChannel === 'ONLINE' ? (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 font-semibold flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> Online
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold flex items-center gap-1">
                            <Store className="w-2.5 h-2.5" /> POS {t.staffName ? `(${t.staffName})` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Check-In Status */}
                  <td className="py-3.5 px-4 text-center">
                    {t.isCheckedIn ? (
                      <div className="space-y-0.5 inline-flex flex-col items-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Đã Check-in
                        </span>
                        {t.checkedInAt && (
                          <span className="text-[9px] text-slate-500 font-mono">
                            {formatTime(t.checkedInAt)} {formatDate(t.checkedInAt)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        Chưa Check-in
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">
            Trang <strong className="text-white">{currentPage}</strong> / {totalPages} (
            {filteredTickets.length} vé)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
            >
              Trang Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
            >
              Trang Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
