package com.cineplex.dto.movie;

import com.cineplex.entity.Movie;
import com.cineplex.entity.enums.AgeRating;
import com.cineplex.entity.enums.MovieStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieResponse {
    private Long id;
    private String title;
    private String originalTitle;
    private String slug;
    private String director;
    private String cast;
    private String synopsis;
    private Integer durationMinutes;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private AgeRating ageRating;
    private String posterUrl;
    private String bannerUrl;
    private String trailerUrl;
    private MovieStatus status;
    private List<GenreResponse> genres;
    private LocalDateTime createdAt;

    public static MovieResponse fromEntity(Movie movie) {
        List<GenreResponse> genreResponses = movie.getGenres() == null ? List.of() :
                movie.getGenres().stream()
                        .map(GenreResponse::fromEntity)
                        .collect(Collectors.toList());

        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .originalTitle(movie.getOriginalTitle())
                .slug(movie.getSlug())
                .director(movie.getDirector())
                .cast(movie.getCast())
                .synopsis(movie.getSynopsis())
                .durationMinutes(movie.getDurationMinutes())
                .releaseDate(movie.getReleaseDate())
                .endDate(movie.getEndDate())
                .ageRating(movie.getAgeRating())
                .posterUrl(movie.getPosterUrl())
                .bannerUrl(movie.getBannerUrl())
                .trailerUrl(movie.getTrailerUrl())
                .status(movie.getStatus())
                .genres(genreResponses)
                .createdAt(movie.getCreatedAt())
                .build();
    }
}
