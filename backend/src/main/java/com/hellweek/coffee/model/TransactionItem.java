package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "transaction_items")
public class TransactionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private int quantity;

    private String size; // For drinks

    @Column(name = "unit_price", nullable = false)
    private double unitPrice;

    @OneToMany(mappedBy = "transactionItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCustomization> customizations = new ArrayList<>();

    public double getSubtotal() {
        double customizationsTotal = customizations.stream()
            .flatMap(customization -> customization.getSelectedOptions().stream())
            .mapToDouble(CustomizationOption::getPrice)
            .sum();
        return (unitPrice + customizationsTotal) * quantity;
    }

    public boolean hasSameCustomizations(TransactionItem other) {
        if (size != null ? !size.equals(other.size) : other.size != null) {
            return false;
        }

        if (customizations.size() != other.customizations.size()) {
            return false;
        }

        // Compare customizations
        return customizations.stream().allMatch(customization ->
            other.customizations.stream().anyMatch(otherCustomization ->
                customization.getCustomization().equals(otherCustomization.getCustomization()) &&
                customization.getSelectedOptions().equals(otherCustomization.getSelectedOptions())
            )
        );
    }
}
