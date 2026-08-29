import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Movie, Genre } from '../types/movie';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface MovieFormData {
  title: string;
  originalTitle?: string;
  slug: string;
  director?: string;
  cast?: string;
  synopsis?: string;
  durationMinutes: number;
  releaseDate: string;
  endDate?: string;
  ageRating: string;
  posterUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
  status: string;
  genreIds?: number[];
}

export const adminMovieApi = {
  getAllMovies: async (): Promise<Movie[]> => {
    const response = await axios.get('/api/v1/movies');
    return response.data.data;
  },

  getAllGenres: async (): Promise<Genre[]> => {
    const response = await axios.get('/api/v1/genres');
    return response.data.data;
  },

  createMovie: async (data: MovieFormData): Promise<Movie> => {
    const response = await axios.post('/api/v1/admin/movies', data, getAuthHeaders());
    return response.data.data;
  },

  updateMovie: async (id: number, data: MovieFormData): Promise<Movie> => {
    const response = await axios.put(`/api/v1/admin/movies/${id}`, data, getAuthHeaders());
    return response.data.data;
  },

  updateMovieStatus: async (id: number, status: string): Promise<Movie> => {
    const response = await axios.patch(
      `/api/v1/admin/movies/${id}/status`,
      null,
      {
        ...getAuthHeaders(),
        params: { status },
      }
    );
    return response.data.data;
  },

  deleteMovie: async (id: number): Promise<void> => {
    await axios.delete(`/api/v1/admin/movies/${id}`, getAuthHeaders());
  },
};
