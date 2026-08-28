export interface OnlineCheckoutRequest {
  showtimeId: number;
  holdSessionId: string;
  seatIds: number[];
  snacks?: {
    snackId: number;
    quantity: number;
  }[];
  voucherCode?: string;
}

export interface OnlineCheckoutResponse {
  bookingCode: string;
  paymentUrl: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  expiresAt: string;
  message: string;
}

export interface PaymentResult {
  bookingCode: string;
  transactionId?: string;
  vnpBankCode?: string;
  vnpTransactionNo?: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  responseCode: string;
  message: string;
  paidAt?: string;
}
