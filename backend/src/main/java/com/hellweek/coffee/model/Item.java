package com.hellweek.coffee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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
    @Column(length = 15)
    private String code;

    @NotBlank(message = "Item name is required")
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity cannot be negative")
    @Column(nullable = false)
    private Integer quantity = 0;

    @ManyToMany
    @JoinTable(
        name = "item_customizations",
        joinColumns = @JoinColumn(name = "item_code"),
        inverseJoinColumns = @JoinColumn(name = "customization_id")
    )
    @JsonIgnoreProperties({"items", "options", "hibernateLazyInitializer", "handler"})
    private Set<Customization> availableCustomizations = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "item_size_prices", 
                    joinColumns = @JoinColumn(name = "item_code"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "size")
    @Column(name = "price")
    private Map<Size, Double> sizePrices = new HashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;

    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public double getPriceForSize(Size size) {
        if (size == null || !sizePrices.containsKey(size)) {
            return basePrice;
        }
        return sizePrices.get(size);
    }

    public void calculateSizePrices() {
        if (isDrinkType()) {
            sizePrices.put(Size.SMALL, Math.round(basePrice * 0.8 * 100.0) / 100.0);
            sizePrices.put(Size.MEDIUM, basePrice);
            sizePrices.put(Size.LARGE, Math.round((basePrice * 1.2 + 20) * 100.0) / 100.0);
        } else {
            sizePrices.clear();
        }
    }

    public boolean isDrinkType() {
        return type == ItemType.DRINKS;
    }
}
