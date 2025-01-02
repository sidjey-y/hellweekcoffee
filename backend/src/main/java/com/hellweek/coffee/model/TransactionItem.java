package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transaction_items")
@Data
@NoArgsConstructor
public class TransactionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
    
    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;
    
    private int quantity;
    
    private String size;
    
    @ElementCollection
    @CollectionTable(
        name = "transaction_item_customizations",
        joinColumns = @JoinColumn(name = "transaction_item_id")
    )
    private List<ItemCustomization> customizations = new ArrayList<>();
    
    private double itemPrice;
    
    private double totalPrice;
    
    @Embeddable
    @Data
    @NoArgsConstructor
    public static class ItemCustomization {
        private String name;
        private String option;
        private double price;
    }
}
