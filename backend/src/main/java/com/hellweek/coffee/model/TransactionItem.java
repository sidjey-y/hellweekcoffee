package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transaction_items", indexes = {
    @Index(name = "idx_transaction_id", columnList = "transaction_id")
})
@Data
@NoArgsConstructor
public class TransactionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
    
    private int quantity;
    
    private String size;
    
    @OneToMany(mappedBy = "transactionItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCustomization> customizations = new ArrayList<>();
    
    @Column(name = "item_price", precision = 10, scale = 2)
    private BigDecimal itemPrice = BigDecimal.ZERO;
    
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;
    
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public void calculateTotalPrice() {
        BigDecimal baseTotal = itemPrice.multiply(BigDecimal.valueOf(quantity));
        if (customizations != null && !customizations.isEmpty()) {
            BigDecimal customizationTotal = customizations.stream()
                .map(ItemCustomization::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(BigDecimal.valueOf(quantity));
            this.totalPrice = baseTotal.add(customizationTotal);
        } else {
            this.totalPrice = baseTotal;
        }
    }
    
    public void addCustomization(ItemCustomization customization) {
        customizations.add(customization);
        customization.setTransactionItem(this);
    }
    
    public void removeCustomization(ItemCustomization customization) {
        customizations.remove(customization);
        customization.setTransactionItem(null);
    }
}
