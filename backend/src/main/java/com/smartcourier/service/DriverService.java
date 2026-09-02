package com.smartcourier.service;

import com.smartcourier.dto.DriverDTO;
import com.smartcourier.entity.Driver;
import com.smartcourier.entity.DriverStatus;
import com.smartcourier.entity.Role;
import com.smartcourier.entity.User;
import com.smartcourier.repository.DriverRepository;
import com.smartcourier.repository.DeliveryRepository;
import com.smartcourier.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DriverDTO getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
        return toDTO(driver);
    }

    public DriverDTO getDriverByUserId(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found for user ID: " + userId));
        return toDTO(driver);
    }

    public DriverDTO createDriver(DriverDTO dto) {
        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId()).orElse(null);
        } else if (dto.getEmail() != null) {
            String username = "driver_" + System.currentTimeMillis() % 10000;
            user = new User(
                    username,
                    dto.getEmail(),
                    passwordEncoder.encode("driver123"),
                    dto.getFullName() != null ? dto.getFullName() : "Courier Agent",
                    Role.ROLE_DRIVER,
                    dto.getPhone()
            );
            user = userRepository.save(user);
        }

        Driver driver = new Driver();
        driver.setUserId(user != null ? user.getId() : null);
        driver.setVehicleNumber(dto.getVehicleNumber());
        driver.setVehicleType(dto.getVehicleType());
        driver.setStatus(dto.getStatus() != null ? dto.getStatus() : DriverStatus.AVAILABLE);
        driver.setRating(dto.getRating() != null ? dto.getRating() : new BigDecimal("5.0"));
        driver.setTotalDeliveries(0);
        driver.setActiveDeliveriesCount(0);
        driver.setPhone(dto.getPhone());
        driver.setZoneName(dto.getZoneName() != null ? dto.getZoneName() : "Metro Central");

        Driver saved = driverRepository.save(driver);
        return toDTO(saved);
    }

    public DriverDTO updateDriverStatus(Long id, DriverStatus status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
        driver.setStatus(status);
        Driver saved = driverRepository.save(driver);
        return toDTO(saved);
    }

    public void deleteDriver(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new RuntimeException("Driver not found with ID: " + id);
        }
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
        deliveryRepository.findByDriverId(driver.getId()).forEach(delivery -> {
            delivery.setDriverId(null);
            deliveryRepository.save(delivery);
        });
        driverRepository.delete(driver);
    }

    private DriverDTO toDTO(Driver driver) {
        DriverDTO dto = new DriverDTO();
        dto.setId(driver.getId());
        if (driver.getUserId() != null) {
            userRepository.findById(driver.getUserId()).ifPresent(user -> {
                dto.setUserId(user.getId());
                dto.setFullName(user.getFullName());
                dto.setEmail(user.getEmail());
            });
        }
        dto.setVehicleNumber(driver.getVehicleNumber());
        dto.setVehicleType(driver.getVehicleType());
        dto.setStatus(driver.getStatus());
        dto.setRating(driver.getRating());
        dto.setTotalDeliveries(driver.getTotalDeliveries());
        dto.setActiveDeliveriesCount(driver.getActiveDeliveriesCount());
        dto.setPhone(driver.getPhone());
        dto.setZoneName(driver.getZoneName());
        return dto;
    }
}
