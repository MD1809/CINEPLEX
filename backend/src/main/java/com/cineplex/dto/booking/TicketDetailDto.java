package com.cineplex.dto.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDetailDto {
    private Long id;
    private String ticketCode;
    private String qrCodeToken;
    private String qrCodeBase64;
    private String seatCode;
    private String seatType;
    private BigDecimal price;
    private Boolean isCheckedIn;
    private LocalDateTime checkedInAt;
}
