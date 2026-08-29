import axiosClient from './axiosClient';

export interface VoucherAdminItem {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  remainingUsage: number;
  isActive: boolean;
  isExpired: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'OUT_OF_USES';
}

export interface VoucherCreateUpdateRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive?: boolean;
}

export const adminVoucherApi = {
  getAllVouchers: async (): Promise<VoucherAdminItem[]> => {
    const res = await axiosClient.get('/admin/vouchers');
    return res.data.data;
  },

  getVoucherById: async (id: number): Promise<VoucherAdminItem> => {
    const res = await axiosClient.get(`/admin/vouchers/${id}`);
    return res.data.data;
  },

  createVoucher: async (payload: VoucherCreateUpdateRequest): Promise<VoucherAdminItem> => {
    const res = await axiosClient.post('/admin/vouchers', payload);
    return res.data.data;
  },

  updateVoucher: async (id: number, payload: VoucherCreateUpdateRequest): Promise<VoucherAdminItem> => {
    const res = await axiosClient.put(`/admin/vouchers/${id}`, payload);
    return res.data.data;
  },

  toggleVoucherStatus: async (id: number, isActive: boolean): Promise<VoucherAdminItem> => {
    const res = await axiosClient.patch(`/admin/vouchers/${id}/status`, null, {
      params: { isActive },
    });
    return res.data.data;
  },

  deleteVoucher: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/vouchers/${id}`);
  },
};
