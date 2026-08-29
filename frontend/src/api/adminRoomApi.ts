import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Room, Seat, SeatType, ScreenType, RoomStatus } from '../types/room';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface RoomFormData {
  name: string;
  screenType: ScreenType;
  totalRows: number;
  totalColumns: number;
  status: RoomStatus;
}

export interface SeatBatchUpdatePayload {
  seatIds: number[];
  seatTypeId?: number;
  isActive?: boolean;
}

export const adminRoomApi = {
  getAllRooms: async (): Promise<Room[]> => {
    const response = await axios.get('/api/v1/rooms');
    return response.data.data;
  },

  getRoomById: async (id: number): Promise<Room> => {
    const response = await axios.get(`/api/v1/rooms/${id}`);
    return response.data.data;
  },

  getSeatsByRoomId: async (roomId: number): Promise<Seat[]> => {
    const response = await axios.get(`/api/v1/rooms/${roomId}/seats`);
    return response.data.data;
  },

  getAllSeatTypes: async (): Promise<SeatType[]> => {
    const response = await axios.get('/api/v1/rooms/seat-types');
    return response.data.data;
  },

  createRoom: async (data: RoomFormData): Promise<Room> => {
    const response = await axios.post('/api/v1/admin/rooms', data, getAuthHeaders());
    return response.data.data;
  },

  updateRoom: async (id: number, data: RoomFormData): Promise<Room> => {
    const response = await axios.put(`/api/v1/admin/rooms/${id}`, data, getAuthHeaders());
    return response.data.data;
  },

  updateRoomStatus: async (id: number, status: RoomStatus): Promise<Room> => {
    const response = await axios.patch(
      `/api/v1/admin/rooms/${id}/status`,
      null,
      {
        ...getAuthHeaders(),
        params: { status },
      }
    );
    return response.data.data;
  },

  deleteRoom: async (id: number): Promise<void> => {
    await axios.delete(`/api/v1/admin/rooms/${id}`, getAuthHeaders());
  },

  batchUpdateSeats: async (roomId: number, payload: SeatBatchUpdatePayload): Promise<Seat[]> => {
    const response = await axios.put(
      `/api/v1/admin/rooms/${roomId}/seats`,
      payload,
      getAuthHeaders()
    );
    return response.data.data;
  },
};
