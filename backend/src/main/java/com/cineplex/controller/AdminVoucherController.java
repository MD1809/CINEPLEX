package com.cineplex.controller;

import com.cineplex.dto.admin.VoucherAdminResponse;
import com.cineplex.dto.admin.VoucherCreateUpdateRequest;
import com.cineplex.dto.common.ApiResponse;
import com.cineplex.service.AdminVoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminVoucherController {

    private final AdminVoucherService adminVoucherService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherAdminResponse>>> getAllVouchers() {
        List<VoucherAdminResponse> vouchers = adminVoucherService.getAllVouchers();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách voucher thành công", vouchers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherAdminResponse>> getVoucherById(@PathVariable Long id) {
        VoucherAdminResponse voucher = adminVoucherService.getVoucherById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin voucher thành công", voucher));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherAdminResponse>> createVoucher(
            @Valid @RequestBody VoucherCreateUpdateRequest request) {
        VoucherAdminResponse created = adminVoucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo mã voucher mới thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherAdminResponse>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherCreateUpdateRequest request) {
        VoucherAdminResponse updated = adminVoucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật mã voucher thành công", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<VoucherAdminResponse>> toggleVoucherStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        VoucherAdminResponse updated = adminVoucherService.toggleVoucherStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái voucher thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        adminVoucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa voucher thành công", null));
    }
}
