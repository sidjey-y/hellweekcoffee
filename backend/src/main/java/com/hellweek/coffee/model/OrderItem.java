package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private double unitPrice;

    private String size;

    @ElementCollection
    @CollectionTable(
        name = "order_item_customizations",
        joinColumns = @JoinColumn(name = "order_item_id")
    )
    private List<String> customizations = new ArrayList<>();

    private String notes;

    public boolean hasSameCustomizations(OrderItem other) {
        if (this == other) return true;
        if (other == null) return false;
        
        if (!Objects.equals(size, other.size)) return false;
        if (customizations == null && other.customizations == null) return true;
        if (customizations == null || other.customizations == null) return false;
        
        return customizations.equals(other.customizations);
    }

    public void addCustomization(String customization) {
        if (customizations == null) {
            customizations = new ArrayList<>();
        }
        customizations.add(customization);
    }
}
