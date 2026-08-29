import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import {
  DashboardMetrics,
  PaymentStat,
  RevenueChartPoint,
  TopMovieRevenue,
} from '../types/adminAnalytics';

const API_BASE_URL = '/api/v1/admin/analytics';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const adminAnalyticsApi = {
  getMetrics: async (period = '7days', startDate?: string, endDate?: string): Promise<DashboardMetrics> => {
    const params: Record<string, string> = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get(`${API_BASE_URL}/metrics`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data.data;
  },

  getRevenueChart: async (
    period = '7days',
    startDate?: string,
    endDate?: string
  ): Promise<RevenueChartPoint[]> => {
    const params: Record<string, string> = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get(`${API_BASE_URL}/revenue-chart`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data.data;
  },

  getTopMovies: async (limit = 5, period = 'month'): Promise<TopMovieRevenue[]> => {
    const response = await axios.get(`${API_BASE_URL}/top-movies`, {
      ...getAuthHeaders(),
      params: { limit, period },
    });
    return response.data.data;
  },

  getPaymentStats: async (period = 'month'): Promise<PaymentStat[]> => {
    const response = await axios.get(`${API_BASE_URL}/payment-stats`, {
      ...getAuthHeaders(),
      params: { period },
    });
    return response.data.data;
  },

  getSoldTickets: async (
    period = 'month',
    search?: string,
    limit = 50
  ): Promise<import('../types/adminAnalytics').SoldTicket[]> => {
    const params: Record<string, any> = { period, limit };
    if (search) params.search = search;

    const response = await axios.get(`${API_BASE_URL}/sold-tickets`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data.data;
  },
};
