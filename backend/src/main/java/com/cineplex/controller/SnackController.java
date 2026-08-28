package com.cineplex.controller;

import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.snack.SnackResponse;
import com.cineplex.entity.enums.SnackCategory;
import com.cineplex.service.SnackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/snacks")
@RequiredArgsConstructor
public class SnackController {

    private final SnackService snackService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SnackResponse>>> getAvailableSnacks(
            @RequestParam(required = false) SnackCategory category
    ) {
        List<SnackResponse> snacks = (category != null)
                ? snackService.getSnacksByCategory(category)
                : snackService.getAllAvailableSnacks();

        return ResponseEntity.ok(ApiResponse.<List<SnackResponse>>builder()
                .success(true)
                .statusCode(HttpStatus.OK.value())
                .message("Lấy danh sách bắp nước thành công")
                .data(snacks)
                .build());
    }
}
