package com.busbooking.BustTicketBooking.service;

import com.busbooking.BustTicketBooking.dto.BookingRequestDto;
import com.busbooking.BustTicketBooking.dto.BookingResponseDto;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.User;
import java.util.List;

public interface BookingService {
    Booking createBooking(Booking booking);
    Booking createBooking(BookingRequestDto dto, User user);
    Booking getBookingById(Long id);
    Booking updateBooking(Long id, Booking booking);
    Booking updateBooking(Long id, BookingRequestDto dto, User user);
    void deleteBooking(Long id);
    List<Booking> getBookingsByUser(User user);
    List<BookingResponseDto> getAllBookings();
}
