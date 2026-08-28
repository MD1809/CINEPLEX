package com.cineplex.dto.booking;

import com.cineplex.entity.enums.BookingChannel;
import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.PaymentMethod;
import com.cineplex.entity.enums.PaymentStatus;
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
public class BookingDetailResponse {
    private Long bookingId;
    private String bookingCode;
    private String movieTitle;
    private String moviePosterUrl;
    private String movieAgeRating;
    private Integer durationMinutes;
    private String roomName;
    private String screenType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private BookingChannel channel;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String voucherCode;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<TicketDetailDto> tickets = new ArrayList<>();

    @Builder.Default
    private List<BookingSnackDetailDto> snacks = new ArrayList<>();
}
