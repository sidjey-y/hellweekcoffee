package com.hellweek.coffee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Data
@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String code;

    @NotBlank(message = "Item name is required")
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @ElementCollection
    @CollectionTable(name = "item_size_prices", 
                    joinColumns = @JoinColumn(name = "item_code"))
    @MapKeyColumn(name = "size")
    @Column(name = "price")
    private Map<String, Double> sizePrices = new HashMap<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "item_customizations",
        joinColumns = @JoinColumn(name = "item_code"),
        inverseJoinColumns = @JoinColumn(name = "customization_id")
    )
    private Set<Customization> availableCustomizations = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;

    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public double getPriceForSize(String size) {
        if (size == null || !sizePrices.containsKey(size)) {
            return basePrice;
        }
        return sizePrices.get(size);
    }
}
