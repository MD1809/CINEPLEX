import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { Genre, Movie } from '../types/movie';

export const movieApi = {
  getNowShowing: async (): Promise<ApiResponse<Movie[]>> => {
    const response = await axiosClient.get('/movies/now-showing');
    return response.data;
  },

  getComingSoon: async (): Promise<ApiResponse<Movie[]>> => {
    const response = await axiosClient.get('/movies/coming-soon');
    return response.data;
  },

  getAllMovies: async (): Promise<ApiResponse<Movie[]>> => {
    const response = await axiosClient.get('/movies');
    return response.data;
  },

  getMovieBySlug: async (slug: string): Promise<ApiResponse<Movie>> => {
    const response = await axiosClient.get(`/movies/${slug}`);
    return response.data;
  },

  getGenres: async (): Promise<ApiResponse<Genre[]>> => {
    const response = await axiosClient.get('/genres');
    return response.data;
  },
};
