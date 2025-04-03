package com.busbooking.BustTicketBooking;

import com.busbooking.BustTicketBooking.Controller.BookingController;
import com.busbooking.BustTicketBooking.dto.BookingRequestDto;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.User;
import com.busbooking.BustTicketBooking.service.BookingService;
import com.busbooking.BustTicketBooking.service.PdfService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
public class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private PdfService pdfService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "user@example.com", roles = {"USER"})
    public void testCreateBooking() throws Exception {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setBusId(1L);
        dto.setBoardingPoint("City A");
        dto.setDroppingPoint("City B");

        Booking booking = new Booking();
        booking.setId(1L);
        booking.setBoardingPoint("City A");
        booking.setDroppingPoint("City B");

        // When creating a booking, the BookingService uses the authenticated user
        Mockito.when(bookingService.createBooking(Mockito.any(BookingRequestDto.class), Mockito.any(User.class)))
                .thenReturn(booking);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}
