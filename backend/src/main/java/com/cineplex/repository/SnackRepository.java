package com.cineplex.repository;

import com.cineplex.entity.Snack;
import com.cineplex.entity.enums.SnackCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SnackRepository extends JpaRepository<Snack, Long> {
    List<Snack> findByIsDeletedFalse();
    List<Snack> findByIsAvailableTrueAndIsDeletedFalse();
    List<Snack> findByCategoryAndIsAvailableTrueAndIsDeletedFalse(SnackCategory category);
    Optional<Snack> findByIdAndIsDeletedFalse(Long id);
}
