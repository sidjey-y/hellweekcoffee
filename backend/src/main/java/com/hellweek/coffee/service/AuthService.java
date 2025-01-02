package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.LoginRequest;
import com.hellweek.coffee.dto.UserRequest;
import com.hellweek.coffee.model.Role;
import com.hellweek.coffee.model.User;
import com.hellweek.coffee.repository.UserRepository;
import com.hellweek.coffee.service.EmailService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String jwtSecret;
    private final long jwtExpiration;
    private Key signingKey;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        EmailService emailService,
        @Value("${jwt.secret}") String jwtSecret,
        @Value("${jwt.expiration}") long jwtExpiration
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtSecret = jwtSecret;
        this.jwtExpiration = jwtExpiration;
        byte[] apiKeySecretBytes = Base64.getDecoder().decode(jwtSecret);
        this.signingKey = new javax.crypto.spec.SecretKeySpec(apiKeySecretBytes, SignatureAlgorithm.HS256.getJcaName());
    }

    @PostConstruct
    public void initializeAdmin() {
        logger.info("Attempting to initialize admin user");
        if (userRepository.findByUsername("admin").isEmpty()) {
            logger.info("No admin user found. Creating default admin.");
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("HWC@dmin2024!")); // Updated secure password
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

        // Check for active users with the same email
        if (request.getEmail() != null && userRepository.findByEmail(request.getEmail())
                .filter(User::isActive)
                .isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setActive(true);
        
        return userRepository.save(user);
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

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("role", user.getRole())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }

    @Transactional
    public User updateUser(Long id, UserRequest request) {
        User user = getUserById(id);
        
        // Don't allow changing username of existing users
        if (!user.getUsername().equals(request.getUsername())) {
            throw new IllegalArgumentException("Username cannot be changed");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getEmail() != null) {
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
    public void deactivateUser(Long id) {
        User user = getUserById(id);
        if (user.getUsername().equals("admin")) {
            throw new IllegalArgumentException("Cannot deactivate admin user");
        }
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public List<User> getAllUsers() {
        try {
            return userRepository.findByActiveTrue();
        } catch (Exception e) {
            logger.warn("Failed to use findByActiveTrue, falling back to findAll(): {}", e.getMessage());
            return userRepository.findAll().stream()
                .filter(User::isActive)
                .toList();
        }
    }

    @Transactional
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
