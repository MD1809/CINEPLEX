package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.booking.HoldSeatsRequest;
import com.cineplex.dto.booking.HoldSeatsResponse;
import com.cineplex.dto.booking.ReleaseSeatsRequest;
import com.cineplex.dto.booking.SeatMapResponse;
import com.cineplex.dto.booking.OnlineCheckoutRequest;
import com.cineplex.dto.booking.OnlineCheckoutResponse;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.PaymentService;
import com.cineplex.service.SeatHoldService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BookingController {

    private final SeatHoldService seatHoldService;
    private final PaymentService paymentService;

    /**
     * Public endpoint to get seat map with real-time AVAILABLE / HOLD / BOOKED status
     */
    @GetMapping("/showtimes/{showtimeId}/seat-map")
    public ResponseEntity<ApiResponse<SeatMapResponse>> getSeatMap(
            @PathVariable Long showtimeId,
            @RequestParam(required = false) String holdSessionId
    ) {
        SeatMapResponse response = seatHoldService.getSeatMap(showtimeId, holdSessionId);
        return ResponseEntity.ok(ApiResponse.<SeatMapResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy sơ đồ ghế thành công")
                .data(response)
                .build());
    }

    /**
     * Authenticated endpoint to lock seats into Redis with 300s (5-min) TTL
     */
    @PostMapping("/bookings/hold-seats")
    public ResponseEntity<ApiResponse<HoldSeatsResponse>> holdSeats(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody HoldSeatsRequest request
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        HoldSeatsResponse response = seatHoldService.holdSeats(userId, request);
        return ResponseEntity.ok(ApiResponse.<HoldSeatsResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Giữ ghế thành công trong 5 phút")
                .data(response)
                .build());
    }

    /**
     * Authenticated endpoint to release held seats
     */
    @PostMapping("/bookings/release-seats")
    public ResponseEntity<ApiResponse<Void>> releaseSeats(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ReleaseSeatsRequest request
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        seatHoldService.releaseSeats(userId, request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Hủy giữ ghế thành công")
                .data(null)
                .build());
    }

    /**
     * Authenticated endpoint to initiate online VNPAY checkout with 10-minute hold extension
     */
    @PostMapping("/bookings/checkout-online")
    public ResponseEntity<ApiResponse<OnlineCheckoutResponse>> checkoutOnline(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OnlineCheckoutRequest request,
            HttpServletRequest httpRequest
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        OnlineCheckoutResponse response = paymentService.createOnlineCheckout(userId, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.<OnlineCheckoutResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Tạo giao dịch thanh toán VNPAY thành công")
                .data(response)
                .build());
    }
}
