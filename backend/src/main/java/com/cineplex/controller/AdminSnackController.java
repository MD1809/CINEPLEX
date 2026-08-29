package com.cineplex.controller;

import com.cineplex.dto.admin.SnackCreateUpdateRequest;
import com.cineplex.dto.common.ApiResponse;
import com.cineplex.dto.snack.SnackResponse;
import com.cineplex.service.SnackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/snacks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Snacks", description = "Các API quản lý Bắp nước & Combo (F&B) dành cho Quản trị viên")
public class AdminSnackController {

    private final SnackService snackService;

    @GetMapping
    @Operation(summary = "Lấy tất cả danh mục bắp nước & combo (kể cả món ngừng kinh doanh)")
    public ResponseEntity<ApiResponse<List<SnackResponse>>> getAllSnacksForAdmin() {
        List<SnackResponse> snacks = snackService.getAllSnacksForAdmin();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách bắp nước quản trị thành công", snacks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một món bắp nước")
    public ResponseEntity<ApiResponse<SnackResponse>> getSnackById(@PathVariable Long id) {
        SnackResponse snack = snackService.getSnackById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin món thành công", snack));
    }

    @PostMapping
    @Operation(summary = "Tạo món bắp nước / combo mới")
    public ResponseEntity<ApiResponse<SnackResponse>> createSnack(
            @Valid @RequestBody SnackCreateUpdateRequest request) {
        SnackResponse created = snackService.createSnack(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo món mới thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin món bắp nước")
    public ResponseEntity<ApiResponse<SnackResponse>> updateSnack(
            @PathVariable Long id,
            @Valid @RequestBody SnackCreateUpdateRequest request) {
        SnackResponse updated = snackService.updateSnack(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật món thành công", updated));
    }

    @PatchMapping("/{id}/availability")
    @Operation(summary = "Bật / tắt trạng thái Còn hàng (Available)")
    public ResponseEntity<ApiResponse<SnackResponse>> toggleAvailability(
            @PathVariable Long id,
            @RequestParam Boolean isAvailable) {
        SnackResponse updated = snackService.updateSnackAvailability(id, isAvailable);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái kinh doanh thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa món bắp nước")
    public ResponseEntity<ApiResponse<Void>> deleteSnack(@PathVariable Long id) {
        snackService.deleteSnack(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa món thành công", null));
    }
}
