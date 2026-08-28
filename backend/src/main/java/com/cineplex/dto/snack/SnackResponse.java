package com.cineplex.dto.snack;

import com.cineplex.entity.enums.SnackCategory;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SnackResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private SnackCategory category;
    private Boolean isAvailable;
}
