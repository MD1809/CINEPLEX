package com.cineplex.service;

import com.cineplex.dto.movie.MovieCreateRequest;
import com.cineplex.dto.movie.MovieResponse;
import com.cineplex.dto.movie.MovieUpdateRequest;

import java.util.List;

public interface MovieService {

    List<MovieResponse> getNowShowingMovies();

    List<MovieResponse> getComingSoonMovies();

    List<MovieResponse> getAllMovies();

    MovieResponse getMovieBySlug(String slug);

    MovieResponse getMovieById(Long id);

    MovieResponse createMovie(MovieCreateRequest request);

    MovieResponse updateMovie(Long id, MovieUpdateRequest request);

    MovieResponse updateMovieStatus(Long id, com.cineplex.entity.enums.MovieStatus status);

    void deleteMovie(Long id);
}
