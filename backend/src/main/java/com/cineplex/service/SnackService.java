package com.cineplex.service;

import com.cineplex.dto.admin.SnackCreateUpdateRequest;
import com.cineplex.dto.snack.SnackResponse;
import com.cineplex.entity.enums.SnackCategory;

import java.util.List;

public interface SnackService {
    List<SnackResponse> getAllAvailableSnacks();
    List<SnackResponse> getSnacksByCategory(SnackCategory category);
    List<SnackResponse> getAllSnacksForAdmin();
    SnackResponse getSnackById(Long id);
    SnackResponse createSnack(SnackCreateUpdateRequest request);
    SnackResponse updateSnack(Long id, SnackCreateUpdateRequest request);
    SnackResponse updateSnackAvailability(Long id, Boolean isAvailable);
    void deleteSnack(Long id);
}
