import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Showtime, ShowtimeMovieGroup, ShowtimeStatus } from '../types/showtime';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface ShowtimeFormData {
  movieId: number;
  roomId: number;
  startTime: string; // ISO LocalDateTime string e.g. "2026-08-30T14:00:00"
  basePrice: number;
  status?: ShowtimeStatus;
}

export const adminShowtimeApi = {
  getShowtimes: async (params?: {
    date?: string;
    movieId?: number;
    roomId?: number;
  }): Promise<Showtime[]> => {
    const response = await axios.get('/api/v1/showtimes', { params });
    return response.data.data;
  },

  getShowtimesGroupedByMovie: async (date?: string): Promise<ShowtimeMovieGroup[]> => {
    const response = await axios.get('/api/v1/showtimes/group-by-movie', {
      params: { date },
    });
    return response.data.data;
  },

  getShowtimeById: async (id: number): Promise<Showtime> => {
    const response = await axios.get(`/api/v1/showtimes/${id}`);
    return response.data.data;
  },

  createShowtime: async (data: ShowtimeFormData): Promise<Showtime> => {
    const response = await axios.post('/api/v1/admin/showtimes', data, getAuthHeaders());
    return response.data.data;
  },

  updateShowtime: async (id: number, data: Partial<ShowtimeFormData>): Promise<Showtime> => {
    const response = await axios.put(`/api/v1/admin/showtimes/${id}`, data, getAuthHeaders());
    return response.data.data;
  },

  deleteShowtime: async (id: number): Promise<void> => {
    await axios.delete(`/api/v1/admin/showtimes/${id}`, getAuthHeaders());
  },
};
