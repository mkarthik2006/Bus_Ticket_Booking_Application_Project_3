package com.busbooking.BustTicketBooking.repository;

import com.busbooking.BustTicketBooking.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
}
