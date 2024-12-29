package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.TransactionRequest;
import com.hellweek.coffee.model.Transaction;
import com.hellweek.coffee.model.User;
import com.hellweek.coffee.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
        @Valid @RequestBody TransactionRequest request,
        @AuthenticationPrincipal User user
    ) {
        Transaction transaction = transactionService.createTransaction(request, user);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Transaction>> getPendingTransactions() {
        return ResponseEntity.ok(transactionService.getPendingTransactions());
    }

    @GetMapping("/completed")
    public ResponseEntity<List<Transaction>> getCompletedTransactions() {
        return ResponseEntity.ok(transactionService.getCompletedTransactions());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Transaction> completeTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.completeTransaction(id));
    }
}
