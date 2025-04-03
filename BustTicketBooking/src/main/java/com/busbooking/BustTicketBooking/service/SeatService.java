package com.busbooking.BustTicketBooking.service;

import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.model.Seat;
import java.util.List;

public interface SeatService {
    List<Seat> findSeatsByBusId(Long busId);
    void bookSeats(Long busId, String[] seatNumbers);
    void createDefaultSeatsForBus(Bus bus);
}
