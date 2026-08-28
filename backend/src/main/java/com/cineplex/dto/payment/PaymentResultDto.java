package com.cineplex.dto.payment;

import com.cineplex.entity.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResultDto {
    private String bookingCode;
    private String transactionId;
    private String vnpBankCode;
    private String vnpTransactionNo;
    private BigDecimal amount;
    private PaymentStatus status;
    private String responseCode;
    private String message;
    private LocalDateTime paidAt;
}
