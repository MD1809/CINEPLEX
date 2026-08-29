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
public class DashboardMetricsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal ticketRevenue;
    private BigDecimal snackRevenue;
    private long totalTicketsSold;
    private long totalActiveMovies;
    private double roomOccupancyRate;
    private long totalOrders;
    private String period;
}
