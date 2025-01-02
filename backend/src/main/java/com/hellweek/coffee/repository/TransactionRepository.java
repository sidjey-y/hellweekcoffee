package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
    List<Transaction> findByMembershipId(String membershipId);
    List<Transaction> findByStatus(Transaction.TransactionStatus status);
}
