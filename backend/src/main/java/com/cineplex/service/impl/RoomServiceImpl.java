package com.cineplex.service.impl;

import com.cineplex.dto.room.RoomResponse;
import com.cineplex.dto.room.SeatBatchUpdateRequest;
import com.cineplex.dto.room.SeatResponse;
import com.cineplex.dto.room.SeatTypeResponse;
import com.cineplex.entity.Room;
import com.cineplex.entity.Seat;
import com.cineplex.entity.SeatType;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.RoomRepository;
import com.cineplex.repository.SeatRepository;
import com.cineplex.repository.SeatTypeRepository;
import com.cineplex.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final SeatTypeRepository seatTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(room -> RoomResponse.fromEntity(room, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", id));
        return RoomResponse.fromEntity(room, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByRoomId(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("Phòng chiếu", "id", roomId);
        }
        return seatRepository.findByRoomIdOrderByRowCodeAscColNumberAsc(roomId).stream()
                .map(SeatResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatTypeResponse> getAllSeatTypes() {
        return seatTypeRepository.findAll().stream()
                .map(SeatTypeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<SeatResponse> batchUpdateSeats(Long roomId, SeatBatchUpdateRequest request) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("Phòng chiếu", "id", roomId);
        }

        SeatType targetSeatType = null;
        if (request.getSeatTypeId() != null) {
            targetSeatType = seatTypeRepository.findById(request.getSeatTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Loại ghế", "id", request.getSeatTypeId()));
        }

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        for (Seat seat : seats) {
            if (seat.getRoom().getId().equals(roomId)) {
                if (targetSeatType != null) {
                    seat.setSeatType(targetSeatType);
                }
                if (request.getIsActive() != null) {
                    seat.setIsActive(request.getIsActive());
                }
            }
        }

        List<Seat> updatedSeats = seatRepository.saveAll(seats);
        log.info("Batch updated {} seats in room ID: {}", updatedSeats.size(), roomId);

        return updatedSeats.stream()
                .map(SeatResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
