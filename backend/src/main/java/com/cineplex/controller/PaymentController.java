package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.payment.PaymentResultDto;
import com.cineplex.dto.payment.VnpayIpnResponse;
import com.cineplex.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * VNPAY Webhook IPN Endpoint (Called by VNPAY Server)
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<VnpayIpnResponse> handleVnpayIpn(@RequestParam Map<String, String> allParams) {
        log.info("Received VNPAY IPN callback with params: {}", allParams);
        VnpayIpnResponse response = paymentService.processVnpayIpn(allParams);
        return ResponseEntity.ok(response);
    }

    /**
     * VNPAY Return URL Verification Endpoint (Called when customer redirects back)
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<PaymentResultDto>> handleVnpayReturn(@RequestParam Map<String, String> allParams) {
        log.info("Received VNPAY Return redirect with params: {}", allParams);
        PaymentResultDto result = paymentService.processVnpayReturn(allParams);
        return ResponseEntity.ok(ApiResponse.<PaymentResultDto>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message(result.getMessage())
                .data(result)
                .build());
    }
}
