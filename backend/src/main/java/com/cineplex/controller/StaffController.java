package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.staff.*;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/pos/checkout-cash")
    public ResponseEntity<ApiResponse<PosCheckoutResponse>> checkoutCash(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PosCheckoutRequest request
    ) {
        Long staffId = currentUser != null ? currentUser.getId() : null;
        PosCheckoutResponse response = staffService.checkoutCash(staffId, request);
        return ResponseEntity.ok(ApiResponse.<PosCheckoutResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Thanh toán tiền mặt tại quầy và xuất vé thành công!")
                .data(response)
                .build());
    }

    @PostMapping("/pos/checkout-transfer")
    public ResponseEntity<ApiResponse<PosTransferResponse>> checkoutTransfer(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PosCheckoutRequest request
    ) {
        Long staffId = currentUser != null ? currentUser.getId() : null;
        PosTransferResponse response = staffService.checkoutTransfer(staffId, request);
        return ResponseEntity.ok(ApiResponse.<PosTransferResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Đã tạo mã QR chuyển khoản. Mời khách hàng quét mã.")
                .data(response)
                .build());
    }

    @PostMapping("/pos/confirm-transfer/{bookingCode}")
    public ResponseEntity<ApiResponse<PosCheckoutResponse>> confirmTransfer(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String bookingCode
    ) {
        Long staffId = currentUser != null ? currentUser.getId() : null;
        PosCheckoutResponse response = staffService.confirmTransfer(staffId, bookingCode);
        return ResponseEntity.ok(ApiResponse.<PosCheckoutResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Xác nhận nhận tiền chuyển khoản thành công và xuất vé!")
                .data(response)
                .build());
    }

    @PostMapping("/tickets/check-in")
    public ResponseEntity<ApiResponse<TicketCheckInResponse>> checkInTicket(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TicketCheckInRequest request
    ) {
        Long staffId = currentUser != null ? currentUser.getId() : null;
        TicketCheckInResponse response = staffService.checkInTicket(staffId, request);
        return ResponseEntity.ok(ApiResponse.<TicketCheckInResponse>builder()
                .success(response.isValid())
                .statusCode(response.isValid() ? HttpStatus.OK.value() : HttpStatus.BAD_REQUEST.value())
                .message(response.getMessage())
                .data(response)
                .build());
    }

    @GetMapping("/shift-report")
    public ResponseEntity<ApiResponse<ShiftReportResponse>> getShiftReport(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long staffId = currentUser != null ? currentUser.getId() : null;
        ShiftReportResponse response = staffService.getShiftReport(staffId);
        return ResponseEntity.ok(ApiResponse.<ShiftReportResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy báo cáo doanh thu ca trực thành công")
                .data(response)
                .build());
    }

    @GetMapping("/pos/today-showtimes")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getTodayShowtimes() {
        List<ShowtimeResponse> showtimes = staffService.getTodayShowtimes();
        return ResponseEntity.ok(ApiResponse.<List<ShowtimeResponse>>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy danh sách suất chiếu hôm nay thành công")
                .data(showtimes)
                .build());
    }
}
