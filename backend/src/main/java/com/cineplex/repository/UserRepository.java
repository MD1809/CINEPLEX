package com.cineplex.repository;

import com.cineplex.entity.User;
import com.cineplex.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByOrderByIdDesc();
    List<User> findByRoleOrderByIdDesc(Role role);
    long countByRole(Role role);
    long countByIsActiveTrue();
    long countByIsActiveFalse();

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (u.phoneNumber IS NOT NULL AND u.phoneNumber LIKE CONCAT('%', :search, '%'))) " +
           "ORDER BY u.id DESC")
    List<User> searchUsers(@Param("role") Role role, @Param("search") String search);
}
