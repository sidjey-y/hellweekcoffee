package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.CustomerRequest;
import com.hellweek.coffee.model.Customer;
import com.hellweek.coffee.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3001", allowCredentials = "true", maxAge = 3600)
public class CustomerController {
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
    public ResponseEntity<Customer> registerCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.createCustomer(request));
    }

    @GetMapping("/{membershipId}")
    public ResponseEntity<Customer> getCustomer(@PathVariable String membershipId) {
        return ResponseEntity.ok(customerService.getCustomerByMembershipId(membershipId));
    }

    @PutMapping("/{membershipId}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable String membershipId,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(membershipId, request));
    }
}
