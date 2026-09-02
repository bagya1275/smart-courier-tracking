package com.smartcourier.repository;

import com.smartcourier.entity.Shipment;
import com.smartcourier.entity.ShipmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends MongoRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingId(String trackingId);
    List<Shipment> findByStatus(ShipmentStatus status);

    @Query("{ '$or': [" +
           "{ 'trackingId': { '$regex': ?0, '$options': 'i' } }," +
           "{ 'senderName': { '$regex': ?0, '$options': 'i' } }," +
           "{ 'receiverName': { '$regex': ?0, '$options': 'i' } }," +
           "{ 'destinationName': { '$regex': ?0, '$options': 'i' } }" +
           "] }")
    List<Shipment> searchShipments(String query);

    long countByStatus(ShipmentStatus status);

    @Query(value = "{ 'status': 'DELIVERED', 'updatedAt': { '$gte': ?0 } }", count = true)
    long countDeliveredToday(LocalDateTime startOfDay);

    List<Shipment> findTop10ByOrderByCreatedAtDesc();
}
