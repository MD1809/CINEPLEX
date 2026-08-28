package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.voucher.ApplyVoucherRequest;
import com.cineplex.dto.voucher.ApplyVoucherResponse;
import com.cineplex.dto.voucher.VoucherDto;
import com.cineplex.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplyVoucherResponse>> applyVoucher(
            @Valid @RequestBody ApplyVoucherRequest request
    ) {
        ApplyVoucherResponse response = voucherService.applyVoucher(request);
        return ResponseEntity.ok(ApiResponse.<ApplyVoucherResponse>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Áp dụng mã giảm giá thành công")
                .data(response)
                .build());
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VoucherDto>>> getAvailableVouchers() {
        List<VoucherDto> vouchers = voucherService.getAvailableVouchers();
        return ResponseEntity.ok(ApiResponse.<List<VoucherDto>>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy danh sách voucher thành công")
                .data(vouchers)
                .build());
    }
}
