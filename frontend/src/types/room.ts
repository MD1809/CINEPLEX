export type ScreenType = 'STANDARD_2D' | 'THREE_D' | 'IMAX' | 'FOUR_DX';
export type RoomStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';

export interface SeatType {
  id: number;
  name: string;
  surchargePrice: number;
  colorCode: string;
}

export interface Seat {
  id: number;
  roomId: number;
  seatType: SeatType;
  rowCode: string;
  colNumber: number;
  seatCode: string;
  isActive: boolean;
}

export interface Room {
  id: number;
  name: string;
  totalRows: number;
  totalColumns: number;
  totalSeats: number;
  screenType: ScreenType;
  status: RoomStatus;
  seats?: Seat[];
}
