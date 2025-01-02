package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionItem> items = new ArrayList<>();
    
    private LocalDateTime transactionDate = LocalDateTime.now();
    
    private double totalAmount;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.PENDING;
    
    private String membershipId;
    
    private boolean isGuestOrder;
    
    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        CANCELLED
    }
}
