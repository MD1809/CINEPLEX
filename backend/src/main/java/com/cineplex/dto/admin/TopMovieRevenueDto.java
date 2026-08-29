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
public class TopMovieRevenueDto {
    private Long movieId;
    private String title;
    private String posterUrl;
    private Integer durationMinutes;
    private String ageRating;
    private long ticketsSold;
    private BigDecimal totalRevenue;
    private double occupancyRate;
}
