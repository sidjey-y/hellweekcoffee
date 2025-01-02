package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Transaction;
import com.hellweek.coffee.model.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByStatus(TransactionStatus status);
    List<Transaction> findByStatusOrderByTransactionDateDesc(TransactionStatus status);
    
    @Query("SELECT t FROM Transaction t WHERE t.customer.id = :customerId ORDER BY t.transactionDate DESC")
    List<Transaction> findCustomerTransactionHistory(@Param("customerId") Long customerId);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> findCompletedTransactionsInDateRange(
        @Param("status") TransactionStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = :status " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    long countCompletedTransactionsInDateRange(
        @Param("status") TransactionStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(t.total) FROM Transaction t WHERE t.status = :status " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    Double calculateTotalRevenueInDateRange(
        @Param("status") TransactionStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
