package com.cineplex.dto.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineCheckoutResponse {
    private String bookingCode;
    private String paymentUrl;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private LocalDateTime expiresAt;
    private String message;
}
