package com.cineplex.service;

import com.cineplex.dto.admin.RoomCreateUpdateRequest;
import com.cineplex.dto.room.RoomResponse;
import com.cineplex.dto.room.SeatBatchUpdateRequest;
import com.cineplex.dto.room.SeatResponse;
import com.cineplex.dto.room.SeatTypeResponse;
import com.cineplex.entity.enums.RoomStatus;

import java.util.List;

public interface RoomService {

    List<RoomResponse> getAllRooms();

    RoomResponse getRoomById(Long id);

    List<SeatResponse> getSeatsByRoomId(Long roomId);

    List<SeatTypeResponse> getAllSeatTypes();

    RoomResponse createRoom(RoomCreateUpdateRequest request);

    RoomResponse updateRoom(Long id, RoomCreateUpdateRequest request);

    RoomResponse updateRoomStatus(Long id, RoomStatus status);

    void deleteRoom(Long id);

    List<SeatResponse> batchUpdateSeats(Long roomId, SeatBatchUpdateRequest request);
}
