package com.cineplex.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoldTicketDto {
    private Long ticketId;
    private String ticketCode;
    private String bookingCode;
    private String movieTitle;
    private String posterUrl;
    private String screenType;
    private String roomName;
    private String seatCode;
    private String seatType;
    private BigDecimal price;
    private LocalDateTime showtimeStart;
    private LocalDateTime showtimeEnd;
    private String bookingChannel;
    private String paymentMethod;
    private String customerName;
    private String staffName;
    private boolean isCheckedIn;
    private LocalDateTime checkedInAt;
    private LocalDateTime createdAt;
}
