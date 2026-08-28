package com.cineplex.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineCheckoutRequest {

    @NotNull(message = "ID lịch chiếu không được để trống")
    private Long showtimeId;

    @NotBlank(message = "Mã phiên giữ ghế (holdSessionId) không được để trống")
    private String holdSessionId;

    @NotEmpty(message = "Danh sách ghế đặt không được để trống")
    private List<Long> seatIds;

    @Builder.Default
    private List<SnackOrderItemDto> snacks = new ArrayList<>();

    private String voucherCode;
}
