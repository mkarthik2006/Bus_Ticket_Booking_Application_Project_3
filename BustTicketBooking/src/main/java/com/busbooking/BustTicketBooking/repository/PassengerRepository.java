package com.busbooking.BustTicketBooking.repository;

import com.busbooking.BustTicketBooking.model.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {
}
