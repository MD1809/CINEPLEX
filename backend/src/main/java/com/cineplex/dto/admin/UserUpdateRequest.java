package com.cineplex.dto.admin;

import com.cineplex.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {

    private String fullName;

    private String email;

    private String phoneNumber;

    private String newPassword;

    @NotNull(message = "Vai trò không được để trống")
    private Role role;
}
