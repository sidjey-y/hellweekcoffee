package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.CustomerRequest;
import com.hellweek.coffee.model.Customer;
import com.hellweek.coffee.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Transactional
    public Customer createCustomer(CustomerRequest request) {
        // For members, validate required fields
        if (request.isMember()) {
            validateMemberFields(request);
        }

        // If membershipId is provided, verify it doesn't exist
        if (request.getMembershipId() != null && 
            customerRepository.existsByMembershipId(request.getMembershipId())) {
            throw new IllegalArgumentException("Membership ID already exists");
        }

        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setMember(request.isMember());
        customer.setMembershipId(request.getMembershipId());

        return customerRepository.save(customer);
    }

    public Customer getCustomerByMembershipId(String membershipId) {
        return customerRepository.findByMembershipId(membershipId)
            .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
    }

    @Transactional
    public Customer updateCustomer(String membershipId, CustomerRequest request) {
        Customer customer = getCustomerByMembershipId(membershipId);

        // For members, validate required fields
        if (request.isMember()) {
            validateMemberFields(request);
        }

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());

        return customerRepository.save(customer);
    }

    private void validateMemberFields(CustomerRequest request) {
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required for members");
        }
        if (request.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required for members");
        }
        if ((request.getEmail() == null || request.getEmail().trim().isEmpty()) && 
            (request.getPhone() == null || request.getPhone().trim().isEmpty())) {
            throw new IllegalArgumentException("Either email or phone number is required for members");
        }
    }

    public Customer createGuestCustomer(String firstName) {
        CustomerRequest request = new CustomerRequest();
        request.setFirstName(firstName);
        request.setMember(false);
        return createCustomer(request);
    }
}
