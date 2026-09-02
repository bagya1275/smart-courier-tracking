package com.smartcourier.controller;

import com.smartcourier.dto.ApiResponse;
import com.smartcourier.dto.DriverDTO;
import com.smartcourier.entity.DriverStatus;
import com.smartcourier.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverDTO>>> getAllDrivers() {
        List<DriverDTO> list = driverService.getAllDrivers();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverDTO>> getDriverById(@PathVariable Long id) {
        DriverDTO dto = driverService.getDriverById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DriverDTO>> getDriverByUserId(@PathVariable Long userId) {
        DriverDTO dto = driverService.getDriverByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DriverDTO>> createDriver(@Valid @RequestBody DriverDTO dto) {
        DriverDTO created = driverService.createDriver(dto);
        return ResponseEntity.ok(ApiResponse.success("Driver added successfully", created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DriverDTO>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        DriverStatus status = DriverStatus.valueOf(payload.get("status").toUpperCase());
        DriverDTO updated = driverService.updateDriverStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Driver status updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(ApiResponse.success("Driver deleted successfully", null));
    }
}
