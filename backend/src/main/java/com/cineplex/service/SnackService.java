package com.cineplex.service;

import com.cineplex.dto.snack.SnackResponse;
import com.cineplex.entity.enums.SnackCategory;

import java.util.List;

public interface SnackService {
    List<SnackResponse> getAllAvailableSnacks();
    List<SnackResponse> getSnacksByCategory(SnackCategory category);
}
