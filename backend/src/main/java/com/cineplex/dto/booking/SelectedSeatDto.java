package com.cineplex.dto.booking;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectedSeatDto {
    private Long id;
    private String seatCode;
    private String rowCode;
    private Integer colNumber;
    private String type;
    private BigDecimal price;
}
