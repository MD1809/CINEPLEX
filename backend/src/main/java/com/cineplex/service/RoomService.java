package com.cineplex.service;

import com.cineplex.dto.room.RoomResponse;
import com.cineplex.dto.room.SeatBatchUpdateRequest;
import com.cineplex.dto.room.SeatResponse;
import com.cineplex.dto.room.SeatTypeResponse;

import java.util.List;

public interface RoomService {

    List<RoomResponse> getAllRooms();

    RoomResponse getRoomById(Long id);

    List<SeatResponse> getSeatsByRoomId(Long roomId);

    List<SeatTypeResponse> getAllSeatTypes();

    List<SeatResponse> batchUpdateSeats(Long roomId, SeatBatchUpdateRequest request);
}
