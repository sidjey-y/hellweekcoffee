package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @OneToMany(mappedBy = "transaction", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private List<TransactionItem> items = new ArrayList<>();
    
    private LocalDateTime transactionDate = LocalDateTime.now();
    
    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.PENDING;
    
    @Column(name = "membership_id")
    private String membershipId;
    
    @Column(name = "is_guest_order")
    private boolean isGuestOrder;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public void calculateTotalAmount() {
        this.totalAmount = items.stream()
            .map(TransactionItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public void addItem(TransactionItem item) {
        items.add(item);
        item.setTransaction(this);
    }
    
    public void removeItem(TransactionItem item) {
        items.remove(item);
        item.setTransaction(null);
    }
    
    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        CANCELLED
    }
    
    public enum PaymentMethod {
        CASH,
        CREDIT_CARD,
        DEBIT_CARD,
        MOBILE_PAYMENT
    }
}
