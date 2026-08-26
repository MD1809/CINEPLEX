package com.cineplex.repository;

import com.cineplex.entity.Snack;
import com.cineplex.entity.enums.SnackCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SnackRepository extends JpaRepository<Snack, Long> {
    List<Snack> findByIsAvailableTrue();
    List<Snack> findByCategoryAndIsAvailableTrue(SnackCategory category);
}
