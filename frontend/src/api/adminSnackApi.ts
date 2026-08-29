import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Snack, SnackCategory } from '../types/snack';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface SnackFormData {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: SnackCategory;
  isAvailable: boolean;
}

export const adminSnackApi = {
  getAllSnacksForAdmin: async (): Promise<Snack[]> => {
    const response = await axios.get('/api/v1/admin/snacks', getAuthHeaders());
    return response.data.data;
  },

  getSnackById: async (id: number): Promise<Snack> => {
    const response = await axios.get(`/api/v1/admin/snacks/${id}`, getAuthHeaders());
    return response.data.data;
  },

  createSnack: async (data: SnackFormData): Promise<Snack> => {
    const response = await axios.post('/api/v1/admin/snacks', data, getAuthHeaders());
    return response.data.data;
  },

  updateSnack: async (id: number, data: Partial<SnackFormData>): Promise<Snack> => {
    const response = await axios.put(`/api/v1/admin/snacks/${id}`, data, getAuthHeaders());
    return response.data.data;
  },

  toggleAvailability: async (id: number, isAvailable: boolean): Promise<Snack> => {
    const response = await axios.patch(
      `/api/v1/admin/snacks/${id}/availability`,
      null,
      {
        ...getAuthHeaders(),
        params: { isAvailable },
      }
    );
    return response.data.data;
  },

  deleteSnack: async (id: number): Promise<void> => {
    await axios.delete(`/api/v1/admin/snacks/${id}`, getAuthHeaders());
  },
};
