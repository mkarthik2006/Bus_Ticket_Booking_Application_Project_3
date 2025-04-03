package com.busbooking.BustTicketBooking.service;

import com.busbooking.BustTicketBooking.dto.UserRegistrationDto;
import com.busbooking.BustTicketBooking.dto.LoginRequest;
import com.busbooking.BustTicketBooking.model.User;
import java.util.Optional;
import java.util.List;

public interface UserService {
    User registerUser(UserRegistrationDto registrationDto);
    String authenticateUser(LoginRequest loginRequest);
    Optional<User> findByEmail(String email);
    User updateUser(Long id, User updatedUser);
    User updateUser(Long id, UserRegistrationDto registrationDto);
    User getUserById(Long id);
    User createUser(User newUser);
    List<User> getAllUsers();
    void deleteUser(Long id);
}
