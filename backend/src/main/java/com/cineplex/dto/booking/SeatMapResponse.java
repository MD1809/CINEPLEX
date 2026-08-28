package com.cineplex.dto.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatMapResponse {
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private String movieSlug;
    private String movieAgeRating;
    private String moviePosterUrl;
    private Long roomId;
    private String roomName;
    private String screenType;
    private Integer totalRows;
    private Integer totalColumns;
    private BigDecimal basePrice;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<SeatDto> seats;
}
