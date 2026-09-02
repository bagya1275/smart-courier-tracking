package com.smartcourier.controller;

import com.smartcourier.dto.ApiResponse;
import com.smartcourier.dto.ShipmentDTO;
import com.smartcourier.entity.ShipmentStatus;
import com.smartcourier.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShipmentDTO>>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) String search
    ) {
        List<ShipmentDTO> list;
        if (search != null && !search.trim().isEmpty()) {
            list = shipmentService.searchShipments(search);
        } else if (status != null) {
            list = shipmentService.getShipmentsByStatus(status);
        } else {
            list = shipmentService.getAllShipments();
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentDTO>> getShipmentById(@PathVariable Long id) {
        ShipmentDTO dto = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<ApiResponse<ShipmentDTO>> trackShipment(@PathVariable String trackingId) {
        ShipmentDTO dto = shipmentService.getShipmentByTrackingId(trackingId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/generate-tracking-id")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateTrackingId() {
        String trackingId = shipmentService.generateTrackingId();
        return ResponseEntity.ok(ApiResponse.success(Map.of("trackingId", trackingId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentDTO>> createShipment(@Valid @RequestBody ShipmentDTO dto) {
        ShipmentDTO created = shipmentService.createShipment(dto);
        return ResponseEntity.ok(ApiResponse.success("Shipment created successfully", created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ShipmentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        ShipmentStatus status = ShipmentStatus.valueOf(payload.get("status").toUpperCase());
        ShipmentDTO updated = shipmentService.updateShipmentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.ok(ApiResponse.success("Shipment deleted successfully", null));
    }
}
