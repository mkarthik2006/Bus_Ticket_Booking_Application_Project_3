package com.busbooking.BustTicketBooking.repository;

import com.busbooking.BustTicketBooking.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findByRouteFromAndRouteTo(String routeFrom, String routeTo);
    Optional<Bus> findById(Long busId);
}
