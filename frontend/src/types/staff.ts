export interface PosCheckoutItem {
  snackId: number;
  quantity: number;
}

export interface PosCheckoutRequest {
  showtimeId: number;
  seatIds: number[];
  snacks?: PosCheckoutItem[];
  voucherCode?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  cashReceived?: number;
}

export interface PosTicketInfo {
  ticketCode: string;
  qrCodeToken: string;
  qrCodeImageBase64: string;
  seatCode: string;
  seatType: string;
  price: number;
}

export interface PosCheckoutResponse {
  bookingCode: string;
  movieTitle: string;
  roomName: string;
  screenType: string;
  showtimeStart: string;
  showtimeEnd: string;
  tickets: PosTicketInfo[];
  totalSeatsPrice: number;
  totalSnacksPrice: number;
  discountAmount: number;
  finalAmount: number;
  cashReceived: number;
  changeAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  staffName: string;
  createdAt: string;
}

export interface PosTransferResponse {
  bookingCode: string;
  finalAmount: number;
  bankAccountNo: string;
  bankAccountName: string;
  bankCode: string;
  transferContent: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export interface TicketCheckInRequest {
  qrCodeTokenOrTicketCode: string;
}

export interface TicketCheckInResponse {
  valid: boolean;
  message: string;
  ticketCode?: string;
  movieTitle?: string;
  roomName?: string;
  screenType?: string;
  showtimeStart?: string;
  seatCode?: string;
  seatType?: string;
  customerName?: string;
  checkedInAt?: string;
  staffName?: string;
}

export interface ShiftReportResponse {
  staffId: number;
  staffName: string;
  staffEmail: string;
  totalOrders: number;
  totalTicketsSold: number;
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
  generatedAt: string;
}

export interface StaffOrderSummaryDto {
  id: number;
  bookingCode: string;
  movieTitle: string;
  moviePosterUrl?: string;
  roomName: string;
  screenType: string;
  showtimeStart: string;
  ticketsCount: number;
  seatCodes: string[];
  snacksCount: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
