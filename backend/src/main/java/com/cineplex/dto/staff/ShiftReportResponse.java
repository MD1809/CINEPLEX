package com.cineplex.dto.staff;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftReportResponse {
    private Long staffId;
    private String staffName;
    private String staffEmail;
    private Long totalOrders;
    private Long totalTicketsSold;
    private BigDecimal cashRevenue;
    private BigDecimal transferRevenue;
    private BigDecimal totalRevenue;
    private LocalDateTime generatedAt;
}
