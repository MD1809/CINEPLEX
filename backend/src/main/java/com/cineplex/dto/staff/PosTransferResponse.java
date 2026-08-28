package com.cineplex.dto.staff;

import com.cineplex.entity.enums.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosTransferResponse {
    private String bookingCode;
    private BigDecimal finalAmount;
    private String qrCodeBase64;
    private String bankName;
    private String bankAccountNo;
    private String accountHolder;
    private String transferContent;
    private BookingStatus status;
    private LocalDateTime expiresAt;
    private String message;
}
