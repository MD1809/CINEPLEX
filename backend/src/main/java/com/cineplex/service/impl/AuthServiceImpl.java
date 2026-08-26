package com.cineplex.service.impl;

import com.cineplex.dto.auth.*;
import com.cineplex.entity.User;
import com.cineplex.entity.enums.Role;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.UserRepository;
import com.cineplex.security.CustomUserDetailsService;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng bởi một tài khoản khác.");
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new customer account: {}", savedUser.getEmail());

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);

        User user = userRepository.findByEmail(userPrincipal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userPrincipal.getUsername()));

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserByUsername(email);

        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);
        String newRefreshToken = tokenProvider.generateRefreshToken(userPrincipal);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public void changePassword(UserPrincipal userPrincipal, ChangePasswordRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getEmail());
    }
}
