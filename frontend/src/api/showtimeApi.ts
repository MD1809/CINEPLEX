import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { Showtime, ShowtimeMovieGroup } from '../types/showtime';

export const showtimeApi = {
  getShowtimes: async (params?: { date?: string; movieId?: number; roomId?: number }): Promise<ApiResponse<Showtime[]>> => {
    const response = await axiosClient.get('/showtimes', { params });
    return response.data;
  },

  getGroupedByMovie: async (date?: string): Promise<ApiResponse<ShowtimeMovieGroup[]>> => {
    const response = await axiosClient.get('/showtimes/group-by-movie', { params: { date } });
    return response.data;
  },

  getShowtimeById: async (id: number): Promise<ApiResponse<Showtime>> => {
    const response = await axiosClient.get(`/showtimes/${id}`);
    return response.data;
  },
};
