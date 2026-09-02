package com.smartcourier.service;

import com.smartcourier.dto.DeliveryDTO;
import com.smartcourier.entity.*;
import com.smartcourier.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<DeliveryDTO> getAllDeliveries() {
        return deliveryRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DeliveryDTO> getDeliveriesByDriver(Long driverId) {
        return deliveryRepository.findByDriverId(driverId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DeliveryDTO getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found with ID: " + id));
        return toDTO(delivery);
    }

    public DeliveryDTO assignDelivery(DeliveryDTO dto) {
        Shipment shipment = shipmentRepository.findById(dto.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + dto.getShipmentId()));

        Delivery delivery = deliveryRepository.findByShipmentId(shipment.getId())
                .orElse(new Delivery());

        delivery.setShipmentId(shipment.getId());
        delivery.setDeliveryStatus(dto.getDeliveryStatus() != null ? dto.getDeliveryStatus() : DeliveryStatus.ASSIGNED);
        delivery.setNotes(dto.getNotes());

        if (dto.getDriverId() != null) {
            Driver driver = driverRepository.findById(dto.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + dto.getDriverId()));
            delivery.setDriverId(driver.getId());
            driver.setStatus(DriverStatus.ON_ROUTE);
            driver.setActiveDeliveriesCount(driver.getActiveDeliveriesCount() + 1);
            driverRepository.save(driver);
        }

        if (dto.getRouteId() != null) {
            Route route = routeRepository.findById(dto.getRouteId()).orElse(null);
            delivery.setRouteId(route != null ? route.getId() : null);
        }

        Delivery saved = deliveryRepository.save(delivery);
        return toDTO(saved);
    }

    public DeliveryDTO updateDeliveryStatus(Long id, DeliveryStatus newStatus, String notes, String signature) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found with ID: " + id));

        delivery.setDeliveryStatus(newStatus);
        if (notes != null) {
            delivery.setNotes(notes);
        }
        if (signature != null) {
            delivery.setRecipientSignature(signature);
        }

        Shipment shipment = delivery.getShipmentId() != null ? shipmentRepository.findById(delivery.getShipmentId()).orElse(null) : null;
        if (shipment != null) {
            if (newStatus == DeliveryStatus.DELIVERED) {
                delivery.setDeliveredAt(LocalDateTime.now());
                shipment.setStatus(ShipmentStatus.DELIVERED);
                shipment.setUpdatedAt(LocalDateTime.now());

                Driver driver = delivery.getDriverId() != null ? driverRepository.findById(delivery.getDriverId()).orElse(null) : null;
                if (driver != null) {
                    driver.setTotalDeliveries(driver.getTotalDeliveries() + 1);
                    driver.setActiveDeliveriesCount(Math.max(0, driver.getActiveDeliveriesCount() - 1));
                    if (driver.getActiveDeliveriesCount() == 0) {
                        driver.setStatus(DriverStatus.AVAILABLE);
                    }
                    driverRepository.save(driver);
                }
            } else if (newStatus == DeliveryStatus.OUT_FOR_DELIVERY || newStatus == DeliveryStatus.PICKED_UP) {
                shipment.setStatus(ShipmentStatus.IN_TRANSIT);
                shipment.setUpdatedAt(LocalDateTime.now());
            }
            shipmentRepository.save(shipment);
        }

        Delivery saved = deliveryRepository.save(delivery);
        return toDTO(saved);
    }

    private DeliveryDTO toDTO(Delivery delivery) {
        DeliveryDTO dto = new DeliveryDTO();
        dto.setId(delivery.getId());
        if (delivery.getShipmentId() != null) {
            shipmentRepository.findById(delivery.getShipmentId()).ifPresent(shipment -> {
                dto.setShipmentId(shipment.getId());
                dto.setTrackingId(shipment.getTrackingId());
                dto.setSenderName(shipment.getSenderName());
                dto.setReceiverName(shipment.getReceiverName());
                dto.setDestinationAddress(shipment.getReceiverAddress());
            });
        }
        if (delivery.getDriverId() != null) {
            driverRepository.findById(delivery.getDriverId()).ifPresent(driver -> {
                dto.setDriverId(driver.getId());
                String driverName = "Assigned Driver";
                if (driver.getUserId() != null) {
                    driverName = userRepository.findById(driver.getUserId())
                            .map(User::getFullName)
                            .orElse(driverName);
                }
                dto.setDriverName(driverName);
                dto.setDriverVehicle(driver.getVehicleNumber());
            });
        }
        if (delivery.getRouteId() != null) {
            routeRepository.findById(delivery.getRouteId()).ifPresent(route -> {
                dto.setRouteId(route.getId());
                dto.setRouteCode(route.getRouteCode());
            });
        }
        dto.setDeliveryStatus(delivery.getDeliveryStatus());
        dto.setAssignedAt(delivery.getAssignedAt());
        dto.setDeliveredAt(delivery.getDeliveredAt());
        dto.setRecipientSignature(delivery.getRecipientSignature());
        dto.setNotes(delivery.getNotes());
        return dto;
    }
}
