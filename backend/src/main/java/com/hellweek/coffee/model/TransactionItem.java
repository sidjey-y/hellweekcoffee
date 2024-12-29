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

    @ElementCollection
    @CollectionTable(
        name = "transaction_item_customizations",
        joinColumns = @JoinColumn(name = "transaction_item_id")
    )
    @Column(name = "customization_option_id")
    private List<Long> selectedCustomizationOptions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
        name = "transaction_item_customization_notes",
        joinColumns = @JoinColumn(name = "transaction_item_id")
    )
    @Column(name = "note")
    private List<String> customizationNotes = new ArrayList<>();

    public double getSubtotal() {
        return unitPrice * quantity;
    }

    public void addCustomizationOption(Long optionId, String note) {
        selectedCustomizationOptions.add(optionId);
        customizationNotes.add(note);
    }

    public boolean hasSameCustomizations(TransactionItem other) {
        if (size != null ? !size.equals(other.size) : other.size != null) {
            return false;
        }
        
        if (selectedCustomizationOptions.size() != other.selectedCustomizationOptions.size()) {
            return false;
        }

        return selectedCustomizationOptions.containsAll(other.selectedCustomizationOptions) &&
               other.selectedCustomizationOptions.containsAll(selectedCustomizationOptions);
    }
}
