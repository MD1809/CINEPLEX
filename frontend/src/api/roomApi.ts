import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth';
import { Room, Seat, SeatType } from '../types/room';

export const roomApi = {
  getAllRooms: async (): Promise<ApiResponse<Room[]>> => {
    const response = await axiosClient.get('/rooms');
    return response.data;
  },

  getRoomById: async (id: number): Promise<ApiResponse<Room>> => {
    const response = await axiosClient.get(`/rooms/${id}`);
    return response.data;
  },

  getSeatsByRoomId: async (id: number): Promise<ApiResponse<Seat[]>> => {
    const response = await axiosClient.get(`/rooms/${id}/seats`);
    return response.data;
  },

  getSeatTypes: async (): Promise<ApiResponse<SeatType[]>> => {
    const response = await axiosClient.get('/rooms/seat-types');
    return response.data;
  },
};
