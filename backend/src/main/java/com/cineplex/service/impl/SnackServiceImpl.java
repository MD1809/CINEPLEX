package com.cineplex.service.impl;

import com.cineplex.dto.snack.SnackResponse;
import com.cineplex.entity.Snack;
import com.cineplex.entity.enums.SnackCategory;
import com.cineplex.repository.SnackRepository;
import com.cineplex.service.SnackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SnackServiceImpl implements SnackService {

    private final SnackRepository snackRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SnackResponse> getAllAvailableSnacks() {
        return snackRepository.findByIsAvailableTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SnackResponse> getSnacksByCategory(SnackCategory category) {
        return snackRepository.findByCategoryAndIsAvailableTrue(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
