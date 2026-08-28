import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { Voucher, ApplyVoucherRequest, ApplyVoucherResponse } from '../types/voucher';

export const voucherApi = {
  applyVoucher: async (data: ApplyVoucherRequest): Promise<ApiResponse<ApplyVoucherResponse>> => {
    const response = await axiosClient.post<ApiResponse<ApplyVoucherResponse>>('/vouchers/apply', data);
    return response.data;
  },

  getAvailableVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    const response = await axiosClient.get<ApiResponse<Voucher[]>>('/vouchers/available');
    return response.data;
  },
};
