package com.cineplex.dto.staff;

import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffOrderSummaryDto {
    private Long id;
    private String bookingCode;
    private String movieTitle;
    private String moviePosterUrl;
    private String roomName;
    private String screenType;
    private LocalDateTime showtimeStart;
    private int ticketsCount;
    private List<String> seatCodes;
    private int snacksCount;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private PaymentMethod paymentMethod;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
