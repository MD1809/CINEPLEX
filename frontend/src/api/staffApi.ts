import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import {
  PosCheckoutRequest,
  PosCheckoutResponse,
  PosTransferResponse,
  TicketCheckInRequest,
  TicketCheckInResponse,
  ShiftReportResponse,
  StaffOrderSummaryDto,
  PageResponse,
} from '../types/staff';
import { Showtime } from '../types/showtime';

export const staffApi = {
  // POS Cash Checkout
  checkoutCash: async (payload: PosCheckoutRequest): Promise<ApiResponse<PosCheckoutResponse>> => {
    const response = await axiosClient.post<ApiResponse<PosCheckoutResponse>>(
      '/staff/pos/checkout-cash',
      payload
    );
    return response.data;
  },

  // POS Bank Transfer QR Checkout
  checkoutTransfer: async (payload: PosCheckoutRequest): Promise<ApiResponse<PosTransferResponse>> => {
    const response = await axiosClient.post<ApiResponse<PosTransferResponse>>(
      '/staff/pos/checkout-transfer',
      payload
    );
    return response.data;
  },

  // Confirm Bank Transfer Payment
  confirmTransfer: async (bookingCode: string): Promise<ApiResponse<PosCheckoutResponse>> => {
    const response = await axiosClient.post<ApiResponse<PosCheckoutResponse>>(
      `/staff/pos/confirm-transfer/${bookingCode}`
    );
    return response.data;
  },

  // Check In Ticket via QR Token or Ticket Code
  checkInTicket: async (payload: TicketCheckInRequest): Promise<ApiResponse<TicketCheckInResponse>> => {
    const response = await axiosClient.post<ApiResponse<TicketCheckInResponse>>(
      '/staff/tickets/check-in',
      payload
    );
    return response.data;
  },

  // Get Shift Revenue Report (supports optional date range)
  getShiftReport: async (startDate?: string, endDate?: string): Promise<ApiResponse<ShiftReportResponse>> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosClient.get<ApiResponse<ShiftReportResponse>>(
      '/staff/shift-report',
      { params }
    );
    return response.data;
  },

  // Get Staff Order History with filters & pagination
  getStaffOrders: async (params: {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<StaffOrderSummaryDto>>> => {
    const response = await axiosClient.get<ApiResponse<PageResponse<StaffOrderSummaryDto>>>(
      '/staff/orders',
      { params }
    );
    return response.data;
  },

  // Get historical booking receipt & tickets for re-print
  getBookingReceipt: async (bookingCode: string): Promise<ApiResponse<PosCheckoutResponse>> => {
    const response = await axiosClient.get<ApiResponse<PosCheckoutResponse>>(
      `/staff/orders/${bookingCode}/receipt`
    );
    return response.data;
  },

  // Get Today's Showtimes for POS quick select
  getTodayShowtimes: async (): Promise<ApiResponse<Showtime[]>> => {
    const response = await axiosClient.get<ApiResponse<Showtime[]>>(
      '/staff/pos/today-showtimes'
    );
    return response.data;
  },
};
