package com.cineplex.controller;

import com.cineplex.dto.movie.MovieCreateRequest;
import com.cineplex.entity.enums.AgeRating;
import com.cineplex.entity.enums.MovieStatus;
import com.cineplex.entity.enums.Role;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("GET /api/v1/movies/now-showing - Public access to now showing movies")
    void testGetNowShowingMovies() throws Exception {
        mockMvc.perform(get("/api/v1/movies/now-showing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", isA(Iterable.class)));
    }

    @Test
    @DisplayName("GET /api/v1/movies/coming-soon - Public access to coming soon movies")
    void testGetComingSoonMovies() throws Exception {
        mockMvc.perform(get("/api/v1/movies/coming-soon"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", isA(Iterable.class)));
    }

    @Test
    @DisplayName("GET /api/v1/genres - Public access to all movie genres")
    void testGetAllGenres() throws Exception {
        mockMvc.perform(get("/api/v1/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(5))));
    }

    @Test
    @DisplayName("POST /api/v1/admin/movies - Admin creates a new movie successfully")
    void testCreateMovieAsAdmin() throws Exception {
        UserPrincipal admin = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .role(Role.ADMIN)
                .build();

        String token = jwtTokenProvider.generateAccessToken(admin);

        String uniqueSlug = "avatar-lua-va-tro-" + System.currentTimeMillis();
        MovieCreateRequest request = MovieCreateRequest.builder()
                .title("Avatar 3: Lửa và Tro")
                .slug(uniqueSlug)
                .durationMinutes(190)
                .releaseDate(LocalDate.now().plusMonths(6))
                .ageRating(AgeRating.T13)
                .status(MovieStatus.COMING_SOON)
                .build();

        mockMvc.perform(post("/api/v1/admin/movies")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Avatar 3: Lửa và Tro")))
                .andExpect(jsonPath("$.data.slug", is(uniqueSlug)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/movies - Reject non-admin customer from creating movie")
    void testCreateMovieAsCustomerForbidden() throws Exception {
        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();

        String token = jwtTokenProvider.generateAccessToken(customer);

        MovieCreateRequest request = MovieCreateRequest.builder()
                .title("Hacker Movie")
                .slug("hacker-movie")
                .durationMinutes(90)
                .releaseDate(LocalDate.now())
                .ageRating(AgeRating.P)
                .status(MovieStatus.NOW_SHOWING)
                .build();

        mockMvc.perform(post("/api/v1/admin/movies")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
