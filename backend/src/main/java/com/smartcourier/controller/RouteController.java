package com.smartcourier.controller;

import com.smartcourier.dto.ApiResponse;
import com.smartcourier.dto.RouteDTO;
import com.smartcourier.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteDTO>>> getAllRoutes() {
        List<RouteDTO> list = routeService.getAllRoutes();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteDTO>> getRouteById(@PathVariable Long id) {
        RouteDTO dto = routeService.getRouteById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RouteDTO>> createRoute(@Valid @RequestBody RouteDTO dto) {
        RouteDTO created = routeService.createRoute(dto);
        return ResponseEntity.ok(ApiResponse.success("Route created successfully", created));
    }

    @PostMapping("/{id}/optimize")
    public ResponseEntity<ApiResponse<RouteDTO>> optimizeRoute(@PathVariable Long id) {
        RouteDTO optimized = routeService.optimizeRoute(id);
        return ResponseEntity.ok(ApiResponse.success("Route optimized successfully with shortest path algorithm", optimized));
    }
}
