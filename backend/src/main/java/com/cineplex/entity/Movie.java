package com.cineplex.entity;

import com.cineplex.entity.enums.AgeRating;
import com.cineplex.entity.enums.MovieStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "movies", indexes = {
    @Index(name = "idx_movie_slug", columnList = "slug", unique = true),
    @Index(name = "idx_movie_status", columnList = "status"),
    @Index(name = "idx_movie_release_date", columnList = "release_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "original_title", length = 255)
    private String originalTitle;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(length = 150)
    private String director;

    @Column(columnDefinition = "TEXT")
    private String cast;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_rating", nullable = false, length = 10)
    private AgeRating ageRating;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MovieStatus status = MovieStatus.NOW_SHOWING;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_genres",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
