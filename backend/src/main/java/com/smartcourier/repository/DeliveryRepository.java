package com.smartcourier.repository;

import com.smartcourier.entity.Delivery;
import com.smartcourier.entity.DeliveryStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends MongoRepository<Delivery, Long> {
    Optional<Delivery> findByShipmentId(Long shipmentId);
    List<Delivery> findByDriverId(Long driverId);
    List<Delivery> findByRouteId(Long routeId);
    List<Delivery> findByDeliveryStatus(DeliveryStatus status);
}
