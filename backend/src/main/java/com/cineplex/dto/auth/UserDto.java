package com.cineplex.dto.auth;

import com.cineplex.entity.User;
import com.cineplex.entity.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private Boolean isActive;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
