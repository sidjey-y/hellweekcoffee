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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.context.Context;
import java.util.List;

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

            // Generate membership ID if customer is a member
            if (request.isMember()) {
                String membershipId = generateUniqueMembershipId();
                request.setMembershipId(membershipId);
                logger.info("Generated membership ID: {}", membershipId);
            }

            // If membershipId is provided but not marked as member, set member flag
            if (request.getMembershipId() != null && !request.isMember()) {
                request.setMember(true);
            }

            // If membershipId is provided, verify it doesn't exist
            if (request.getMembershipId() != null && 
                customerRepository.existsByMembershipId(request.getMembershipId())) {
                throw new IllegalArgumentException("Membership ID already exists");
            }

            // Log the incoming date format
            logger.info("Received date of birth: {}", request.getDateOfBirth());

            Customer customer = new Customer();
            customer.setFirstName(request.getFirstName());
            customer.setLastName(request.getLastName());
            customer.setDateOfBirth(request.getDateOfBirth());
            customer.setEmail(request.getEmail());
            customer.setPhone(request.getPhone());
            customer.setMember(request.isMember());
            customer.setMembershipId(request.getMembershipId());
            customer.setActive(true);

            logger.debug("Saving customer to database: {}", customer);
            Customer savedCustomer = customerRepository.save(customer);
            logger.info("Successfully created customer with ID: {} and membership ID: {}", 
                savedCustomer.getId(), savedCustomer.getMembershipId());

            // Send membership email if customer is a member and has an email
            if (savedCustomer.getMembershipId() != null && savedCustomer.getEmail() != null) {
                try {
                    Context context = new Context();
                    context.setVariable("membershipId", savedCustomer.getMembershipId());
                    context.setVariable("firstName", savedCustomer.getFirstName());
                    
                    emailService.sendEmail(
                        savedCustomer.getEmail(),
                        "Welcome to HellWeek Coffee - Your Membership ID",
                        "membership-email",
                        context
                    );
                } catch (Exception e) {
                    // Log the email error but don't fail the transaction
                    logger.error("Failed to send welcome email to customer: {}", e.getMessage());
                    savedCustomer.setEmailError("Failed to send welcome email: " + e.getMessage());
                }
            }

            return savedCustomer;
        } catch (Exception e) {
            logger.error("Error creating customer: {}", e.getMessage(), e);
            throw e;
        }
    }

    private String generateUniqueMembershipId() {
        Random random = new Random();
        String membershipId;
        do {
            // Generate a 5-character ID with at least one letter and one number
            StringBuilder sb = new StringBuilder();
            String letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            String numbers = "0123456789";
            
            // Ensure at least one letter
            sb.append(letters.charAt(random.nextInt(letters.length())));
            
            // Ensure at least one number
            sb.append(numbers.charAt(random.nextInt(numbers.length())));
            
            // Fill the remaining 3 characters with random mix
            String allChars = letters + numbers;
            for (int i = 0; i < 3; i++) {
                sb.append(allChars.charAt(random.nextInt(allChars.length())));
            }
            
            // Shuffle the characters to randomize position of letter and number
            char[] chars = sb.toString().toCharArray();
            for (int i = chars.length - 1; i > 0; i--) {
                int j = random.nextInt(i + 1);
                char temp = chars[i];
                chars[i] = chars[j];
                chars[j] = temp;
            }
            
            membershipId = new String(chars);
        } while (customerRepository.existsByMembershipId(membershipId));
        
        return membershipId;
    }

    public Customer getCustomerByMembershipId(String membershipId) {
        logger.info("Looking up customer by membership ID: {}", membershipId);
        try {
            Customer customer = customerRepository.findByMembershipId(membershipId)
                .orElseThrow(() -> {
                    logger.error("Customer not found with membership ID: {}", membershipId);
                    return new EntityNotFoundException("Customer not found with membership ID: " + membershipId);
                });
            logger.info("Found customer: {} {}, membership ID: {}", 
                customer.getFirstName(), customer.getLastName(), customer.getMembershipId());
            return customer;
        } catch (Exception e) {
            logger.error("Error looking up customer with membership ID {}: {}", membershipId, e.getMessage());
            throw e;
        }
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

    public List<Customer> getAllCustomers() {
        logger.info("Fetching all customers");
        return customerRepository.findAll();
    }

    @Transactional
    public void deleteCustomer(Long id) {
        logger.info("Attempting to delete customer with ID: {}", id);
        try {
            Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
            
            // The @OneToMany cascade will handle the deletion of related transactions
            customerRepository.delete(customer);
            logger.info("Successfully deleted customer with ID: {} and their related data", id);
        } catch (EntityNotFoundException e) {
            logger.error("Customer not found with ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting customer with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete customer: " + e.getMessage(), e);
        }
    }
}
