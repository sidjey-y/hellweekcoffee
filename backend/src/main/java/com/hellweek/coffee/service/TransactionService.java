package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.TransactionRequest;
import com.hellweek.coffee.model.*;
import com.hellweek.coffee.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final MenuItemRepository menuItemRepository;
    private final CustomerRepository customerRepository;
    private final CustomerService customerService;

    @Transactional
    public Transaction createTransaction(TransactionRequest request, User cashier) {
        // Get or create customer
        Customer customer;
        if (request.getMembershipId() != null) {
            customer = customerRepository.findByMembershipId(request.getMembershipId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        } else {
            if (request.getGuestFirstName() == null || request.getGuestFirstName().trim().isEmpty()) {
                throw new IllegalArgumentException("Guest first name is required");
            }
            customer = customerService.createGuestCustomer(request.getGuestFirstName());
        }

        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
        transaction.setCashier(cashier);
        transaction.setPaymentMethod(request.getPaymentMethod());

        // Process items
        for (TransactionRequest.TransactionItemRequest itemRequest : request.getItems()) {
            OrderItem orderItem = createOrderItem(itemRequest, transaction);
            
            // Check for duplicate items
            OrderItem existingItem = findDuplicateItem(transaction, orderItem);
            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + itemRequest.getQuantity());
            } else {
                transaction.addItem(orderItem);
            }
        }

        return transactionRepository.save(transaction);
    }

    private OrderItem createOrderItem(TransactionRequest.TransactionItemRequest request, Transaction transaction) {
        MenuItem menuItem = menuItemRepository.findByCode(request.getItemCode())
            .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));

        if (!menuItem.isAvailable()) {
            throw new IllegalStateException("Menu item is not available: " + menuItem.getName());
        }

        OrderItem orderItem = new OrderItem();
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(request.getQuantity());
        orderItem.setSize(request.getSize());
        orderItem.setNotes(request.getNotes());

        // Calculate price based on size
        double unitPrice = menuItem.getPriceForSize(request.getSize());

        // Add customizations
        if (request.getCustomizations() != null) {
            for (String customization : request.getCustomizations()) {
                orderItem.addCustomization(customization);
                unitPrice += menuItem.getCustomizationPrice(customization);
            }
        }

        orderItem.setUnitPrice(unitPrice);
        orderItem.setTransaction(transaction);
        return orderItem;
    }

    private OrderItem findDuplicateItem(Transaction transaction, OrderItem newItem) {
        return transaction.getItems().stream()
            .filter(item -> item.getMenuItem().equals(newItem.getMenuItem()) &&
                          item.hasSameCustomizations(newItem))
            .findFirst()
            .orElse(null);
    }

    @Transactional
    public Transaction completeTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));
        
        if (transaction.isCompleted()) {
            throw new IllegalStateException("Transaction is already completed");
        }

        transaction.setCompleted(true);
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getPendingTransactions() {
        return transactionRepository.findByStatusOrderByTransactionDateDesc("PENDING");
    }

    @Transactional(readOnly = true)
    public List<Transaction> getCompletedTransactions() {
        return transactionRepository.findByStatusOrderByTransactionDateDesc("COMPLETED");
    }
}
