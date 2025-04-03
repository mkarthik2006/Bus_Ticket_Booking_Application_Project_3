package com.busbooking.BustTicketBooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class UserRegistrationDto {
    @NotEmpty(message = "Name cannot be empty")
    private String name;

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Invalid email address")
    private String email;

    @NotEmpty(message = "Password cannot be empty")
    private String password;

    private String role; // "USER" or "ADMIN"
}
