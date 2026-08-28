import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import {
  SeatMapResponse,
  HoldSeatsRequest,
  HoldSeatsResponse,
  ReleaseSeatsRequest,
} from '../types/booking';

export const bookingApi = {
  getSeatMap: async (showtimeId: number, holdSessionId?: string): Promise<ApiResponse<SeatMapResponse>> => {
    const params = holdSessionId ? { holdSessionId } : undefined;
    const response = await axiosClient.get<ApiResponse<SeatMapResponse>>(
      `/showtimes/${showtimeId}/seat-map`,
      { params }
    );
    return response.data;
  },

  holdSeats: async (data: HoldSeatsRequest): Promise<ApiResponse<HoldSeatsResponse>> => {
    const response = await axiosClient.post<ApiResponse<HoldSeatsResponse>>(
      '/bookings/hold-seats',
      data
    );
    return response.data;
  },

  releaseSeats: async (data: ReleaseSeatsRequest): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/bookings/release-seats',
      data
    );
    return response.data;
  },
};
