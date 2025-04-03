package com.busbooking.BustTicketBooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalBuses;
    private long totalUsers;
    private long totalBookings;
}
