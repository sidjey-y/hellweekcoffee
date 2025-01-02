package com.hellweek.coffee.controller;

import com.hellweek.coffee.model.Transaction;
import com.hellweek.coffee.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.createTransaction(transaction));
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(start, end));
    }

    @GetMapping("/by-membership/{membershipId}")
    public ResponseEntity<List<Transaction>> getTransactionsByMembershipId(
            @PathVariable String membershipId) {
        return ResponseEntity.ok(transactionService.getTransactionsByMembershipId(membershipId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Transaction> updateTransactionStatus(
            @PathVariable String id,
            @RequestParam Transaction.TransactionStatus status) {
        return ResponseEntity.ok(transactionService.updateTransactionStatus(id, status));
    }
}
