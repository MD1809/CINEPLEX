import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { OnlineCheckoutRequest, OnlineCheckoutResponse, PaymentResult } from '../types/payment';

export const paymentApi = {
  checkoutOnline: async (data: OnlineCheckoutRequest): Promise<ApiResponse<OnlineCheckoutResponse>> => {
    const response = await axiosClient.post<ApiResponse<OnlineCheckoutResponse>>('/bookings/checkout-online', data);
    return response.data;
  },

  verifyVnpayReturn: async (queryParams: Record<string, string>): Promise<ApiResponse<PaymentResult>> => {
    const response = await axiosClient.get<ApiResponse<PaymentResult>>('/payments/vnpay-return', {
      params: queryParams,
    });
    return response.data;
  },
};
