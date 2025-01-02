package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "transaction_item_customizations")
@IdClass(ItemCustomizationId.class)
public class ItemCustomization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Id
    @ManyToOne
    @JoinColumn(name = "transaction_item_id", nullable = false)
    private TransactionItem transactionItem;

    @Id
    @ManyToOne
    @JoinColumn(name = "customization_id", nullable = false)
    private Customization customization;

    @ManyToMany
    @JoinTable(
        name = "transaction_item_customization_options",
        joinColumns = {
            @JoinColumn(name = "item_customization_id", referencedColumnName = "id"),
            @JoinColumn(name = "transaction_item_id", referencedColumnName = "transaction_item_id"),
            @JoinColumn(name = "customization_id", referencedColumnName = "customization_id")
        },
        inverseJoinColumns = @JoinColumn(name = "customization_option_id")
    )
    private List<CustomizationOption> selectedOptions = new ArrayList<>();
}
