package com.smartcourier.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "shipments")
public class Shipment {

    @Id
        private Long id;

    @Indexed(unique = true)
    private String trackingId;

    private String senderName;

    private String senderPhone;

    private String senderAddress;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    private String originName;

    private String destinationName;

    private Double originLat = 40.7128;

    private Double originLng = -74.0060;

    private Double destLat = 40.7484;

    private Double destLng = -73.9857;

    private ShipmentStatus status = ShipmentStatus.PENDING;

    private BigDecimal weightKg = new BigDecimal("1.0");

    private ShipmentPriority priority = ShipmentPriority.STANDARD;

    private LocalDateTime estimatedDelivery;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Shipment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Shipment(String trackingId, String senderName, String senderPhone, String senderAddress,
                    String receiverName, String receiverPhone, String receiverAddress,
                    String originName, String destinationName, Double originLat, Double originLng,
                    Double destLat, Double destLng, ShipmentStatus status, BigDecimal weightKg,
                    ShipmentPriority priority, LocalDateTime estimatedDelivery) {
        this.trackingId = trackingId;
        this.senderName = senderName;
        this.senderPhone = senderPhone;
        this.senderAddress = senderAddress;
        this.receiverName = receiverName;
        this.receiverPhone = receiverPhone;
        this.receiverAddress = receiverAddress;
        this.originName = originName;
        this.destinationName = destinationName;
        this.originLat = originLat != null ? originLat : 40.7128;
        this.originLng = originLng != null ? originLng : -74.0060;
        this.destLat = destLat != null ? destLat : 40.7484;
        this.destLng = destLng != null ? destLng : -73.9857;
        this.status = status != null ? status : ShipmentStatus.PENDING;
        this.weightKg = weightKg != null ? weightKg : new BigDecimal("1.0");
        this.priority = priority != null ? priority : ShipmentPriority.STANDARD;
        this.estimatedDelivery = estimatedDelivery;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderPhone() {
        return senderPhone;
    }

    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }

    public String getSenderAddress() {
        return senderAddress;
    }

    public void setSenderAddress(String senderAddress) {
        this.senderAddress = senderAddress;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getReceiverAddress() {
        return receiverAddress;
    }

    public void setReceiverAddress(String receiverAddress) {
        this.receiverAddress = receiverAddress;
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

    public Double getOriginLat() {
        return originLat;
    }

    public void setOriginLat(Double originLat) {
        this.originLat = originLat;
    }

    public Double getOriginLng() {
        return originLng;
    }

    public void setOriginLng(Double originLng) {
        this.originLng = originLng;
    }

    public Double getDestLat() {
        return destLat;
    }

    public void setDestLat(Double destLat) {
        this.destLat = destLat;
    }

    public Double getDestLng() {
        return destLng;
    }

    public void setDestLng(Double destLng) {
        this.destLng = destLng;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public ShipmentPriority getPriority() {
        return priority;
    }

    public void setPriority(ShipmentPriority priority) {
        this.priority = priority;
    }

    public LocalDateTime getEstimatedDelivery() {
        return estimatedDelivery;
    }

    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) {
        this.estimatedDelivery = estimatedDelivery;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
