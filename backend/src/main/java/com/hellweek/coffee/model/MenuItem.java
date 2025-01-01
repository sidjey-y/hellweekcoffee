package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Table(name = "menu_items")
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private double basePrice;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private boolean available = true;

    private String imageUrl;

    @ElementCollection
    @CollectionTable(
        name = "menu_item_sizes",
        joinColumns = @JoinColumn(name = "menu_item_id")
    )
    @MapKeyColumn(name = "size")
    @Column(name = "price_adjustment")
    private Map<String, Double> sizePriceAdjustments = new HashMap<>();

    @ElementCollection
    @CollectionTable(
        name = "menu_item_customizations",
        joinColumns = @JoinColumn(name = "menu_item_id")
    )
    @MapKeyColumn(name = "customization")
    @Column(name = "price_adjustment")
    private Map<String, Double> customizationPriceAdjustments = new HashMap<>();

    public double getPriceForSize(String size) {
        if (size == null || !sizePriceAdjustments.containsKey(size)) {
            return basePrice;
        }
        return basePrice + sizePriceAdjustments.get(size);
    }

    public double getCustomizationPrice(String customization) {
        return customizationPriceAdjustments.getOrDefault(customization, 0.0);
    }
}
