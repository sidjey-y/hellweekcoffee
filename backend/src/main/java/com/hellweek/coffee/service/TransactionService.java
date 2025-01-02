package com.hellweek.coffee.service;

import com.hellweek.coffee.model.Transaction;
import com.hellweek.coffee.model.TransactionItem;
import com.hellweek.coffee.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Calculate total amount
        BigDecimal total = transaction.getItems().stream()
            .map(TransactionItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        transaction.setTotalAmount(total);
        
        // Set transaction reference in items
        transaction.getItems().forEach(item -> item.setTransaction(transaction));
        
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByTransactionDateBetween(start, end);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByMembershipId(String membershipId) {
        return transactionRepository.findByMembershipId(membershipId);
    }

    @Transactional
    public Transaction updateTransactionStatus(String id, Transaction.TransactionStatus status) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }
}
