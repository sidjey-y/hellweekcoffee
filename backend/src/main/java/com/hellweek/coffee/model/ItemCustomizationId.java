package com.hellweek.coffee.model;

import lombok.Data;
import java.io.Serializable;

@Data
public class ItemCustomizationId implements Serializable {
    private Long id;
    private Long transactionItem; // This should match the ID type of TransactionItem
    private Long customization;   // This should match the ID type of Customization

    // Default constructor
    public ItemCustomizationId() {}

    // Constructor with all fields
    public ItemCustomizationId(Long id, Long transactionItem, Long customization) {
        this.id = id;
        this.transactionItem = transactionItem;
        this.customization = customization;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ItemCustomizationId that = (ItemCustomizationId) o;

        if (!id.equals(that.id)) return false;
        if (!transactionItem.equals(that.transactionItem)) return false;
        return customization.equals(that.customization);
    }

    @Override
    public int hashCode() {
        int result = id.hashCode();
        result = 31 * result + transactionItem.hashCode();
        result = 31 * result + customization.hashCode();
        return result;
    }
}
