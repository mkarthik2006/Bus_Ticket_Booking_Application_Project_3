package com.busbooking.BustTicketBooking.service;

import com.busbooking.BustTicketBooking.model.Bus;
import java.util.List;

public interface BusService {
    List<Bus> getAllBuses();
    Bus getBusById(Long id);
    Bus createBus(Bus bus);
    Bus updateBus(Long id, Bus bus);
    void deleteBus(Long id);
    List<Bus> searchBuses(String from, String to);
}
