package com.cineplex.dto.staff;

import com.cineplex.dto.booking.BookingSnackDetailDto;
import com.cineplex.dto.booking.TicketDetailDto;
import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosCheckoutResponse {
    private String bookingCode;
    private String movieTitle;
    private String roomName;
    private String screenType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BigDecimal cashReceived;
    private BigDecimal changeAmount;
    private PaymentMethod paymentMethod;
    private BookingStatus status;
    private String staffName;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<TicketDetailDto> tickets = new ArrayList<>();

    @Builder.Default
    private List<BookingSnackDetailDto> snacks = new ArrayList<>();
}
