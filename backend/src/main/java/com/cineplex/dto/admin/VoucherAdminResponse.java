package com.cineplex.dto.admin;

import com.cineplex.entity.enums.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherAdminResponse {
    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer remainingUsage;
    private Boolean isActive;
    private Boolean isExpired;
    private String status; // ACTIVE, INACTIVE, EXPIRED, OUT_OF_USES
}
