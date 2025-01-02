package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.TransactionRequest;
import com.hellweek.coffee.dto.OrderItemRequest;
import com.hellweek.coffee.dto.OrderCustomizationRequest;
import com.hellweek.coffee.model.*;
import com.hellweek.coffee.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final CustomizationRepository customizationRepository;
    private final CustomizationOptionRepository customizationOptionRepository;

    @Transactional
    public Transaction createTransaction(TransactionRequest request, User cashier) {
        // Get or create customer
        Customer customer;
        if ("member".equals(request.getCustomerType())) {
            customer = customerRepository.findByMembershipId(request.getMembershipId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        } else {
            customer = new Customer();
            customer.setFirstName(request.getFirstName());
            customer.setMember(false);
            customer = customerRepository.save(customer);
        }

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
        transaction.setCashier(cashier);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTotal(request.getTotal());
        transaction.setStatus(TransactionStatus.COMPLETED);

        // Process items
        List<TransactionItem> transactionItems = new ArrayList<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            Item item = itemRepository.findById(itemRequest.getItemCode())
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

            TransactionItem transactionItem = new TransactionItem();
            transactionItem.setTransaction(transaction);
            transactionItem.setItem(item);
            transactionItem.setQuantity(itemRequest.getQuantity());
            transactionItem.setUnitPrice(item.getBasePrice());

            // Process customizations if any
            if (itemRequest.getCustomizations() != null && !itemRequest.getCustomizations().isEmpty()) {
                List<ItemCustomization> itemCustomizations = new ArrayList<>();
                for (OrderCustomizationRequest custRequest : itemRequest.getCustomizations()) {
                    Customization customization = customizationRepository.findById(custRequest.getCustomizationId())
                        .orElseThrow(() -> new EntityNotFoundException("Customization not found"));

                    List<CustomizationOption> selectedOptions = custRequest.getSelectedOptionIds().stream()
                        .map(optionId -> customizationOptionRepository.findById(optionId)
                            .orElseThrow(() -> new EntityNotFoundException("Customization option not found")))
                        .collect(Collectors.toList());

                    ItemCustomization itemCustomization = new ItemCustomization();
                    itemCustomization.setTransactionItem(transactionItem);
                    itemCustomization.setCustomization(customization);
                    itemCustomization.setSelectedOptions(selectedOptions);
                    itemCustomizations.add(itemCustomization);
                }
                transactionItem.setCustomizations(itemCustomizations);
            }

            transactionItems.add(transactionItem);
        }

        transaction.setItems(transactionItems);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getPendingTransactions() {
        return transactionRepository.findByStatus(TransactionStatus.PENDING);
    }

    public List<Transaction> getCompletedTransactions() {
        return transactionRepository.findByStatus(TransactionStatus.COMPLETED);
    }

    @Transactional
    public Transaction completeTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Transaction is not pending");
        }

        transaction.setStatus(TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
    }
}
