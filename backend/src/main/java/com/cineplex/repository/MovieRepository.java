package com.cineplex.repository;

import com.cineplex.entity.Movie;
import com.cineplex.entity.enums.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findBySlug(String slug);
    List<Movie> findByStatus(MovieStatus status);
    boolean existsBySlug(String slug);
}
