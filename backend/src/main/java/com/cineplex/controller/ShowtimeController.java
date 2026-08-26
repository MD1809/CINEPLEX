package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.showtime.ShowtimeCreateRequest;
import com.cineplex.dto.showtime.ShowtimeMovieGroupResponse;
import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.showtime.ShowtimeUpdateRequest;
import com.cineplex.service.ShowtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Showtimes", description = "Các API tra cứu và quản lý lịch chiếu phim")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/api/v1/showtimes")
    @Operation(summary = "Lấy danh sách lịch chiếu (lọc theo ngày, phim, phòng)")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getShowtimes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long roomId) {
        List<ShowtimeResponse> showtimes = showtimeService.getShowtimes(date, movieId, roomId);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách lịch chiếu thành công.", showtimes));
    }

    @GetMapping("/api/v1/showtimes/group-by-movie")
    @Operation(summary = "Lấy danh sách lịch chiếu gom nhóm theo từng phim")
    public ResponseEntity<ApiResponse<List<ShowtimeMovieGroupResponse>>> getShowtimesGroupedByMovie(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ShowtimeMovieGroupResponse> grouped = showtimeService.getShowtimesGroupedByMovie(date);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách lịch chiếu gom theo phim thành công.", grouped));
    }

    @GetMapping("/api/v1/showtimes/{id}")
    @Operation(summary = "Lấy chi tiết một suất chiếu")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getShowtimeById(@PathVariable Long id) {
        ShowtimeResponse showtime = showtimeService.getShowtimeById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết suất chiếu thành công.", showtime));
    }

    @PostMapping("/api/v1/admin/showtimes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch chiếu mới có kiểm tra chống xung đột (Admin)")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> createShowtime(
            @Valid @RequestBody ShowtimeCreateRequest request) {
        ShowtimeResponse response = showtimeService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo suất chiếu mới thành công.", response));
    }

    @PutMapping("/api/v1/admin/showtimes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật suất chiếu (Admin)")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> updateShowtime(
            @PathVariable Long id,
            @Valid @RequestBody ShowtimeUpdateRequest request) {
        ShowtimeResponse response = showtimeService.updateShowtime(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật suất chiếu thành công.", response));
    }

    @DeleteMapping("/api/v1/admin/showtimes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Hủy suất chiếu (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.ok(ApiResponse.ok("Hủy suất chiếu thành công.", null));
    }
}
