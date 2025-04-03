package com.busbooking.BustTicketBooking;

import com.busbooking.BustTicketBooking.Controller.AdminController;
import com.busbooking.BustTicketBooking.dto.AdminDashboardStats;
import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.model.User;
import com.busbooking.BustTicketBooking.service.BookingService;
import com.busbooking.BustTicketBooking.service.BusService;
import com.busbooking.BustTicketBooking.service.PaymentService;
import com.busbooking.BustTicketBooking.service.SeatService;
import com.busbooking.BustTicketBooking.service.UserService;
import com.busbooking.BustTicketBooking.repository.CityRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Collections;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BusService busService;

    @MockBean
    private SeatService seatService;

    @MockBean
    private UserService userService;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private CityRepository cityRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testAdminDashboardPage() throws Exception {
        // Prepare dummy data
        Bus bus = new Bus();
        bus.setId(1L);
        bus.setBusName("Test Bus");

        User user = new User();
        user.setId(1L);
        user.setName("AdminUser");

        Mockito.when(busService.getAllBuses()).thenReturn(Collections.singletonList(bus));
        Mockito.when(userService.getAllUsers()).thenReturn(Collections.singletonList(user));
        Mockito.when(bookingService.getAllBookings()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.totalBuses").value(1))
                .andExpect(jsonPath("$.buses[0].busName").value("Test Bus"));
    }
}
