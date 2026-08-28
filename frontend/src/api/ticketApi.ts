import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { BookingDetail } from '../types/ticket';

export const ticketApi = {
  getMyBookings: async (): Promise<ApiResponse<BookingDetail[]>> => {
    const response = await axiosClient.get<ApiResponse<BookingDetail[]>>('/customer/bookings');
    return response.data;
  },

  getBookingDetail: async (bookingCode: string): Promise<ApiResponse<BookingDetail>> => {
    const response = await axiosClient.get<ApiResponse<BookingDetail>>(`/customer/bookings/${bookingCode}`);
    return response.data;
  },
};
