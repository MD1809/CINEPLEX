package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.movie.MovieCreateRequest;
import com.cineplex.dto.movie.MovieResponse;
import com.cineplex.dto.movie.MovieUpdateRequest;
import com.cineplex.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Movies", description = "Các API tra cứu và quản lý phim")
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/api/v1/movies/now-showing")
    @Operation(summary = "Lấy danh sách phim đang chiếu tại rạp")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getNowShowingMovies() {
        List<MovieResponse> movies = movieService.getNowShowingMovies();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách phim đang chiếu thành công.", movies));
    }

    @GetMapping("/api/v1/movies/coming-soon")
    @Operation(summary = "Lấy danh sách phim sắp chiếu")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getComingSoonMovies() {
        List<MovieResponse> movies = movieService.getComingSoonMovies();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách phim sắp chiếu thành công.", movies));
    }

    @GetMapping("/api/v1/movies")
    @Operation(summary = "Lấy tất cả phim trong hệ thống")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getAllMovies() {
        List<MovieResponse> movies = movieService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách tất cả phim thành công.", movies));
    }

    @GetMapping("/api/v1/movies/{slug}")
    @Operation(summary = "Lấy thông tin chi tiết phim theo slug")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieBySlug(@PathVariable String slug) {
        MovieResponse movie = movieService.getMovieBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin chi tiết phim thành công.", movie));
    }

    @PostMapping("/api/v1/admin/movies")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thêm phim mới vào hệ thống (Admin)")
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@Valid @RequestBody MovieCreateRequest request) {
        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Thêm phim mới thành công.", response));
    }

    @PutMapping("/api/v1/admin/movies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin phim (Admin)")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieUpdateRequest request) {
        MovieResponse response = movieService.updateMovie(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật phim thành công.", response));
    }

    @DeleteMapping("/api/v1/admin/movies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa phim khỏi hệ thống (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa phim thành công.", null));
    }
}
