package com.cineplex.service.impl;

import com.cineplex.dto.movie.GenreResponse;
import com.cineplex.repository.GenreRepository;
import com.cineplex.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(GenreResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
