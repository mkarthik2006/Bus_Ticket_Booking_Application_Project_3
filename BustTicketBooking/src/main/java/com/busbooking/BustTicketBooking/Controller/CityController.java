package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.model.City;
import com.busbooking.BustTicketBooking.repository.CityRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityRepository cityRepository;

    public CityController(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    @GetMapping
    public ResponseEntity<List<City>> getAllCities() {
        List<City> cities = cityRepository.findAll();
        return ResponseEntity.ok(cities);
    }
}
