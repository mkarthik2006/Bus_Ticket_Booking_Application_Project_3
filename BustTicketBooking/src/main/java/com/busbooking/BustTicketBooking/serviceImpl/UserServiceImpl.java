package com.busbooking.BustTicketBooking.serviceImpl;

import com.busbooking.BustTicketBooking.dto.UserRegistrationDto;
import com.busbooking.BustTicketBooking.dto.LoginRequest;
import com.busbooking.BustTicketBooking.model.Role;
import com.busbooking.BustTicketBooking.model.User;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.repository.UserRepository;
import com.busbooking.BustTicketBooking.repository.BookingRepository;
import com.busbooking.BustTicketBooking.security.JwtTokenProvider;
import com.busbooking.BustTicketBooking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    // Inject BookingRepository to check user bookings
    private final BookingRepository bookingRepository;

    @Override
    public User registerUser(UserRegistrationDto registrationDto) {
        logger.info("Registering user with email: {}", registrationDto.getEmail());
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        User user = new User();
        user.setName(registrationDto.getName());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole(registrationDto.getRole() != null && registrationDto.getRole().equalsIgnoreCase("ADMIN")
                ? Role.ADMIN
                : Role.USER);
        return userRepository.save(user);
    }

    @Override
    public String authenticateUser(LoginRequest loginRequest) {
        logger.info("Authenticating user: {}", loginRequest.getEmail());
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        return tokenProvider.generateToken(authentication);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        logger.info("Updating user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        if (updatedUser.getName() != null) {
            user.setName(updatedUser.getName());
        }
        if (updatedUser.getEmail() != null) {
            user.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getRole() != null) {
            user.setRole(updatedUser.getRole());
        }
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, UserRegistrationDto registrationDto) {
        logger.info("Updating user with id (via DTO): {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        if (registrationDto.getName() != null) {
            user.setName(registrationDto.getName());
        }
        if (registrationDto.getEmail() != null) {
            user.setEmail(registrationDto.getEmail());
        }
        if (registrationDto.getPassword() != null && !registrationDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        }
        if (registrationDto.getRole() != null) {
            if (registrationDto.getRole().equalsIgnoreCase("ADMIN")) {
                user.setRole(Role.ADMIN);
            } else {
                user.setRole(Role.USER);
            }
        }
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        logger.info("Deleting user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        // Check for existing bookings referencing this user
        List<Booking> bookings = bookingRepository.findByUser(user);
        if (!bookings.isEmpty()) {
            throw new IllegalStateException("Cannot delete user because there are existing bookings associated with this user.");
        }
        userRepository.deleteById(id);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }

    @Override
    public User createUser(User newUser) {
        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        return userRepository.save(newUser);
    }
}
