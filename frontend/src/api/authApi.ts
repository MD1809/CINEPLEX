import axiosClient from './axiosClient';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, User } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });
    return res.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const res = await axiosClient.put<ApiResponse<null>>('/auth/change-password', data);
    return res.data;
  },
};
