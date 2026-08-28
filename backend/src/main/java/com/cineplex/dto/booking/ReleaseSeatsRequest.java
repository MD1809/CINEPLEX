package com.cineplex.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseSeatsRequest {

    @NotBlank(message = "holdSessionId không được để trống")
    private String holdSessionId;

    @NotNull(message = "showtimeId không được để trống")
    private Long showtimeId;

    private List<Long> seatIds;
}
