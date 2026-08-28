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
public class HoldSeatsResponse {
    private String holdSessionId;
    private Long showtimeId;
    private List<SelectedSeatDto> selectedSeats;
    private BigDecimal totalSeatsAmount;
    private LocalDateTime holdExpiresAt;
    private Long remainingSeconds;
}
