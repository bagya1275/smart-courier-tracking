package com.smartcourier.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;

@Document(collection = "drivers")
public class Driver {

    @Id
        private Long id;

    private Long userId;

    @Indexed(unique = true)
    private String vehicleNumber;

    private String vehicleType;

    private DriverStatus status = DriverStatus.AVAILABLE;

    private BigDecimal rating = new BigDecimal("5.0");

    private Integer totalDeliveries = 0;

    private Integer activeDeliveriesCount = 0;

    private String phone;

    private String zoneName;

    public Driver() {
    }

    public Driver(User user, String vehicleNumber, String vehicleType, DriverStatus status, BigDecimal rating, Integer totalDeliveries, Integer activeDeliveriesCount, String phone, String zoneName) {
        this.userId = user != null ? user.getId() : null;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.status = status != null ? status : DriverStatus.AVAILABLE;
        this.rating = rating != null ? rating : new BigDecimal("5.0");
        this.totalDeliveries = totalDeliveries != null ? totalDeliveries : 0;
        this.activeDeliveriesCount = activeDeliveriesCount != null ? activeDeliveriesCount : 0;
        this.phone = phone;
        this.zoneName = zoneName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public DriverStatus getStatus() {
        return status;
    }

    public void setStatus(DriverStatus status) {
        this.status = status;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getTotalDeliveries() {
        return totalDeliveries;
    }

    public void setTotalDeliveries(Integer totalDeliveries) {
        this.totalDeliveries = totalDeliveries;
    }

    public Integer getActiveDeliveriesCount() {
        return activeDeliveriesCount;
    }

    public void setActiveDeliveriesCount(Integer activeDeliveriesCount) {
        this.activeDeliveriesCount = activeDeliveriesCount;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }
}
