package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.CustomerRequest;
import com.hellweek.coffee.model.Customer;
import com.hellweek.coffee.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.mail.MailAuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3001", allowCredentials = "true", maxAge = 3600)
public class CustomerController {
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);
    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.createCustomer(request));
    }

    @PostMapping("/guest")
    public ResponseEntity<Customer> createGuestCustomer(@RequestParam String firstName) {
        return ResponseEntity.ok(customerService.createGuestCustomer(firstName));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody CustomerRequest request) {
        try {
            Customer customer = customerService.createCustomer(request);
            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            // Check if it's a mail authentication error
            if (e.getCause() instanceof MailAuthenticationException) {
                logger.warn("Email sending failed but customer was created", e);
                Customer customer = customerService.createCustomer(request);
                customer.setEmailError("Failed to send welcome email: " + e.getMessage());
                return ResponseEntity.ok(customer);
            }
            throw e;
        }
    }

    @GetMapping("/{membershipId}")
    public ResponseEntity<Customer> getCustomer(@PathVariable String membershipId) {
        return ResponseEntity.ok(customerService.getCustomerByMembershipId(membershipId));
    }

    @GetMapping("/membership/{membershipId}")
    public ResponseEntity<Customer> getCustomerByMembership(@PathVariable String membershipId) {
        logger.info("Received request to find customer with membership ID: {}", membershipId);
        try {
            Customer customer = customerService.getCustomerByMembershipId(membershipId);
            logger.info("Found customer: {} {}", customer.getFirstName(), customer.getLastName());
            return ResponseEntity.ok(customer);
        } catch (EntityNotFoundException e) {
            logger.warn("Customer not found with membership ID: {}", membershipId);
            throw e;
        } catch (Exception e) {
            logger.error("Error finding customer with membership ID {}: {}", membershipId, e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{membershipId}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable String membershipId,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(membershipId, request));
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }
}
