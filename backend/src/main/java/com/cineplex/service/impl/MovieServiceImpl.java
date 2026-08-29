package com.cineplex.service.impl;

import com.cineplex.dto.movie.MovieCreateRequest;
import com.cineplex.dto.movie.MovieResponse;
import com.cineplex.dto.movie.MovieUpdateRequest;
import com.cineplex.entity.Genre;
import com.cineplex.entity.Movie;
import com.cineplex.entity.enums.MovieStatus;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.GenreRepository;
import com.cineplex.repository.MovieRepository;
import com.cineplex.service.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getNowShowingMovies() {
        return movieRepository.findByStatus(MovieStatus.NOW_SHOWING).stream()
                .map(MovieResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getComingSoonMovies() {
        return movieRepository.findByStatus(MovieStatus.COMING_SOON).stream()
                .map(MovieResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(MovieResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieBySlug(String slug) {
        Movie movie = movieRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "slug", slug));
        return MovieResponse.fromEntity(movie);
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));
        return MovieResponse.fromEntity(movie);
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieCreateRequest request) {
        if (movieRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug phim đã tồn tại: " + request.getSlug());
        }

        Set<Genre> genres = new HashSet<>();
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            genres.addAll(genreRepository.findAllById(request.getGenreIds()));
        }

        Movie movie = Movie.builder()
                .title(request.getTitle().trim())
                .originalTitle(request.getOriginalTitle() != null ? request.getOriginalTitle().trim() : null)
                .slug(request.getSlug().trim().toLowerCase())
                .director(request.getDirector() != null ? request.getDirector().trim() : null)
                .cast(request.getCast())
                .synopsis(request.getSynopsis())
                .durationMinutes(request.getDurationMinutes())
                .releaseDate(request.getReleaseDate())
                .endDate(request.getEndDate())
                .ageRating(request.getAgeRating())
                .posterUrl(request.getPosterUrl())
                .bannerUrl(request.getBannerUrl())
                .trailerUrl(request.getTrailerUrl())
                .status(request.getStatus())
                .genres(genres)
                .build();

        Movie savedMovie = movieRepository.save(movie);
        log.info("Created new movie: {} (ID: {})", savedMovie.getTitle(), savedMovie.getId());
        return MovieResponse.fromEntity(savedMovie);
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(Long id, MovieUpdateRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));

        if (!movie.getSlug().equalsIgnoreCase(request.getSlug()) && movieRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug phim đã tồn tại: " + request.getSlug());
        }

        Set<Genre> genres = new HashSet<>();
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            genres.addAll(genreRepository.findAllById(request.getGenreIds()));
        }

        movie.setTitle(request.getTitle().trim());
        movie.setOriginalTitle(request.getOriginalTitle() != null ? request.getOriginalTitle().trim() : null);
        movie.setSlug(request.getSlug().trim().toLowerCase());
        movie.setDirector(request.getDirector() != null ? request.getDirector().trim() : null);
        movie.setCast(request.getCast());
        movie.setSynopsis(request.getSynopsis());
        movie.setDurationMinutes(request.getDurationMinutes());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setEndDate(request.getEndDate());
        movie.setAgeRating(request.getAgeRating());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setBannerUrl(request.getBannerUrl());
        movie.setTrailerUrl(request.getTrailerUrl());
        movie.setStatus(request.getStatus());
        movie.setGenres(genres);

        Movie updatedMovie = movieRepository.save(movie);
        log.info("Updated movie: {} (ID: {})", updatedMovie.getTitle(), updatedMovie.getId());
        return MovieResponse.fromEntity(updatedMovie);
    }

    @Override
    @Transactional
    public MovieResponse updateMovieStatus(Long id, com.cineplex.entity.enums.MovieStatus status) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));

        movie.setStatus(status);
        Movie updatedMovie = movieRepository.save(movie);
        log.info("Updated status for movie ID {}: {}", id, status);
        return MovieResponse.fromEntity(updatedMovie);
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));

        movieRepository.delete(movie);
        log.info("Deleted movie: {} (ID: {})", movie.getTitle(), id);
    }
}
