package com.smartcourier.controller;

import com.smartcourier.dto.ApiResponse;
import com.smartcourier.dto.DeliveryDTO;
import com.smartcourier.entity.DeliveryStatus;
import com.smartcourier.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryDTO>>> getAllDeliveries() {
        List<DeliveryDTO> list = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryDTO>> getDeliveryById(@PathVariable Long id) {
        DeliveryDTO dto = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse<List<DeliveryDTO>>> getDeliveriesByDriver(@PathVariable Long driverId) {
        List<DeliveryDTO> list = deliveryService.getDeliveriesByDriver(driverId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<DeliveryDTO>> assignDelivery(@Valid @RequestBody DeliveryDTO dto) {
        DeliveryDTO assigned = deliveryService.assignDelivery(dto);
        return ResponseEntity.ok(ApiResponse.success("Delivery assigned successfully", assigned));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DeliveryDTO>> updateDeliveryStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        DeliveryStatus status = DeliveryStatus.valueOf(payload.get("status").toUpperCase());
        String notes = payload.get("notes");
        String signature = payload.get("signature");

        DeliveryDTO updated = deliveryService.updateDeliveryStatus(id, status, notes, signature);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated", updated));
    }
}
