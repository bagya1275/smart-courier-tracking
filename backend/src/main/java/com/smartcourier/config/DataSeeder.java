package com.smartcourier.config;

import com.smartcourier.entity.*;
import com.smartcourier.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (seedEnabled && userRepository.count() == 0) {
            seedInitialData();
        }
    }

    private void seedInitialData() {
        // 1. Users
        String encodedAdminPass = passwordEncoder.encode("admin123");
        String encodedDriverPass = passwordEncoder.encode("driver123");
        String encodedCustomerPass = passwordEncoder.encode("customer123");

        User admin = userRepository.save(new User("admin", "admin@courier.com", encodedAdminPass, "Sarah Jenkins (Admin)", Role.ROLE_ADMIN, "+1-555-0100"));
        User driverUser1 = userRepository.save(new User("driver_marcus", "driver@courier.com", encodedDriverPass, "Marcus Vance (Senior Courier)", Role.ROLE_DRIVER, "+1-555-0101"));
        User driverUser2 = userRepository.save(new User("driver_elena", "elena@courier.com", encodedDriverPass, "Elena Rostova (Express Courier)", Role.ROLE_DRIVER, "+1-555-0102"));
        User driverUser3 = userRepository.save(new User("driver_kai", "kai@courier.com", encodedDriverPass, "Kai Tanaka (Heavy Cargo)", Role.ROLE_DRIVER, "+1-555-0103"));
        User driverUser4 = userRepository.save(new User("driver_zara", "zara@courier.com", encodedDriverPass, "Zara Al-Mansoor (City Sprint)", Role.ROLE_DRIVER, "+1-555-0104"));
        User customerUser = userRepository.save(new User("customer_alex", "customer@courier.com", encodedCustomerPass, "Alex Mercer", Role.ROLE_CUSTOMER, "+1-555-0199"));

        // 2. Drivers
        Driver driver1 = driverRepository.save(new Driver(driverUser1, "EV-SPRINT-409", "Electric Van (Ford E-Transit)", DriverStatus.ON_ROUTE, new BigDecimal("4.9"), 142, 3, "+1-555-0101", "Downtown & Metro Core"));
        Driver driver2 = driverRepository.save(new Driver(driverUser2, "CYBER-TRK-102", "Rapid Cargo Bike (Urban Pro)", DriverStatus.AVAILABLE, new BigDecimal("4.8"), 98, 0, "+1-555-0102", "Uptown Tech Corridor"));
        Driver driver3 = driverRepository.save(new Driver(driverUser3, "HVY-FREIGHT-88", "Heavy Duty Van (Mercedes Sprinter)", DriverStatus.ON_ROUTE, new BigDecimal("5.0"), 310, 2, "+1-555-0103", "Industrial Port & Logistics Hub"));
        Driver driver4 = driverRepository.save(new Driver(driverUser4, "VOLT-SPRINT-14", "Compact Electric Carrier (Nissan e-NV200)", DriverStatus.AVAILABLE, new BigDecimal("4.7"), 74, 0, "+1-555-0104", "Westside Residential Arc"));

        // 3. Routes
        Route route1 = routeRepository.save(new Route(
                "RT-METRO-ALPHA",
                "Central Logistics Depot Alpha",
                "Skyline Financial Center",
                "[{\"name\":\"Depot Alpha\",\"lat\":40.7128,\"lng\":-74.0060},{\"name\":\"Tribeca Hub\",\"lat\":40.7163,\"lng\":-74.0086},{\"name\":\"Skyline Plaza\",\"lat\":40.7505,\"lng\":-73.9934}]",
                new BigDecimal("14.8"),
                32,
                RouteStatus.OPTIMAL
        ));

        Route route2 = routeRepository.save(new Route(
                "RT-UPTOWN-BETA",
                "Depot Alpha (Hub 01)",
                "Apex Science & Biotech Park",
                "[{\"name\":\"Depot Alpha\",\"lat\":40.7128,\"lng\":-74.0060},{\"name\":\"Midtown Tunnel\",\"lat\":40.7441,\"lng\":-73.9712},{\"name\":\"Apex Campus\",\"lat\":40.7850,\"lng\":-73.9680}]",
                new BigDecimal("22.4"),
                45,
                RouteStatus.IN_PROGRESS
        ));

        Route route3 = routeRepository.save(new Route(
                "RT-PORT-GAMMA",
                "Bay Maritime Cargo Hub",
                "Westside Retail Grid",
                "[{\"name\":\"Port Terminal\",\"lat\":40.6782,\"lng\":-74.0445},{\"name\":\"Hudson Transit Way\",\"lat\":40.7200,\"lng\":-74.0100},{\"name\":\"Westside Center\",\"lat\":40.7580,\"lng\":-73.9855}]",
                new BigDecimal("18.2"),
                38,
                RouteStatus.OPTIMAL
        ));

        // 4. Shipments
        Shipment s1 = shipmentRepository.save(new Shipment(
                "TRK-2026-8821", "Apex Quantum Labs", "+1-555-4011", "742 Cyber Blvd, Innovation Park",
                "Alex Mercer", "+1-555-0199", "104 Hudson Yards, Penthouse 4",
                "Central Depot Alpha", "Hudson Yards Tower 104",
                40.7128, -74.0060, 40.7536, -74.0016,
                ShipmentStatus.IN_TRANSIT, new BigDecimal("3.40"), ShipmentPriority.EXPRESS,
                LocalDateTime.now().plusHours(2)
        ));

        Shipment s2 = shipmentRepository.save(new Shipment(
                "TRK-2026-9042", "BioGen Pharmaceuticals", "+1-555-4022", "12 Research Way, Suite 300",
                "Dr. Aris Thorne", "+1-555-4023", "Metropolitan Hospital Wing B",
                "Central Depot Alpha", "Metro Hospital Wing B",
                40.7128, -74.0060, 40.7380, -73.9780,
                ShipmentStatus.IN_TRANSIT, new BigDecimal("1.80"), ShipmentPriority.OVERNIGHT,
                LocalDateTime.now().plusHours(1)
        ));

        Shipment s3 = shipmentRepository.save(new Shipment(
                "TRK-2026-7731", "Global Tech Imports", "+1-555-4033", "Port Terminal Warehouse 9",
                "Nova Robotics Corp", "+1-555-4034", "550 Broadway, 8th Floor",
                "Bay Maritime Hub", "550 Broadway, Soho",
                40.6782, -74.0445, 40.7240, -73.9970,
                ShipmentStatus.DELIVERED, new BigDecimal("12.50"), ShipmentPriority.STANDARD,
                LocalDateTime.now()
        ));

        Shipment s4 = shipmentRepository.save(new Shipment(
                "TRK-2026-6194", "Cybernetics Direct", "+1-555-4044", "88 Silicon Row, Tech District",
                "Sophia Lin", "+1-555-4045", "224 5th Avenue, Apt 14B",
                "Central Depot Alpha", "224 5th Ave, Flatiron",
                40.7128, -74.0060, 40.7420, -73.9880,
                ShipmentStatus.IN_TRANSIT, new BigDecimal("0.85"), ShipmentPriority.EXPRESS,
                LocalDateTime.now().plusHours(3)
        ));

        Shipment s5 = shipmentRepository.save(new Shipment(
                "TRK-2026-5510", "NextGen Fashion Studio", "+1-555-4055", "300 Mercer St, Studio 4",
                "Liam Vance", "+1-555-4056", "89 Columbus Ave, Upper West",
                "Central Depot Alpha", "89 Columbus Ave, UWS",
                40.7128, -74.0060, 40.7740, -73.9810,
                ShipmentStatus.PENDING, new BigDecimal("2.10"), ShipmentPriority.STANDARD,
                LocalDateTime.now().plusDays(1)
        ));

        Shipment s6 = shipmentRepository.save(new Shipment(
                "TRK-2026-4428", "Hyperion Aerospace", "+1-555-4066", "Hangar 4, JFK Logistics Center",
                "Defense Research Lab", "+1-555-4067", "40 Wall Street, Suite 5000",
                "Bay Maritime Hub", "40 Wall St, Financial Dist",
                40.6782, -74.0445, 40.7065, -74.0090,
                ShipmentStatus.DELAYED, new BigDecimal("28.00"), ShipmentPriority.OVERNIGHT,
                LocalDateTime.now().plusHours(6)
        ));

        Shipment s7 = shipmentRepository.save(new Shipment(
                "TRK-2026-3391", "Lumina Optical Instruments", "+1-555-4077", "180 Varick St",
                "Vision Clinic North", "+1-555-4078", "1400 Madison Ave",
                "Central Depot Alpha", "1400 Madison Ave, Carnegie",
                40.7128, -74.0060, 40.7870, -73.9550,
                ShipmentStatus.DELIVERED, new BigDecimal("4.20"), ShipmentPriority.STANDARD,
                LocalDateTime.now()
        ));

        Shipment s8 = shipmentRepository.save(new Shipment(
                "TRK-2026-2215", "Vertex Microelectronics", "+1-555-4088", "45 Enterprise Drive",
                "Matrix Data Centers", "+1-555-4089", "60 Hudson St, Telecom Vault",
                "Central Depot Alpha", "60 Hudson St, Tribeca",
                40.7128, -74.0060, 40.7180, -74.0080,
                ShipmentStatus.PENDING, new BigDecimal("6.75"), ShipmentPriority.EXPRESS,
                LocalDateTime.now().plusHours(18)
        ));

        // 5. Deliveries
        deliveryRepository.save(new Delivery(s1, driver1, route1, DeliveryStatus.OUT_FOR_DELIVERY, "High priority quantum sensor package. Handle with extreme care."));
        deliveryRepository.save(new Delivery(s2, driver1, route1, DeliveryStatus.OUT_FOR_DELIVERY, "Temperature-controlled pharmaceutical cooler container."));
        
        Delivery del3 = new Delivery(s3, driver3, route3, DeliveryStatus.DELIVERED, "Delivered to loading bay 2 safely.");
        del3.setDeliveredAt(LocalDateTime.now().minusHours(4));
        del3.setRecipientSignature("N. Robotics - Signed by Reception (David K.)");
        deliveryRepository.save(del3);

        deliveryRepository.save(new Delivery(s4, driver1, route1, DeliveryStatus.PICKED_UP, "Fragile electronics box."));
        deliveryRepository.save(new Delivery(s5, null, null, DeliveryStatus.ASSIGNED, "Awaiting courier pickup at central sorting desk."));
        deliveryRepository.save(new Delivery(s6, driver3, route3, DeliveryStatus.ASSIGNED, "Delayed due to heavy bridge traffic advisory."));
        
        Delivery del7 = new Delivery(s7, driver2, route2, DeliveryStatus.DELIVERED, "Completed ahead of schedule.");
        del7.setDeliveredAt(LocalDateTime.now().minusHours(1));
        del7.setRecipientSignature("Dr. Lin Clinic - Reception");
        deliveryRepository.save(del7);

        deliveryRepository.save(new Delivery(s8, driver4, null, DeliveryStatus.ASSIGNED, "Scheduled for overnight batch dispatch."));
    }
}
