package com.smartcourier.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalShipments;
    private long inTransitShipments;
    private long deliveredToday;
    private long activeCouriers;
    private long pendingShipments;
    private long delayedShipments;
    private double onTimeDeliveryRate;
    private List<Map<String, Object>> weeklyVolume;
    private List<Map<String, Object>> recentActivity;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long totalShipments, long inTransitShipments, long deliveredToday, long activeCouriers,
                             long pendingShipments, long delayedShipments, double onTimeDeliveryRate,
                             List<Map<String, Object>> weeklyVolume, List<Map<String, Object>> recentActivity) {
        this.totalShipments = totalShipments;
        this.inTransitShipments = inTransitShipments;
        this.deliveredToday = deliveredToday;
        this.activeCouriers = activeCouriers;
        this.pendingShipments = pendingShipments;
        this.delayedShipments = delayedShipments;
        this.onTimeDeliveryRate = onTimeDeliveryRate;
        this.weeklyVolume = weeklyVolume;
        this.recentActivity = recentActivity;
    }

    // Getters and Setters
    public long getTotalShipments() {
        return totalShipments;
    }

    public void setTotalShipments(long totalShipments) {
        this.totalShipments = totalShipments;
    }

    public long getInTransitShipments() {
        return inTransitShipments;
    }

    public void setInTransitShipments(long inTransitShipments) {
        this.inTransitShipments = inTransitShipments;
    }

    public long getDeliveredToday() {
        return deliveredToday;
    }

    public void setDeliveredToday(long deliveredToday) {
        this.deliveredToday = deliveredToday;
    }

    public long getActiveCouriers() {
        return activeCouriers;
    }

    public void setActiveCouriers(long activeCouriers) {
        this.activeCouriers = activeCouriers;
    }

    public long getPendingShipments() {
        return pendingShipments;
    }

    public void setPendingShipments(long pendingShipments) {
        this.pendingShipments = pendingShipments;
    }

    public long getDelayedShipments() {
        return delayedShipments;
    }

    public void setDelayedShipments(long delayedShipments) {
        this.delayedShipments = delayedShipments;
    }

    public double getOnTimeDeliveryRate() {
        return onTimeDeliveryRate;
    }

    public void setOnTimeDeliveryRate(double onTimeDeliveryRate) {
        this.onTimeDeliveryRate = onTimeDeliveryRate;
    }

    public List<Map<String, Object>> getWeeklyVolume() {
        return weeklyVolume;
    }

    public void setWeeklyVolume(List<Map<String, Object>> weeklyVolume) {
        this.weeklyVolume = weeklyVolume;
    }

    public List<Map<String, Object>> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<Map<String, Object>> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
