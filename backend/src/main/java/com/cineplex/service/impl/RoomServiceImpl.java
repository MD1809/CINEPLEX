package com.cineplex.service.impl;

import com.cineplex.dto.admin.RoomCreateUpdateRequest;
import com.cineplex.dto.room.RoomResponse;
import com.cineplex.dto.room.SeatBatchUpdateRequest;
import com.cineplex.dto.room.SeatResponse;
import com.cineplex.dto.room.SeatTypeResponse;
import com.cineplex.entity.Room;
import com.cineplex.entity.Seat;
import com.cineplex.entity.SeatType;
import com.cineplex.entity.enums.RoomStatus;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.RoomRepository;
import com.cineplex.repository.SeatRepository;
import com.cineplex.repository.SeatTypeRepository;
import com.cineplex.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    public RoomResponse createRoom(RoomCreateUpdateRequest request) {
        Room room = Room.builder()
                .name(request.getName().trim())
                .screenType(request.getScreenType())
                .totalRows(request.getTotalRows())
                .totalColumns(request.getTotalColumns())
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.ACTIVE)
                .build();

        Room savedRoom = roomRepository.save(room);

        // Find default seat type (REGULAR)
        SeatType regularType = seatTypeRepository.findAll().stream()
                .filter(st -> "REGULAR".equalsIgnoreCase(st.getName()))
                .findFirst()
                .orElseGet(() -> seatTypeRepository.findAll().stream().findFirst().orElse(null));

        List<Seat> seats = new ArrayList<>();
        int totalRows = request.getTotalRows();
        int totalCols = request.getTotalColumns();

        for (int r = 0; r < totalRows; r++) {
            char rowChar = (char) ('A' + r);
            String rowCode = String.valueOf(rowChar);

            for (int c = 1; c <= totalCols; c++) {
                String seatCode = rowCode + c;
                seats.add(Seat.builder()
                        .room(savedRoom)
                        .seatType(regularType)
                        .rowCode(rowCode)
                        .colNumber(c)
                        .seatCode(seatCode)
                        .isActive(true)
                        .build());
            }
        }

        seatRepository.saveAll(seats);
        savedRoom.setSeats(seats);
        log.info("Created new room: {} with {} seats", savedRoom.getName(), seats.size());

        return RoomResponse.fromEntity(savedRoom, true);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long id, RoomCreateUpdateRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", id));

        boolean rowsChanged = !room.getTotalRows().equals(request.getTotalRows());
        boolean colsChanged = !room.getTotalColumns().equals(request.getTotalColumns());

        room.setName(request.getName().trim());
        room.setScreenType(request.getScreenType());
        room.setStatus(request.getStatus());

        if (rowsChanged || colsChanged) {
            room.setTotalRows(request.getTotalRows());
            room.setTotalColumns(request.getTotalColumns());

            // Regenerate seats if dimensions changed
            SeatType regularType = seatTypeRepository.findAll().stream()
                    .filter(st -> "REGULAR".equalsIgnoreCase(st.getName()))
                    .findFirst()
                    .orElseGet(() -> seatTypeRepository.findAll().stream().findFirst().orElse(null));

            List<Seat> existingSeats = seatRepository.findByRoomId(id);
            seatRepository.deleteAll(existingSeats);

            List<Seat> newSeats = new ArrayList<>();
            for (int r = 0; r < request.getTotalRows(); r++) {
                char rowChar = (char) ('A' + r);
                String rowCode = String.valueOf(rowChar);

                for (int c = 1; c <= request.getTotalColumns(); c++) {
                    String seatCode = rowCode + c;
                    newSeats.add(Seat.builder()
                            .room(room)
                            .seatType(regularType)
                            .rowCode(rowCode)
                            .colNumber(c)
                            .seatCode(seatCode)
                            .isActive(true)
                            .build());
                }
            }
            seatRepository.saveAll(newSeats);
            room.setSeats(newSeats);
        }

        Room updatedRoom = roomRepository.save(room);
        log.info("Updated room ID {}: {}", id, updatedRoom.getName());
        return RoomResponse.fromEntity(updatedRoom, true);
    }

    @Override
    @Transactional
    public RoomResponse updateRoomStatus(Long id, RoomStatus status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", id));

        room.setStatus(status);
        Room updatedRoom = roomRepository.save(room);
        log.info("Updated status of room ID {}: {}", id, status);
        return RoomResponse.fromEntity(updatedRoom, false);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", id));

        try {
            roomRepository.delete(room);
            log.info("Deleted room ID: {}", id);
        } catch (Exception e) {
            log.error("Cannot delete room ID {} due to foreign key constraints: {}", id, e.getMessage());
            throw new BadRequestException("Không thể xóa phòng chiếu này vì đã có suất chiếu hoặc vé liên kết. Hãy chuyển trạng thái sang Tạm Dừng/Bảo Trì!");
        }
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
