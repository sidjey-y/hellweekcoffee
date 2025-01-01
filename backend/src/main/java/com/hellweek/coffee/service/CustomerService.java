package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.CustomerRequest;
import com.hellweek.coffee.model.Customer;
import com.hellweek.coffee.repository.CustomerRepository;
import com.hellweek.coffee.service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);
    private final CustomerRepository customerRepository;
    private final EmailService emailService;

    @Transactional
    public Customer createCustomer(CustomerRequest request) {
        logger.info("Creating new customer: {}", request.getFirstName());
        try {
            // For members, validate required fields
            if (request.isMember()) {
                validateMemberFields(request);
            }

            // Generate membership ID for premium members
            if (request.isMember() && request.getMembershipId() == null) {
                String membershipId = generateUniqueMembershipId();
                request.setMembershipId(membershipId);
                logger.info("Generated membership ID: {}", membershipId);
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

            logger.debug("Saving customer to database: {}", customer);
            customer = customerRepository.save(customer);
            logger.info("Successfully created customer with ID: {}", customer.getId());

            // Send membership email if customer is a member and has an email
            if (customer.isMember() && customer.getEmail() != null && !customer.getEmail().isEmpty()) {
                try {
                    emailService.sendMembershipEmail(
                        customer.getEmail(),
                        customer.getMembershipId(),
                        customer.getFirstName()
                    );
                    logger.info("Sent membership email to: {}", customer.getEmail());
                } catch (Exception e) {
                    logger.error("Failed to send membership email", e);
                    // Don't throw the error, just log it
                }
            }

            return customer;
        } catch (Exception e) {
            logger.error("Error creating customer", e);
            throw e;
        }
    }

    private String generateUniqueMembershipId() {
        Random random = new Random();
        String membershipId;
        do {
            StringBuilder sb = new StringBuilder();
            String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (int i = 0; i < 5; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            membershipId = sb.toString();
        } while (customerRepository.existsByMembershipId(membershipId));
        
        return membershipId;
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
