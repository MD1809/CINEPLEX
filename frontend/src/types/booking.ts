export type SeatType = 'REGULAR' | 'VIP' | 'SWEETBOX';

export type SeatStatus = 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'SELECTED_BY_ME';

export interface SeatDto {
  id: number;
  seatCode: string;
  rowCode: string;
  colNumber: number;
  type: SeatType | string;
  colorCode?: string;
  status: SeatStatus;
  price: number;
}

export interface SeatMapResponse {
  showtimeId: number;
  movieId: number;
  movieTitle: string;
  movieSlug: string;
  movieAgeRating: string;
  moviePosterUrl: string;
  roomId: number;
  roomName: string;
  screenType: string;
  totalRows: number;
  totalColumns: number;
  basePrice: number;
  startTime: string;
  endTime: string;
  seats: SeatDto[];
}

export interface SelectedSeat {
  id: number;
  seatCode: string;
  rowCode: string;
  colNumber: number;
  type: string;
  price: number;
}

export interface HoldSeatsRequest {
  showtimeId: number;
  seatIds: number[];
  holdSessionId?: string;
}

export interface HoldSeatsResponse {
  holdSessionId: string;
  showtimeId: number;
  selectedSeats: SelectedSeat[];
  totalSeatsAmount: number;
  holdExpiresAt: string;
  remainingSeconds: number;
}

export interface ReleaseSeatsRequest {
  holdSessionId: string;
  showtimeId: number;
  seatIds?: number[];
}
