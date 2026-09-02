package com.smartcourier.dto;

import com.smartcourier.entity.RouteStatus;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RouteDTO {
    private Long id;

    @NotBlank(message = "Route code is required")
    private String routeCode;

    @NotBlank(message = "Origin name is required")
    private String originName;

    @NotBlank(message = "Destination name is required")
    private String destinationName;

    private String waypointsJson;
    private BigDecimal totalDistanceKm = new BigDecimal("0.0");
    private Integer estimatedDurationMin = 0;
    private RouteStatus status = RouteStatus.OPTIMAL;
    private LocalDateTime createdAt;
    private Integer activeDeliveriesCount;

    public RouteDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRouteCode() {
        return routeCode;
    }

    public void setRouteCode(String routeCode) {
        this.routeCode = routeCode;
    }

    public String getOriginName() {
        return originName;
    }

    public void setOriginName(String originName) {
        this.originName = originName;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public String getWaypointsJson() {
        return waypointsJson;
    }

    public void setWaypointsJson(String waypointsJson) {
        this.waypointsJson = waypointsJson;
    }

    public BigDecimal getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(BigDecimal totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public Integer getEstimatedDurationMin() {
        return estimatedDurationMin;
    }

    public void setEstimatedDurationMin(Integer estimatedDurationMin) {
        this.estimatedDurationMin = estimatedDurationMin;
    }

    public RouteStatus getStatus() {
        return status;
    }

    public void setStatus(RouteStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getActiveDeliveriesCount() {
        return activeDeliveriesCount;
    }

    public void setActiveDeliveriesCount(Integer activeDeliveriesCount) {
        this.activeDeliveriesCount = activeDeliveriesCount;
    }
}
