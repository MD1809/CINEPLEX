export interface TicketDetail {
  id: number;
  ticketCode: string;
  qrCodeToken: string;
  qrCodeBase64: string;
  seatCode: string;
  seatType: string;
  price: number;
  isCheckedIn: boolean;
  checkedInAt?: string;
}

export interface BookingSnackDetail {
  snackName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingDetail {
  bookingId: number;
  bookingCode: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieAgeRating: string;
  durationMinutes?: number;
  roomName: string;
  screenType: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  channel: 'ONLINE' | 'POS';
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt: string;
  tickets: TicketDetail[];
  snacks: BookingSnackDetail[];
}
