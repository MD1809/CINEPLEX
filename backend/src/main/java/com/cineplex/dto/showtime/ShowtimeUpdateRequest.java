package com.cineplex.dto.showtime;

import com.cineplex.entity.enums.ShowtimeStatus;
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
public class ShowtimeUpdateRequest {

    private Long movieId;

    private Long roomId;

    @NotNull(message = "Thời gian bắt đầu chiếu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Giá vé cơ bản không được để trống")
    @DecimalMin(value = "10000.00", message = "Giá vé cơ bản tối thiểu là 10.000 VNĐ")
    private BigDecimal basePrice;

    @NotNull(message = "Trạng thái suất chiếu không được để trống")
    private ShowtimeStatus status;
}
