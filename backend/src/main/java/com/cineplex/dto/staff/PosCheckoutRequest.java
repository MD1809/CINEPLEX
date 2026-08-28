package com.cineplex.dto.staff;

import com.cineplex.dto.booking.SnackOrderItemDto;
import com.cineplex.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosCheckoutRequest {

    @NotNull(message = "ID suất chiếu không được để trống")
    private Long showtimeId;

    @NotEmpty(message = "Danh sách ghế không được để trống")
    private List<Long> seatIds;

    @Builder.Default
    private List<SnackOrderItemDto> snacks = new ArrayList<>();

    private String voucherCode;

    private String customerName;

    private String customerPhone;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    private BigDecimal cashReceived; // For CASH payment change calculation
}
