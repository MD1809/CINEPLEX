package com.cineplex.controller;

import com.cineplex.dto.auth.*;
import com.cineplex.dto.common.ApiResponse;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Các API xác thực tài khoản, đăng nhập, đăng ký và cấp mới token")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản khách hàng mới")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng ký tài khoản thành công.", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống (Khách hàng, Nhân viên, Admin)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công.", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Cấp mới Access Token bằng Refresh Token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok("Làm mới token thành công.", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng đang đăng nhập")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = authService.getCurrentUser(userPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin người dùng thành công.", userDto));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu tài khoản")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userPrincipal, request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công.", null));
    }
}
