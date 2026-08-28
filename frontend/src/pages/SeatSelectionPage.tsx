import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import { SeatDto, SeatMapResponse } from '../types/booking';
import { useBookingStore } from '../stores/bookingStore';
import { useSeatHoldTimer } from '../hooks/useSeatHoldTimer';
import { CurvedScreen } from '../components/booking/CurvedScreen';
import { SeatMatrix } from '../components/booking/SeatMatrix';
import { BookingBillSummary } from '../components/booking/BookingBillSummary';
import { toast } from 'sonner';

export const SeatSelectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showtimeIdParam = searchParams.get('showtimeId');
  const showtimeId = showtimeIdParam ? parseInt(showtimeIdParam, 10) : null;

  const {
    holdSessionId,
    selectedSeats,
    setHoldData,
    clearBooking,
  } = useBookingStore();

  const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [holding, setHolding] = useState<boolean>(false);

  // Load Seat Map from Server
  const loadSeatMap = useCallback(async (currentSessionId?: string) => {
    if (!showtimeId) return;
    try {
      const res = await bookingApi.getSeatMap(showtimeId, currentSessionId || holdSessionId || undefined);
      if (res.success && res.data) {
        setSeatMap(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load seat map:', err);
      toast.error('Không thể tải sơ đồ ghế. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [showtimeId, holdSessionId]);

  useEffect(() => {
    if (!showtimeId) {
      toast.error('Suất chiếu không hợp lệ');
      navigate('/');
      return;
    }
    loadSeatMap();
  }, [showtimeId]);

  // Handle Timer expiration
  const handleTimerExpire = useCallback(async () => {
    toast.error('Hết thời gian giữ ghế (5 phút). Ghế đã được tự động giải phóng.');
    if (holdSessionId && showtimeId) {
      try {
        await bookingApi.releaseSeats({
          holdSessionId,
          showtimeId,
        });
      } catch (err) {
        // silent error
      }
    }
    clearBooking();
    loadSeatMap();
  }, [holdSessionId, showtimeId, clearBooking, loadSeatMap]);

  // Handle 1-minute warning
  const handleTimerWarning = useCallback(() => {
    toast.warning('Thời gian giữ ghế còn dưới 1 phút. Vui lòng tiếp tục bước tiếp theo!', {
      duration: 6000,
    });
  }, []);

  const { formattedTime, isWarning, isExpired, percentage } = useSeatHoldTimer({
    onExpire: handleTimerExpire,
    onWarning: handleTimerWarning,
  });

  // Handle Seat Click (Toggle select/deselect & sync with Redis)
  const handleToggleSeat = async (clickedSeat: SeatDto) => {
    if (!seatMap || !showtimeId) return;

    const isAlreadySelected = selectedSeats.some((s) => s.id === clickedSeat.id);
    let nextSeatIds: number[];

    if (isAlreadySelected) {
      nextSeatIds = selectedSeats.filter((s) => s.id !== clickedSeat.id).map((s) => s.id);
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('Bạn chỉ có thể đặt tối đa 8 ghế trong một giao dịch.');
        return;
      }
      nextSeatIds = [...selectedSeats.map((s) => s.id), clickedSeat.id];
    }

    // If unselecting all seats
    if (nextSeatIds.length === 0) {
      if (holdSessionId) {
        try {
          await bookingApi.releaseSeats({
            holdSessionId,
            showtimeId,
          });
        } catch (err) {
          console.error('Failed to release seats:', err);
        }
      }
      clearBooking();
      loadSeatMap();
      return;
    }

    // Call Redis hold-seats API
    setHolding(true);
    try {
      const res = await bookingApi.holdSeats({
        showtimeId,
        seatIds: nextSeatIds,
        holdSessionId: holdSessionId || undefined,
      });

      if (res.success && res.data) {
        setHoldData(
          res.data,
          {
            id: seatMap.movieId,
            title: seatMap.movieTitle,
            slug: seatMap.movieSlug,
            posterUrl: seatMap.moviePosterUrl,
            ageRating: seatMap.movieAgeRating,
          },
          {
            id: seatMap.roomId,
            name: seatMap.roomName,
            screenType: seatMap.screenType,
            startTime: seatMap.startTime,
            endTime: seatMap.endTime,
          }
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ghế vừa được chọn đã có người khác giữ. Vui lòng chọn ghế khác.';
      toast.error(msg);
      loadSeatMap();
    } finally {
      setHolding(false);
    }
  };

  // Remove individual seat from bill
  const handleRemoveSeat = async (seatId: number) => {
    const seatToRemove = seatMap?.seats.find((s) => s.id === seatId);
    if (seatToRemove) {
      handleToggleSeat(seatToRemove);
    }
  };

  const handleProceedToConcessions = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế để tiếp tục.');
      return;
    }
    if (isExpired) {
      toast.error('Phiên giữ ghế đã hết hạn. Vui lòng chọn lại ghế.');
      return;
    }
    navigate(`/booking/concessions?showtimeId=${showtimeId}`);
  };

  const formatShowtime = (startIso?: string, endIso?: string) => {
    if (!startIso) return '';
    const d = new Date(startIso);
    const start = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const day = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!endIso) return `${start} - ${day}`;
    const dEnd = new Date(endIso);
    const end = `${String(dEnd.getHours()).padStart(2, '0')}:${String(dEnd.getMinutes()).padStart(2, '0')}`;
    return `${start} ~ ${end} · ${day}`;
  };

  if (loading || !seatMap) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Đang chuẩn bị sơ đồ ghế phòng chiếu...</p>
      </div>
    );
  }

  const selectedSeatIds = selectedSeats.map((s) => s.id);
  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 pb-16">
      {/* 1. Top Header & Step Progress Bar */}
      <div className="bg-[#18191E] border-b border-white/10 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Back button & Movie title */}
          <div className="flex items-center space-x-3">
            <Link
              to={`/movie/${seatMap.movieSlug}`}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Quay lại chi tiết phim"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-600 text-white">
                  {seatMap.movieAgeRating}
                </span>
                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-tight font-serif truncate max-w-xs sm:max-w-md">
                  {seatMap.movieTitle}
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {seatMap.roomName} &middot;{' '}
                <span className="text-yellow-400 font-bold">{seatMap.screenType}</span> &middot;{' '}
                {formatShowtime(seatMap.startTime, seatMap.endTime)}
              </p>
            </div>
          </div>

          {/* Stepper (1. Chọn Ghế -> 2. Bắp Nước -> 3. Thanh Toán) */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white shadow-md shadow-red-600/30">
              <span className="w-4 h-4 rounded-full bg-white text-red-600 text-[10px] flex items-center justify-center font-black">
                1
              </span>
              <span>Chọn Ghế</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-white/10 text-slate-300 text-[10px] flex items-center justify-center font-black">
                2
              </span>
              <span>Bắp Nước</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-white/10 text-slate-300 text-[10px] flex items-center justify-center font-black">
                3
              </span>
              <span>Thanh Toán</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Layout (Left: Seat Map, Right: Bill Summary) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Interactive Seat Map (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-[#18191E] p-3.5 rounded-xl border border-white/5 shadow-xs">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Nhấn vào ghế để chọn hoặc hủy chọn (tối đa 8 ghế/giao dịch).</span>
              </div>

              <button
                onClick={() => loadSeatMap()}
                className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 font-semibold"
                title="Làm mới trạng thái sơ đồ ghế"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>

            {/* 3D Curved Screen */}
            <CurvedScreen screenType={seatMap.screenType} roomName={seatMap.roomName} />

            {/* Seat Matrix Grid & Legend */}
            <SeatMatrix
              seats={seatMap.seats}
              selectedSeatIds={selectedSeatIds}
              onToggleSeat={handleToggleSeat}
              disabled={holding}
            />
          </div>

          {/* RIGHT COLUMN: Order Bill / Summary Panel (4 Cols) */}
          <div className="lg:col-span-4">
            <BookingBillSummary
              movieTitle={seatMap.movieTitle}
              moviePosterUrl={seatMap.moviePosterUrl}
              movieAgeRating={seatMap.movieAgeRating}
              roomName={seatMap.roomName}
              screenType={seatMap.screenType}
              showtimeStr={formatShowtime(seatMap.startTime, seatMap.endTime)}
              selectedSeats={selectedSeats}
              totalAmount={totalAmount}
              formattedTime={formattedTime}
              isWarning={isWarning}
              isExpired={isExpired}
              percentage={percentage}
              onRemoveSeat={handleRemoveSeat}
              onProceed={handleProceedToConcessions}
              loading={holding}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
