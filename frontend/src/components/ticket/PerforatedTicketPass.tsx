import React, { useState } from 'react';
import { Film, CheckCircle2, MapPin, Maximize2, X } from 'lucide-react';
import { BookingDetail, TicketDetail } from '../../types/ticket';

interface PerforatedTicketPassProps {
  booking: BookingDetail;
  ticket: TicketDetail;
}

export const PerforatedTicketPass: React.FC<PerforatedTicketPassProps> = ({ booking, ticket }) => {
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  const formatDateTime = (startIso: string) => {
    const d = new Date(startIso);
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return { time, date };
  };

  const { time, date } = formatDateTime(booking.startTime);
  const isImax = booking.screenType === 'IMAX';

  return (
    <>
      <div className="relative bg-[#18191E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-300 hover:border-red-500/40 group">
        
        {/* Left Side: Main Ticket Body (Movie info & Seat Details) */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          
          {/* Header & Movie Title */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-24 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-md">
              {booking.moviePosterUrl ? (
                <img
                  src={booking.moviePosterUrl}
                  alt={booking.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-6 h-6 text-slate-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-600 text-white">
                  {booking.movieAgeRating || 'P'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isImax ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {booking.screenType}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight line-clamp-2 font-serif mt-1">
                {booking.movieTitle}
              </h3>
              <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>CINEPLEX &middot; {booking.roomName}</span>
              </p>
            </div>
          </div>

          {/* Showtime & Seat Matrix Info Grid */}
          <div className="grid grid-cols-3 gap-2 bg-[#121317] p-3 rounded-xl border border-white/5 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Giờ Chiếu</span>
              <p className="text-sm font-black text-red-500 font-mono mt-0.5">{time}</p>
            </div>
            <div className="border-x border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Ngày Chiếu</span>
              <p className="text-xs font-bold text-white font-mono mt-0.5">{date}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Vị Trí Ghế</span>
              <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                {ticket.seatCode} <span className="text-[10px] text-slate-400 font-normal">({ticket.seatType})</span>
              </p>
            </div>
          </div>

          {/* Ticket metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="font-mono">
              Mã vé: <strong className="text-slate-200">{ticket.ticketCode}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-slate-300 border border-white/5 uppercase">
              {ticket.seatType}
            </span>
          </div>
        </div>

        {/* Perforated Divider (Rãnh xé răng cưa đục lỗ tròn ở 2 mép) */}
        <div className="relative flex md:flex-col items-center justify-between">
          <div className="w-5 h-5 rounded-full bg-[#121317] -mt-2.5 md:-mt-2.5 md:-ml-2.5 border border-white/10 shrink-0 z-10" />
          <div className="flex-1 border-t md:border-t-0 md:border-l border-dashed border-white/20 w-full md:h-full my-0 md:my-3" />
          <div className="w-5 h-5 rounded-full bg-[#121317] -mb-2.5 md:-mb-2.5 md:-ml-2.5 border border-white/10 shrink-0 z-10" />
        </div>

        {/* Right Side: QR Code Stub (Cuống vé quét tại cổng soát vé) */}
        <div className="w-full md:w-56 p-5 sm:p-6 bg-[#15161b] flex flex-col items-center justify-center space-y-3 shrink-0 text-center">
          {/* Status Badge */}
          <div className="flex items-center space-x-1.5">
            {ticket.isCheckedIn ? (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                <span>Đã Check-in</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Chưa Soát Vé</span>
              </span>
            )}
          </div>

          {/* QR Code Container */}
          <div
            onClick={() => setIsZoomOpen(true)}
            className="relative p-2 bg-white rounded-xl shadow-lg cursor-pointer group/qr hover:scale-105 transition-transform"
            title="Bấm để phóng to mã QR"
          >
            <img
              src={ticket.qrCodeBase64}
              alt={`QR Code ${ticket.ticketCode}`}
              className="w-28 h-28 object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 rounded-xl flex items-center justify-center transition-opacity text-white">
              <Maximize2 className="w-5 h-5" />
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            Xuất trình mã QR tại lối vào phòng chiếu để nhân viên quét vé.
          </p>
        </div>

      </div>

      {/* QR Zoom Modal */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#18191E] border border-white/20 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold text-white uppercase tracking-tight font-serif pt-1">
              Mã QR Soát Vé
            </h4>
            <p className="text-xs text-slate-400">
              Ghế <strong className="text-red-500">{ticket.seatCode}</strong> &middot; {booking.movieTitle}
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <img
                src={ticket.qrCodeBase64}
                alt={`QR Code ${ticket.ticketCode}`}
                className="w-56 h-56 object-contain"
              />
            </div>

            <div className="text-xs font-mono text-slate-300">
              Mã vé: <strong className="text-red-400">{ticket.ticketCode}</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
