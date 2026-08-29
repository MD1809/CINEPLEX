package com.cineplex.repository;

import com.cineplex.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByIsDeletedFalseOrderByIdDesc();
    List<Voucher> findByIsActiveTrueAndIsDeletedFalse();
    Optional<Voucher> findByCode(String code);
    Optional<Voucher> findByCodeAndIsActiveTrue(String code);
    Optional<Voucher> findByCodeAndIsDeletedFalse(String code);
    Optional<Voucher> findByCodeAndIsActiveTrueAndIsDeletedFalse(String code);
    Optional<Voucher> findByIdAndIsDeletedFalse(Long id);
    boolean existsByCodeIgnoreCaseAndIsDeletedFalse(String code);
    boolean existsByCodeIgnoreCaseAndIdNotAndIsDeletedFalse(String code, Long id);
}
