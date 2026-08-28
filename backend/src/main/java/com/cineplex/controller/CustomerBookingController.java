package com.cineplex.controller;

import com.cineplex.dto.booking.BookingDetailResponse;
import com.cineplex.dto.common.ApiResponse;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.CustomerBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerBookingController {

    private final CustomerBookingService customerBookingService;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingDetailResponse>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        List<BookingDetailResponse> bookings = customerBookingService.getCustomerBookings(userId);
        return ResponseEntity.ok(ApiResponse.<List<BookingDetailResponse>>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy lịch sử đặt vé thành công")
                .data(bookings)
                .build());
    }

    @GetMapping("/bookings/{bookingCode}")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingDetail(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String bookingCode
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        BookingDetailResponse booking = customerBookingService.getBookingDetail(userId, bookingCode);
        return ResponseEntity.ok(ApiResponse.<BookingDetailResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy thông tin vé thành công")
                .data(booking)
                .build());
    }
}
