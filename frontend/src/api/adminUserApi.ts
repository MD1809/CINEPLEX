import axiosClient from './axiosClient';

export interface UserAdminItem {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  isActive: boolean;
  isRoot?: boolean;
  createdAt: string;
  updatedAt?: string;
  totalBookingsCount?: number;
  totalSpentAmount?: number;
  totalStaffOrdersCount?: number;
}

export interface StaffCreateRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: 'STAFF' | 'ADMIN';
}

export interface UserUpdateRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  newPassword?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

export interface UserBookingHistoryItem {
  id: number;
  bookingCode: string;
  movieTitle: string;
  posterUrl?: string;
  roomName: string;
  showDate?: string;
  startTime?: string;
  endTime?: string;
  seatNames: string[];
  snacks: string[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  channel: 'ONLINE' | 'POS';
  paymentMethod?: 'VNPAY' | 'CASH' | 'BANK_TRANSFER';
  createdAt: string;
}

export const adminUserApi = {
  getUsers: async (role?: 'CUSTOMER' | 'STAFF' | 'ADMIN', search?: string): Promise<UserAdminItem[]> => {
    const res = await axiosClient.get('/admin/users', {
      params: {
        role: role || undefined,
        search: search || undefined,
      },
    });
    return res.data.data;
  },

  getUserById: async (id: number): Promise<UserAdminItem> => {
    const res = await axiosClient.get(`/admin/users/${id}`);
    return res.data.data;
  },

  createStaff: async (payload: StaffCreateRequest): Promise<UserAdminItem> => {
    const res = await axiosClient.post('/admin/users/staff', payload);
    return res.data.data;
  },

  updateUser: async (id: number, payload: UserUpdateRequest): Promise<UserAdminItem> => {
    const res = await axiosClient.put(`/admin/users/${id}`, payload);
    return res.data.data;
  },

  toggleUserStatus: async (id: number, isActive: boolean): Promise<UserAdminItem> => {
    const res = await axiosClient.patch(`/admin/users/${id}/status`, null, {
      params: { isActive },
    });
    return res.data.data;
  },

  getUserBookingHistory: async (userId: number): Promise<UserBookingHistoryItem[]> => {
    const res = await axiosClient.get(`/admin/users/${userId}/bookings`);
    return res.data.data;
  },

  sendPasswordResetEmail: async (userId: number): Promise<void> => {
    await axiosClient.post(`/admin/users/${userId}/send-reset-password-email`);
  },
};
