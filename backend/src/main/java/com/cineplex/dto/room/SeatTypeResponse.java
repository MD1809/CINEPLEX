package com.cineplex.dto.room;

import com.cineplex.entity.SeatType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatTypeResponse {
    private Integer id;
    private String name;
    private BigDecimal surchargePrice;
    private String colorCode;

    public static SeatTypeResponse fromEntity(SeatType seatType) {
        if (seatType == null) return null;
        return SeatTypeResponse.builder()
                .id(seatType.getId())
                .name(seatType.getName())
                .surchargePrice(seatType.getSurchargePrice())
                .colorCode(seatType.getColorCode())
                .build();
    }
}
