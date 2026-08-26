package com.cineplex.repository;

import com.cineplex.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Integer> {
    Optional<Genre> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
