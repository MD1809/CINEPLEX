package com.cineplex.dto.voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyVoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String voucherCode;

    @NotNull(message = "Giá trị đơn hàng không được để trống")
    private BigDecimal orderAmount;
}
