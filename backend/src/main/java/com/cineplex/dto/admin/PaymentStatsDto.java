package com.cineplex.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatsDto {
    private String method;
    private String methodName;
    private BigDecimal amount;
    private long transactionCount;
    private double percentage;
}
