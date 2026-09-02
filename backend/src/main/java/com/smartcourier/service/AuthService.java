package com.smartcourier.service;

import com.smartcourier.dto.AuthDTOs.*;
import com.smartcourier.entity.Driver;
import com.smartcourier.entity.Role;
import com.smartcourier.entity.User;
import com.smartcourier.repository.DriverRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(userDetails, user.getRole().name(), user.getId());

        Long driverId = null;
        if (user.getRole() == Role.ROLE_DRIVER) {
            Optional<Driver> driverOpt = driverRepository.findByUserId(user.getId());
            if (driverOpt.isPresent()) {
                driverId = driverOpt.get().getId();
            }
        }

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole().name(), driverId);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;
        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                role,
                request.getPhone()
        );

        User savedUser = userRepository.save(user);

        // Auto-create dummy driver profile if registering as driver
        Long driverId = null;
        if (role == Role.ROLE_DRIVER) {
            String vehicleNum = "DRV-" + (100 + (int)(Math.random() * 900));
            Driver driver = new Driver(savedUser, vehicleNum, "Standard Carrier", com.smartcourier.entity.DriverStatus.AVAILABLE,
                    new java.math.BigDecimal("5.0"), 0, 0, request.getPhone() != null ? request.getPhone() : "+1-555-0000", "Central Zone");
            Driver savedDriver = driverRepository.save(driver);
            driverId = savedDriver.getId();
        }

        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                savedUser.getUsername(),
                savedUser.getPassword(),
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(savedUser.getRole().name()))
        );

        String token = jwtUtils.generateToken(userDetails, savedUser.getRole().name(), savedUser.getId());
        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name(), driverId);
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        return dto;
    }
}
