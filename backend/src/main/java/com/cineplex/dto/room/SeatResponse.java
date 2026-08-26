package com.cineplex.dto.room;

import com.cineplex.entity.Seat;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatResponse {
    private Long id;
    private Long roomId;
    private SeatTypeResponse seatType;
    private String rowCode;
    private Integer colNumber;
    private String seatCode;
    private Boolean isActive;

    public static SeatResponse fromEntity(Seat seat) {
        return SeatResponse.builder()
                .id(seat.getId())
                .roomId(seat.getRoom() != null ? seat.getRoom().getId() : null)
                .seatType(SeatTypeResponse.fromEntity(seat.getSeatType()))
                .rowCode(seat.getRowCode())
                .colNumber(seat.getColNumber())
                .seatCode(seat.getSeatCode())
                .isActive(seat.getIsActive())
                .build();
    }
}
