package com.smartcourier.repository;

import com.smartcourier.entity.Driver;
import com.smartcourier.entity.DriverStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends MongoRepository<Driver, Long> {
    Optional<Driver> findByUserId(Long userId);
    Optional<Driver> findByVehicleNumber(String vehicleNumber);
    List<Driver> findByStatus(DriverStatus status);
    long countByStatus(DriverStatus status);
}
