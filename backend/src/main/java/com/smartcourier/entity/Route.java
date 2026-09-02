package com.smartcourier.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "routes")
public class Route {

    @Id
        private Long id;

    @Indexed(unique = true)
    private String routeCode;

    private String originName;

    private String destinationName;

    private String waypointsJson;

    private BigDecimal totalDistanceKm = new BigDecimal("0.0");

    private Integer estimatedDurationMin = 0;

    private RouteStatus status = RouteStatus.OPTIMAL;

    private LocalDateTime createdAt;

    public Route() {
        this.createdAt = LocalDateTime.now();
    }

    public Route(String routeCode, String originName, String destinationName, String waypointsJson, BigDecimal totalDistanceKm, Integer estimatedDurationMin, RouteStatus status) {
        this.routeCode = routeCode;
        this.originName = originName;
        this.destinationName = destinationName;
        this.waypointsJson = waypointsJson;
        this.totalDistanceKm = totalDistanceKm != null ? totalDistanceKm : new BigDecimal("0.0");
        this.estimatedDurationMin = estimatedDurationMin != null ? estimatedDurationMin : 0;
        this.status = status != null ? status : RouteStatus.OPTIMAL;
        this.createdAt = LocalDateTime.now();
    }

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
}
