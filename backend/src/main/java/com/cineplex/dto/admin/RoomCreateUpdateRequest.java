package com.cineplex.dto.admin;

import com.cineplex.entity.enums.RoomStatus;
import com.cineplex.entity.enums.ScreenType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomCreateUpdateRequest {

    @NotBlank(message = "Tên phòng chiếu không được để trống")
    @Size(max = 100, message = "Tên phòng chiếu tối đa 100 ký tự")
    private String name;

    @NotNull(message = "Loại màn hình không được để trống")
    private ScreenType screenType;

    @NotNull(message = "Số hàng ghế không được để trống")
    @Min(value = 1, message = "Số hàng ghế tối thiểu là 1")
    @Max(value = 26, message = "Số hàng ghế tối đa là 26 (A-Z)")
    private Integer totalRows;

    @NotNull(message = "Số cột ghế không được để trống")
    @Min(value = 1, message = "Số cột ghế tối thiểu là 1")
    @Max(value = 30, message = "Số cột ghế tối đa là 30")
    private Integer totalColumns;

    @Builder.Default
    private RoomStatus status = RoomStatus.ACTIVE;
}
