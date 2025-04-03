package com.busbooking.BustTicketBooking;

import com.busbooking.BustTicketBooking.Controller.BusController;
import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.service.BusService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BusController.class)
public class BusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BusService busService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllBuses() throws Exception {
        Bus bus = new Bus();
        bus.setId(1L);
        bus.setBusName("Test Bus");
        bus.setBusNumber("TB-101");
        bus.setDepartureTime(LocalDateTime.now());
        bus.setArrivalTime(LocalDateTime.now().plusHours(2));

        Mockito.when(busService.getAllBuses()).thenReturn(Collections.singletonList(bus));

        mockMvc.perform(get("/api/buses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].busName", is("Test Bus")));
    }

    @Test
    public void testGetBusById() throws Exception {
        Bus bus = new Bus();
        bus.setId(1L);
        bus.setBusName("Test Bus");
        bus.setBusNumber("TB-101");
        bus.setDepartureTime(LocalDateTime.now());
        bus.setArrivalTime(LocalDateTime.now().plusHours(2));

        Mockito.when(busService.getBusById(1L)).thenReturn(bus);

        mockMvc.perform(get("/api/buses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.busName", is("Test Bus")));
    }

    @Test
    public void testCreateBus() throws Exception {
        Bus bus = new Bus();
        bus.setId(1L);
        bus.setBusName("New Bus");
        bus.setBusNumber("NB-202");
        bus.setDepartureTime(LocalDateTime.now());
        bus.setArrivalTime(LocalDateTime.now().plusHours(3));

        Mockito.when(busService.createBus(any(Bus.class))).thenReturn(bus);

        mockMvc.perform(post("/api/buses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.busName", is("New Bus")));
    }

    @Test
    public void testUpdateBus() throws Exception {
        Bus updatedBus = new Bus();
        updatedBus.setId(1L);
        updatedBus.setBusName("Updated Bus");
        updatedBus.setBusNumber("UB-303");
        updatedBus.setDepartureTime(LocalDateTime.now());
        updatedBus.setArrivalTime(LocalDateTime.now().plusHours(4));

        Mockito.when(busService.updateBus(eq(1L), any(Bus.class))).thenReturn(updatedBus);

        mockMvc.perform(put("/api/buses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.busName", is("Updated Bus")));
    }

    @Test
    public void testDeleteBus() throws Exception {
        Mockito.doNothing().when(busService).deleteBus(1L);

        mockMvc.perform(delete("/api/buses/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Bus deleted successfully"));
    }

    @Test
    public void testSearchBuses() throws Exception {
        Bus bus1 = new Bus();
        bus1.setId(1L);
        bus1.setBusName("Express");
        bus1.setBusNumber("EX-001");

        Bus bus2 = new Bus();
        bus2.setId(2L);
        bus2.setBusName("Rapid");
        bus2.setBusNumber("RP-002");

        Mockito.when(busService.searchBuses("CityA", "CityB"))
                .thenReturn(Arrays.asList(bus1, bus2));

        mockMvc.perform(get("/api/buses/search")
                        .param("from", "CityA")
                        .param("to", "CityB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].busName", is("Express")))
                .andExpect(jsonPath("$[1].busName", is("Rapid")));
    }
}
