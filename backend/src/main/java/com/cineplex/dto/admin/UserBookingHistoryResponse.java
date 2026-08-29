package com.cineplex.dto.admin;

import com.cineplex.entity.enums.BookingChannel;
import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBookingHistoryResponse {
    private Long id;
    private String bookingCode;
    private String movieTitle;
    private String posterUrl;
    private String roomName;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<String> seatNames;
    private List<String> snacks;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BookingStatus status;
    private BookingChannel channel;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
}
