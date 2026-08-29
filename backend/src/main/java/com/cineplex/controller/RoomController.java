package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.room.RoomResponse;
import com.cineplex.dto.room.SeatBatchUpdateRequest;
import com.cineplex.dto.room.SeatResponse;
import com.cineplex.dto.room.SeatTypeResponse;
import com.cineplex.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Rooms & Seat Matrix", description = "Các API tra cứu và quản lý phòng chiếu & ma trận ghế")
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/api/v1/rooms")
    @Operation(summary = "Lấy danh sách tất cả phòng chiếu")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        List<RoomResponse> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách phòng chiếu thành công.", rooms));
    }

    @GetMapping("/api/v1/rooms/{id}")
    @Operation(summary = "Lấy chi tiết phòng chiếu và ma trận ghế")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        RoomResponse room = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết phòng chiếu thành công.", room));
    }

    @GetMapping("/api/v1/rooms/{id}/seats")
    @Operation(summary = "Lấy danh sách ghế theo phòng chiếu")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getSeatsByRoomId(@PathVariable Long id) {
        List<SeatResponse> seats = roomService.getSeatsByRoomId(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách ghế thành công.", seats));
    }

    @GetMapping("/api/v1/rooms/seat-types")
    @Operation(summary = "Lấy danh sách các loại ghế trong hệ thống")
    public ResponseEntity<ApiResponse<List<SeatTypeResponse>>> getAllSeatTypes() {
        List<SeatTypeResponse> seatTypes = roomService.getAllSeatTypes();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách loại ghế thành công.", seatTypes));
    }

    @PostMapping("/api/v1/admin/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo phòng chiếu mới và sinh ma trận ghế mặc định (Admin)")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody com.cineplex.dto.admin.RoomCreateUpdateRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo phòng chiếu mới thành công.", response));
    }

    @PutMapping("/api/v1/admin/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin phòng chiếu (Admin)")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody com.cineplex.dto.admin.RoomCreateUpdateRequest request) {
        RoomResponse response = roomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật phòng chiếu thành công.", response));
    }

    @PatchMapping("/api/v1/admin/rooms/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái phòng chiếu (Admin)")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoomStatus(
            @PathVariable Long id,
            @RequestParam com.cineplex.entity.enums.RoomStatus status) {
        RoomResponse response = roomService.updateRoomStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái phòng chiếu thành công.", response));
    }

    @DeleteMapping("/api/v1/admin/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa phòng chiếu khỏi hệ thống (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa phòng chiếu thành công.", null));
    }

    @PutMapping("/api/v1/admin/rooms/{id}/seats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật loại ghế / trạng thái ghế hàng loạt (Admin Interactive Seat Painter)")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> batchUpdateSeats(
            @PathVariable Long id,
            @Valid @RequestBody SeatBatchUpdateRequest request) {
        List<SeatResponse> updatedSeats = roomService.batchUpdateSeats(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật ma trận ghế thành công.", updatedSeats));
    }
}
