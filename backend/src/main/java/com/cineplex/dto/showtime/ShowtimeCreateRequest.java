package com.cineplex.dto.showtime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeCreateRequest {

    @NotNull(message = "ID phim không được để trống")
    private Long movieId;

    @NotNull(message = "ID phòng chiếu không được để trống")
    private Long roomId;

    @NotNull(message = "Thời gian bắt đầu chiếu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Giá vé cơ bản không được để trống")
    @DecimalMin(value = "10000.00", message = "Giá vé cơ bản tối thiểu là 10.000 VNĐ")
    private BigDecimal basePrice;
}
