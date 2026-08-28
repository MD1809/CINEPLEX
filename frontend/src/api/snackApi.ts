import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { Snack, SnackCategory } from '../types/snack';

export const snackApi = {
  getAvailableSnacks: async (category?: SnackCategory): Promise<ApiResponse<Snack[]>> => {
    const params = category ? { category } : undefined;
    const response = await axiosClient.get<ApiResponse<Snack[]>>('/snacks', { params });
    return response.data;
  },
};
