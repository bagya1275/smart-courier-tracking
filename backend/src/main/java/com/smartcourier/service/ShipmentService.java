package com.smartcourier.service;

import com.smartcourier.dto.ShipmentDTO;
import com.smartcourier.entity.*;
import com.smartcourier.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ShipmentDTO> getAllShipments() {
        return shipmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ShipmentDTO> getShipmentsByStatus(ShipmentStatus status) {
        return shipmentRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ShipmentDTO> searchShipments(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllShipments();
        }
        return shipmentRepository.searchShipments(query.trim()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ShipmentDTO getShipmentById(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + id));
        return toDTO(shipment);
    }

    public ShipmentDTO getShipmentByTrackingId(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("No shipment found for tracking ID: " + trackingId));
        return toDTO(shipment);
    }

    public ShipmentDTO createShipment(ShipmentDTO dto) {
        String trackingId = dto.getTrackingId();
        if (trackingId == null || trackingId.trim().isEmpty()) {
            trackingId = generateTrackingId();
        }

        Shipment shipment = new Shipment();
        shipment.setTrackingId(trackingId);
        shipment.setSenderName(dto.getSenderName());
        shipment.setSenderPhone(dto.getSenderPhone());
        shipment.setSenderAddress(dto.getSenderAddress());
        shipment.setReceiverName(dto.getReceiverName());
        shipment.setReceiverPhone(dto.getReceiverPhone());
        shipment.setReceiverAddress(dto.getReceiverAddress());
        shipment.setOriginName(dto.getOriginName() != null ? dto.getOriginName() : "Central Depot Alpha");
        shipment.setDestinationName(dto.getDestinationName());
        shipment.setOriginLat(dto.getOriginLat() != null ? dto.getOriginLat() : 40.7128);
        shipment.setOriginLng(dto.getOriginLng() != null ? dto.getOriginLng() : -74.0060);
        shipment.setDestLat(dto.getDestLat() != null ? dto.getDestLat() : 40.7484 + (Math.random() - 0.5) * 0.05);
        shipment.setDestLng(dto.getDestLng() != null ? dto.getDestLng() : -73.9857 + (Math.random() - 0.5) * 0.05);
        shipment.setStatus(dto.getStatus() != null ? dto.getStatus() : ShipmentStatus.PENDING);
        shipment.setWeightKg(dto.getWeightKg() != null ? dto.getWeightKg() : new java.math.BigDecimal("1.0"));
        shipment.setPriority(dto.getPriority() != null ? dto.getPriority() : ShipmentPriority.STANDARD);
        shipment.setEstimatedDelivery(dto.getEstimatedDelivery() != null ? dto.getEstimatedDelivery() : LocalDateTime.now().plusHours(4));

        Shipment savedShipment = shipmentRepository.save(shipment);

        // Auto-assign delivery if driver specified
        Delivery delivery = new Delivery();
        delivery.setShipmentId(savedShipment.getId());
        delivery.setDeliveryStatus(DeliveryStatus.ASSIGNED);
        delivery.setNotes("New dispatch created.");

        if (dto.getAssignedDriverId() != null) {
            Driver driver = driverRepository.findById(dto.getAssignedDriverId()).orElse(null);
            if (driver != null) {
                delivery.setDriverId(driver.getId());
                driver.setActiveDeliveriesCount(driver.getActiveDeliveriesCount() + 1);
                driver.setStatus(DriverStatus.ON_ROUTE);
                driverRepository.save(driver);
            }
        }

        if (dto.getRouteId() != null) {
            Route route = routeRepository.findById(dto.getRouteId()).orElse(null);
            delivery.setRouteId(route != null ? route.getId() : null);
        }

        deliveryRepository.save(delivery);

        return toDTO(savedShipment);
    }

    public ShipmentDTO updateShipmentStatus(Long id, ShipmentStatus newStatus) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + id));

        shipment.setStatus(newStatus);
        shipment.setUpdatedAt(LocalDateTime.now());
        Shipment saved = shipmentRepository.save(shipment);

        // Synchronize delivery record
        Optional<Delivery> deliveryOpt = deliveryRepository.findByShipmentId(shipment.getId());
        if (deliveryOpt.isPresent()) {
            Delivery delivery = deliveryOpt.get();
            if (newStatus == ShipmentStatus.DELIVERED) {
                delivery.setDeliveryStatus(DeliveryStatus.DELIVERED);
                delivery.setDeliveredAt(LocalDateTime.now());
                if (delivery.getDriverId() != null) {
                    Driver driver = driverRepository.findById(delivery.getDriverId()).orElse(null);
                    if (driver != null) {
                        driver.setTotalDeliveries(driver.getTotalDeliveries() + 1);
                        driver.setActiveDeliveriesCount(Math.max(0, driver.getActiveDeliveriesCount() - 1));
                        if (driver.getActiveDeliveriesCount() == 0) {
                            driver.setStatus(DriverStatus.AVAILABLE);
                        }
                        driverRepository.save(driver);
                    }
                }
            } else if (newStatus == ShipmentStatus.IN_TRANSIT) {
                delivery.setDeliveryStatus(DeliveryStatus.OUT_FOR_DELIVERY);
            }
            deliveryRepository.save(delivery);
        }

        return toDTO(saved);
    }

    public void deleteShipment(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new RuntimeException("Shipment not found with ID: " + id);
        }
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + id));
        deliveryRepository.findByShipmentId(shipment.getId()).ifPresent(deliveryRepository::delete);
        shipmentRepository.delete(shipment);
    }

    public String generateTrackingId() {
        int year = Year.now().getValue();
        int randomCode = 1000 + new Random().nextInt(9000);
        String candidate = "TRK-" + year + "-" + randomCode;
        while (shipmentRepository.findByTrackingId(candidate).isPresent()) {
            randomCode = 1000 + new Random().nextInt(9000);
            candidate = "TRK-" + year + "-" + randomCode;
        }
        return candidate;
    }

    private ShipmentDTO toDTO(Shipment shipment) {
        ShipmentDTO dto = new ShipmentDTO();
        dto.setId(shipment.getId());
        dto.setTrackingId(shipment.getTrackingId());
        dto.setSenderName(shipment.getSenderName());
        dto.setSenderPhone(shipment.getSenderPhone());
        dto.setSenderAddress(shipment.getSenderAddress());
        dto.setReceiverName(shipment.getReceiverName());
        dto.setReceiverPhone(shipment.getReceiverPhone());
        dto.setReceiverAddress(shipment.getReceiverAddress());
        dto.setOriginName(shipment.getOriginName());
        dto.setDestinationName(shipment.getDestinationName());
        dto.setOriginLat(shipment.getOriginLat());
        dto.setOriginLng(shipment.getOriginLng());
        dto.setDestLat(shipment.getDestLat());
        dto.setDestLng(shipment.getDestLng());
        dto.setStatus(shipment.getStatus());
        dto.setWeightKg(shipment.getWeightKg());
        dto.setPriority(shipment.getPriority());
        dto.setEstimatedDelivery(shipment.getEstimatedDelivery());
        dto.setCreatedAt(shipment.getCreatedAt());
        dto.setUpdatedAt(shipment.getUpdatedAt());

        Optional<Delivery> deliveryOpt = deliveryRepository.findByShipmentId(shipment.getId());
        if (deliveryOpt.isPresent()) {
            Delivery delivery = deliveryOpt.get();
            dto.setDeliveryStatus(delivery.getDeliveryStatus().name());
            if (delivery.getDriverId() != null) {
                driverRepository.findById(delivery.getDriverId()).ifPresent(driver -> {
                    dto.setAssignedDriverId(driver.getId());
                    String driverName = "Assigned Courier";
                    if (driver.getUserId() != null) {
                        driverName = userRepository.findById(driver.getUserId())
                                .map(User::getFullName)
                                .orElse(driverName);
                    }
                    dto.setAssignedDriverName(driverName);
                    dto.setAssignedDriverVehicle(driver.getVehicleNumber());
                });
            }
            if (delivery.getRouteId() != null) {
                routeRepository.findById(delivery.getRouteId()).ifPresent(route -> {
                    dto.setRouteId(route.getId());
                    dto.setRouteCode(route.getRouteCode());
                });
            }
        }

        return dto;
    }
}
