package com.smartcourier.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "deliveries")
public class Delivery {

    @Id
        private Long id;

    private Long shipmentId;

    private Long driverId;

    private Long routeId;

    private DeliveryStatus deliveryStatus = DeliveryStatus.ASSIGNED;

    private LocalDateTime assignedAt;

    private LocalDateTime deliveredAt;

    private String recipientSignature;

    private String notes;

    public Delivery() {
        this.assignedAt = LocalDateTime.now();
    }

    public Delivery(Shipment shipment, Driver driver, Route route, DeliveryStatus deliveryStatus, String notes) {
        this.shipmentId = shipment != null ? shipment.getId() : null;
        this.driverId = driver != null ? driver.getId() : null;
        this.routeId = route != null ? route.getId() : null;
        this.deliveryStatus = deliveryStatus != null ? deliveryStatus : DeliveryStatus.ASSIGNED;
        this.assignedAt = LocalDateTime.now();
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getRouteId() {
        return routeId;
    }

    public void setRouteId(Long routeId) {
        this.routeId = routeId;
    }

    public DeliveryStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(DeliveryStatus deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getRecipientSignature() {
        return recipientSignature;
    }

    public void setRecipientSignature(String recipientSignature) {
        this.recipientSignature = recipientSignature;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
