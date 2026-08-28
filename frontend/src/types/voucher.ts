export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  endDate: string;
}

export interface ApplyVoucherRequest {
  voucherCode: string;
  orderAmount: number;
}

export interface ApplyVoucherResponse {
  voucherId: number;
  voucherCode: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}
