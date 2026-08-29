package com.cineplex.dto.admin;

import com.cineplex.entity.enums.Role;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private Boolean isActive;
    private Boolean isRoot;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalBookingsCount;
    private BigDecimal totalSpentAmount;
    private Integer totalStaffOrdersCount;
}
