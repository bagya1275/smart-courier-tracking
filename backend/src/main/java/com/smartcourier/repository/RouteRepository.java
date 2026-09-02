package com.smartcourier.repository;

import com.smartcourier.entity.Route;
import com.smartcourier.entity.RouteStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends MongoRepository<Route, Long> {
    Optional<Route> findByRouteCode(String routeCode);
    List<Route> findByStatus(RouteStatus status);
}
