package com.busbooking.BustTicketBooking.repository;

import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    Optional<Seat> findByBusAndSeatNumber(Bus bus, String seatNumber);


    @Query("""
  SELECT s
  FROM Seat s
       LEFT JOIN FETCH s.passenger p
  WHERE s.bus = :bus
  ORDER BY s.seatRow, s.seatCol
""")
    List<Seat> findByBusWithPassengerOrdered(@Param("bus") Bus bus);
}
