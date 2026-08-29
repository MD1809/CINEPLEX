package com.cineplex.service.impl;

import com.cineplex.dto.admin.SnackCreateUpdateRequest;
import com.cineplex.dto.snack.SnackResponse;
import com.cineplex.entity.Snack;
import com.cineplex.entity.enums.SnackCategory;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.BookingSnackRepository;
import com.cineplex.repository.SnackRepository;
import com.cineplex.service.SnackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnackServiceImpl implements SnackService {

    private final SnackRepository snackRepository;
    private final BookingSnackRepository bookingSnackRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SnackResponse> getAllAvailableSnacks() {
        return snackRepository.findByIsAvailableTrueAndIsDeletedFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SnackResponse> getSnacksByCategory(SnackCategory category) {
        return snackRepository.findByCategoryAndIsAvailableTrueAndIsDeletedFalse(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SnackResponse> getAllSnacksForAdmin() {
        return snackRepository.findByIsDeletedFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SnackResponse getSnackById(Long id) {
        Snack snack = snackRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bắp/nước/combo", "id", id));
        return mapToResponse(snack);
    }

    @Override
    @Transactional
    public SnackResponse createSnack(SnackCreateUpdateRequest request) {
        Snack snack = Snack.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .isDeleted(false)
                .build();

        Snack saved = snackRepository.save(snack);
        log.info("Created snack ID: {} - '{}'", saved.getId(), saved.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SnackResponse updateSnack(Long id, SnackCreateUpdateRequest request) {
        Snack snack = snackRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bắp/nước/combo", "id", id));

        snack.setName(request.getName());
        snack.setDescription(request.getDescription());
        snack.setPrice(request.getPrice());
        snack.setImageUrl(request.getImageUrl());
        snack.setCategory(request.getCategory());
        if (request.getIsAvailable() != null) {
            snack.setIsAvailable(request.getIsAvailable());
        }

        Snack updated = snackRepository.save(snack);
        log.info("Updated snack ID: {} - '{}'", updated.getId(), updated.getName());
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public SnackResponse updateSnackAvailability(Long id, Boolean isAvailable) {
        Snack snack = snackRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bắp/nước/combo", "id", id));

        snack.setIsAvailable(isAvailable);
        Snack updated = snackRepository.save(snack);
        log.info("Updated snack ID: {} availability to: {}", id, isAvailable);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSnack(Long id) {
        Snack snack = snackRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bắp/nước/combo", "id", id));

        boolean hasBookings = bookingSnackRepository.existsBySnackId(id);
        if (hasBookings) {
            snack.setIsDeleted(true);
            snack.setIsAvailable(false);
            snackRepository.save(snack);
            log.info("Snack ID {} has order history, marked as isDeleted=true (soft delete)", id);
        } else {
            snackRepository.delete(snack);
            snackRepository.flush();
            log.info("Permanently deleted snack ID: {}", id);
        }
    }

    private SnackResponse mapToResponse(Snack snack) {
        return SnackResponse.builder()
                .id(snack.getId())
                .name(snack.getName())
                .description(snack.getDescription())
                .price(snack.getPrice())
                .imageUrl(snack.getImageUrl())
                .category(snack.getCategory())
                .isAvailable(snack.getIsAvailable())
                .build();
    }
}
