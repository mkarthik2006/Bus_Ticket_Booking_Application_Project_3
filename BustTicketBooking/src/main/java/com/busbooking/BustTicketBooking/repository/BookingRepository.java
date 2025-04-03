package com.busbooking.BustTicketBooking.repository;

import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);

    List<Booking> findAll();

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.bus LEFT JOIN FETCH b.user")
    List<Booking> findAllWithBusAndUser();
}
