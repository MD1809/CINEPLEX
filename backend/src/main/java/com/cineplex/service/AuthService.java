package com.cineplex.service;

import com.cineplex.dto.auth.*;
import com.cineplex.security.UserPrincipal;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    UserDto getCurrentUser(UserPrincipal userPrincipal);

    void changePassword(UserPrincipal userPrincipal, ChangePasswordRequest request);
}
