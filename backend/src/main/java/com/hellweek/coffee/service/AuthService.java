package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.LoginRequest;
import com.hellweek.coffee.dto.UserRequest;
import com.hellweek.coffee.model.Role;
import com.hellweek.coffee.model.User;
import com.hellweek.coffee.repository.UserRepository;
import com.hellweek.coffee.service.EmailService;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @PostConstruct
    public void initializeAdmin() {
        logger.info("Attempting to initialize admin user");
        if (userRepository.findByUsername("admin").isEmpty()) {
            logger.info("No admin user found. Creating default admin.");
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            admin.setBirthDate(java.time.LocalDate.of(2000, 1, 1)); // Default birthdate for admin
            userRepository.save(admin);
            logger.info("Default admin user created successfully");
        } else {
            logger.info("Admin user already exists");
        }
    }

    @Transactional
    public User createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty() && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setBirthDate(request.getBirthDate());
        user.setRole(request.getRole());
        user.setActive(true);

        user = userRepository.save(user);

        // Send staff registration email if email is provided
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            emailService.sendStaffRegistrationEmail(
                request.getEmail(),
                user.getUsername(),
                user.getFirstName()
            );
        }

        return user;
    }

    public User authenticate(LoginRequest request) {
        logger.info("Authentication attempt for username: {}", request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> {
                logger.error("User not found: {}", request.getUsername());
                return new EntityNotFoundException("User not found");
            });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.error("Invalid password for username: {}", request.getUsername());
            throw new BadCredentialsException("Invalid credentials");
        }

        logger.info("User authenticated successfully: {}, Role: {}", user.getUsername(), user.getRole());
        return user;
    }

    @Transactional
    public User updateUser(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!user.getUsername().equals(request.getUsername()) && 
            userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBirthDate(request.getBirthDate());
        
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            userRepository.findByEmail(request.getEmail())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(userId)) {
                        throw new IllegalArgumentException("Email already exists");
                    }
                });
            user.setEmail(request.getEmail());
        }
        
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user.setRole(request.getRole());

        return userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }
}
