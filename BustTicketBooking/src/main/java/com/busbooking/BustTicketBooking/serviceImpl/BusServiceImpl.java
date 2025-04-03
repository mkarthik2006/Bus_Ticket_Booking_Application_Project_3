package com.busbooking.BustTicketBooking.serviceImpl;

import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.repository.BusRepository;
import com.busbooking.BustTicketBooking.service.BusService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusServiceImpl implements BusService {
    private static final Logger logger = LoggerFactory.getLogger(BusServiceImpl.class);

    private final BusRepository busRepository;

    @Override
    public List<Bus> getAllBuses() {
        logger.info("Fetching all buses");
        return busRepository.findAll();
    }

    @Override
    public Bus getBusById(Long id) {
        logger.info("Fetching bus with id: {}", id);
        return busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", id));
    }

    @Override
    public Bus createBus(Bus bus) {
        logger.info("Creating bus: {}", bus.getBusNumber());
        return busRepository.save(bus);
    }

    @Override
    public Bus updateBus(Long id, Bus busDetails) {
        Bus bus = getBusById(id);
        bus.setBusName(busDetails.getBusName());
        bus.setBusNumber(busDetails.getBusNumber());
        bus.setRouteFrom(busDetails.getRouteFrom());
        bus.setRouteTo(busDetails.getRouteTo());
        bus.setDepartureTime(busDetails.getDepartureTime());
        bus.setArrivalTime(busDetails.getArrivalTime());
        bus.setPrice(busDetails.getPrice());
        logger.info("Updating bus with id: {}", id);
        return busRepository.save(bus);
    }

    @Override
    public void deleteBus(Long id) {
        Bus bus = getBusById(id);
        logger.info("Deleting bus with id: {}", id);
        busRepository.delete(bus);
    }

    @Override
    public List<Bus> searchBuses(String from, String to) {
        logger.info("Searching buses from {} to {}", from, to);
        return busRepository.findByRouteFromAndRouteTo(from, to);
    }
}
