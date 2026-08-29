import React from 'react';
import { Showtime } from '../../types/showtime';
import { Room } from '../../types/room';
import {
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';

interface RoomTimelineSchedulerProps {
  rooms: Room[];
  showtimes: Showtime[];
  selectedDate: string;
  onEditShowtime: (showtime: Showtime) => void;
  onDeleteShowtime: (showtime: Showtime) => void;
  onAddShowtimeInSlot: (roomId: number, timeStr: string) => void;
}

// Timeline runs from 08:00 (480 mins) to 24:00 (1440 mins) -> 16 hours = 960 mins
const TIMELINE_START_MINUTES = 8 * 60; // 480
const TIMELINE_TOTAL_MINUTES = 16 * 60; // 960

export const RoomTimelineScheduler: React.FC<RoomTimelineSchedulerProps> = ({
  rooms,
  showtimes,
  selectedDate,
  onEditShowtime,
  onDeleteShowtime,
  onAddShowtimeInSlot,
}) => {
  const hoursArray = Array.from({ length: 17 }, (_, i) => 8 + i); // 8 to 24

  const getMinutesFromTimeStr = (isoString: string) => {
    if (!isoString) return 0;
    const timePart = isoString.split('T')[1];
    if (!timePart) return 0;
    const [h, m] = timePart.split(':').map(Number);
    return h * 60 + m;
  };

  const getPositionPercent = (minutes: number) => {
    const relativeMinutes = minutes - TIMELINE_START_MINUTES;
    return Math.max(0, Math.min(100, (relativeMinutes / TIMELINE_TOTAL_MINUTES) * 100));
  };

  const getWidthPercent = (durationMinutes: number) => {
    return (durationMinutes / TIMELINE_TOTAL_MINUTES) * 100;
  };

  const handleRowClick = (roomId: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const clickedTotalMinutes = TIMELINE_START_MINUTES + clickPercent * TIMELINE_TOTAL_MINUTES;

    // Round to nearest 15 minutes
    const roundedMinutes = Math.floor(clickedTotalMinutes / 15) * 15;
    const h = Math.floor(roundedMinutes / 60) % 24;
    const m = roundedMinutes % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    onAddShowtimeInSlot(roomId, timeStr);
  };

  return (
    <div className="bg-[#0b0e14] rounded-3xl border border-slate-800/80 p-5 shadow-2xl space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-black text-white">
            Dòng Thời Gian Lịch Chiếu (Timeline Scheduler 24H)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {selectedDate}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
            <span>Mở Bán</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
            <span>Lên Lịch</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-3 h-2 rounded-sm bg-amber-500/30 border border-dashed border-amber-400" />
            <span>+15m Dọn Phòng</span>
          </div>
        </div>
      </div>

      {/* Timeline Scrollable Container */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1000px] select-none space-y-4">
          {/* Time Axis Header */}
          <div className="flex items-center text-slate-400 text-xs font-mono font-bold pl-48 pr-4 border-b border-slate-800/80 pb-2">
            {hoursArray.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-left border-l border-slate-800/60 pl-1 text-[11px]"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Rooms Timeline Rows */}
          {rooms.map((room) => {
            const roomShowtimes = showtimes.filter(
              (st) => st.room?.id === room.id && st.status !== 'CANCELLED'
            );

            return (
              <div key={room.id} className="flex items-stretch gap-4 group">
                {/* Left Room Info Card */}
                <div className="w-44 shrink-0 p-3 bg-[#121622] rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase font-mono block">
                      {room.screenType}
                    </span>
                    <h4 className="text-xs font-black text-white truncate mt-0.5">
                      {room.name}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {room.totalSeats || room.totalRows * room.totalColumns} ghế
                  </span>
                </div>

                {/* Right Timeline Lane */}
                <div
                  onClick={(e) => handleRowClick(room.id, e)}
                  className="flex-1 relative bg-[#080a0f] rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors h-24 overflow-hidden cursor-crosshair"
                  title="Nhấp vào khoảng trống để xếp suất chiếu tại giờ này"
                >
                  {/* Grid hour vertical lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {hoursArray.map((hour) => (
                      <div
                        key={hour}
                        className="flex-1 border-r border-slate-800/40 first:border-l-0"
                      />
                    ))}
                  </div>

                  {/* Render Showtime Blocks */}
                  {roomShowtimes.map((showtime) => {
                    const startMin = getMinutesFromTimeStr(showtime.startTime);
                    const endMin = getMinutesFromTimeStr(showtime.endTime);
                    const duration = Math.max(30, endMin - startMin);

                    const leftPercent = getPositionPercent(startMin);
                    const widthPercent = getWidthPercent(duration);

                    const startTimeStr = showtime.startTime.split('T')[1]?.substring(0, 5) || '';
                    const endTimeStr = showtime.endTime.split('T')[1]?.substring(0, 5) || '';

                    return (
                      <div
                        key={showtime.id}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        className="absolute top-2 bottom-2 bg-gradient-to-r from-amber-500/90 via-amber-600/90 to-amber-700/90 text-slate-950 rounded-xl p-2 shadow-lg border border-amber-300/40 flex flex-col justify-between overflow-hidden group/block transition-all hover:scale-[1.02] hover:z-20 hover:shadow-amber-500/20"
                      >
                        {/* 15m Cleaning Buffer indicator at end of card */}
                        <div
                          style={{ width: `${(15 / duration) * 100}%` }}
                          className="absolute right-0 top-0 bottom-0 bg-amber-950/40 border-l border-dashed border-amber-300/50 pointer-events-none flex items-center justify-center"
                          title="15 phút dọn phòng"
                        >
                          <span className="text-[9px] font-bold text-amber-200/70 font-mono -rotate-90">
                            +15m
                          </span>
                        </div>

                        {/* Card Header & Title */}
                        <div className="flex items-start justify-between gap-1 min-w-0 pr-4">
                          <div className="min-w-0">
                            <span className="px-1 py-0.2 rounded bg-slate-950 text-amber-400 font-black text-[9px] mr-1">
                              {showtime.movie?.ageRating || 'P'}
                            </span>
                            <strong className="text-[11px] font-black text-slate-950 truncate leading-tight inline">
                              {showtime.movie?.title}
                            </strong>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => onEditShowtime(showtime)}
                              className="p-1 rounded bg-slate-950/80 hover:bg-slate-950 text-amber-400 transition-colors cursor-pointer"
                              title="Sửa suất chiếu"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => onDeleteShowtime(showtime)}
                              className="p-1 rounded bg-slate-950/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                              title="Hủy suất chiếu"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card Bottom Time & Price */}
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-950/90 pt-1">
                          <span>
                            {startTimeStr} - {endTimeStr}
                          </span>
                          <span className="font-black">
                            {Number(showtime.basePrice).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
