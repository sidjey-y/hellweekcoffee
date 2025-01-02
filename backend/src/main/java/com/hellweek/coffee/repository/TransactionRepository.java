package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
    List<Transaction> findByMembershipId(String membershipId);
    List<Transaction> findByStatus(Transaction.TransactionStatus status);
    List<Transaction> findByTransactionDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, Transaction.TransactionStatus status);
    
    @Query("SELECT t FROM Transaction t WHERE t.customer.id = :customerId ORDER BY t.transactionDate DESC")
    List<Transaction> findCustomerTransactionHistory(@Param("customerId") Long customerId);
    
    @Query("SELECT t FROM Transaction t WHERE t.status = :status AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findCompletedTransactionsInDateRange(
        @Param("status") Transaction.TransactionStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
