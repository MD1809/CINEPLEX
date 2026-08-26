package com.cineplex.dto.room;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatBatchUpdateRequest {

    @NotEmpty(message = "Danh sách ID ghế không được để trống")
    private List<Long> seatIds;

    private Integer seatTypeId;

    private Boolean isActive;
}
