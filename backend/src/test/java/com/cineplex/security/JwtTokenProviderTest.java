package com.cineplex.security;

import com.cineplex.entity.User;
import com.cineplex.entity.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private UserPrincipal adminPrincipal;
    private UserPrincipal customerPrincipal;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        // Set standard test HMAC-SHA256 secret (64 characters / 512 bits)
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpirationInMs", 86400000L); // 1 day

        User adminUser = User.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .passwordHash("hashedPass")
                .fullName("Admin User")
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        adminPrincipal = UserPrincipal.create(adminUser);

        User customerUser = User.builder()
                .id(2L)
                .email("customer@gmail.com")
                .passwordHash("hashedPass")
                .fullName("Customer User")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        customerPrincipal = UserPrincipal.create(customerUser);
    }

    @Test
    @DisplayName("Generate access token and extract claims correctly")
    void testGenerateAndValidateAccessToken() {
        String token = jwtTokenProvider.generateAccessToken(adminPrincipal);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("admin@cineplex.vn");
        assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo("ADMIN");
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(1L);
    }

    @Test
    @DisplayName("Generate refresh token with valid claims")
    void testGenerateRefreshToken() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(customerPrincipal);

        assertThat(refreshToken).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(refreshToken)).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(refreshToken)).isEqualTo("customer@gmail.com");
        assertThat(jwtTokenProvider.getUserIdFromToken(refreshToken)).isEqualTo(2L);
    }

    @Test
    @DisplayName("Reject invalid and tampered tokens")
    void testInvalidToken() {
        String token = jwtTokenProvider.generateAccessToken(adminPrincipal);
        String tamperedToken = token + "xyz";

        assertThat(jwtTokenProvider.validateToken(tamperedToken)).isFalse();
        assertThat(jwtTokenProvider.validateToken("invalid.token.here")).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
    }
}
