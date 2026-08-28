import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SelectedSeat, HoldSeatsResponse } from '../types/booking';

export interface SnackItemSelection {
  snackId: number;
  name: string;
  price: number;
  quantity: number;
}

interface BookingState {
  showtimeId: number | null;
  holdSessionId: string | null;
  selectedSeats: SelectedSeat[];
  totalSeatsAmount: number;
  holdExpiresAt: string | null;
  remainingSeconds: number;

  movieInfo: {
    id: number;
    title: string;
    slug: string;
    posterUrl: string;
    ageRating: string;
  } | null;

  roomInfo: {
    id: number;
    name: string;
    screenType: string;
    startTime: string;
    endTime: string;
  } | null;

  selectedSnacks: SnackItemSelection[];
  voucherCode: string | null;
  discountAmount: number;

  // Actions
  setHoldData: (
    response: HoldSeatsResponse,
    movie: { id: number; title: string; slug: string; posterUrl: string; ageRating: string },
    room: { id: number; name: string; screenType: string; startTime: string; endTime: string }
  ) => void;
  updateRemainingSeconds: (seconds: number) => void;
  setSelectedSnacks: (snacks: SnackItemSelection[]) => void;
  setVoucher: (code: string | null, discount: number) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      showtimeId: null,
      holdSessionId: null,
      selectedSeats: [],
      totalSeatsAmount: 0,
      holdExpiresAt: null,
      remainingSeconds: 0,
      movieInfo: null,
      roomInfo: null,
      selectedSnacks: [],
      voucherCode: null,
      discountAmount: 0,

      setHoldData: (response, movie, room) =>
        set({
          showtimeId: response.showtimeId,
          holdSessionId: response.holdSessionId,
          selectedSeats: response.selectedSeats,
          totalSeatsAmount: response.totalSeatsAmount,
          holdExpiresAt: response.holdExpiresAt,
          remainingSeconds: response.remainingSeconds,
          movieInfo: movie,
          roomInfo: room,
        }),

      updateRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),

      setSelectedSnacks: (snacks) => set({ selectedSnacks: snacks }),

      setVoucher: (code, discount) => set({ voucherCode: code, discountAmount: discount }),

      clearBooking: () =>
        set({
          showtimeId: null,
          holdSessionId: null,
          selectedSeats: [],
          totalSeatsAmount: 0,
          holdExpiresAt: null,
          remainingSeconds: 0,
          movieInfo: null,
          roomInfo: null,
          selectedSnacks: [],
          voucherCode: null,
          discountAmount: 0,
        }),
    }),
    {
      name: 'cineplex_booking_session',
    }
  )
);
