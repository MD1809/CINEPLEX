package com.cineplex.service;

import com.cineplex.dto.movie.GenreResponse;

import java.util.List;

public interface GenreService {
    List<GenreResponse> getAllGenres();
}
