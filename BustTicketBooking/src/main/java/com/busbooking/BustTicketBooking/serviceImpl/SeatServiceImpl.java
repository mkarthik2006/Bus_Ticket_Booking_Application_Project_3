package com.busbooking.BustTicketBooking.serviceImpl;

import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.*;
import com.busbooking.BustTicketBooking.repository.SeatRepository;
import com.busbooking.BustTicketBooking.service.BusService;
import com.busbooking.BustTicketBooking.service.SeatService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final BusService busService;

    public SeatServiceImpl(SeatRepository seatRepository, BusService busService) {
        this.seatRepository = seatRepository;
        this.busService = busService;
    }

    @Override
    public void bookSeats(Long busId, String[] seatNumbers) {
        Bus bus = busService.getBusById(busId);
        for (String rawSeatNum : seatNumbers) {
            String seatNum = rawSeatNum.trim();
            Seat seat = seatRepository.findByBusAndSeatNumber(bus, seatNum)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat", "seatNumber", seatNum));
            if (!SeatStatus.AVAILABLE.equals(seat.getStatus())) {
                throw new IllegalStateException("Seat " + seatNum + " is already booked or unavailable.");
            }
            seat.setStatus(SeatStatus.BOOKED);
            seatRepository.save(seat);
        }
    }

    @Override
    public List<Seat> findSeatsByBusId(Long busId) {
        Bus bus = busService.getBusById(busId);
        return seatRepository.findByBusWithPassengerOrdered(bus);
    }

    @Override
    public void createDefaultSeatsForBus(Bus bus) {
        // For example, 7 rows x 4 columns
        int totalRows = 7;
        int totalCols = 4;

        for (int r = 1; r <= totalRows; r++) {
            for (int c = 1; c <= totalCols; c++) {
                Seat seat = new Seat();
                seat.setBus(bus);                // Link seat to the bus
                seat.setSeatRow(r);             // e.g., row 1
                seat.setSeatCol(c);             // e.g., col 1
                seat.setSeatNumber("R" + r + "C" + c); // e.g. "R1C1"
                seat.setDeck(null);             // If you want to handle single/double deck, adjust as needed
                seat.setStatus(SeatStatus.AVAILABLE); // Mark seat as initially available
                seatRepository.save(seat);
            }
        }
    }
}
