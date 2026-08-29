package com.cineplex.dto.admin;

import com.cineplex.entity.enums.SnackCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SnackCreateUpdateRequest {

    @NotBlank(message = "Tên bắp/nước/combo không được để trống")
    @Size(max = 150, message = "Tên không được vượt quá 150 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải lớn hơn 0")
    private BigDecimal price;

    @Size(max = 500, message = "Đường dẫn ảnh không được vượt quá 500 ký tự")
    private String imageUrl;

    @NotNull(message = "Danh mục không được để trống (POPCORN, DRINK, COMBO)")
    private SnackCategory category;

    @Builder.Default
    private Boolean isAvailable = true;
}
