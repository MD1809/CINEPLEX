package com.cineplex.dto.booking;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDto {
    private Long id;
    private String seatCode;
    private String rowCode;
    private Integer colNumber;
    private String type; // REGULAR, VIP, SWEETBOX
    private String colorCode;
    private String status; // AVAILABLE, HOLD, BOOKED, SELECTED_BY_ME
    private BigDecimal price;
}
