package com.hellweek.coffee.dto;

import com.hellweek.coffee.model.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.Map;
import java.util.Set;

@Data
public class ItemRequest {
    @NotBlank(message = "Item name is required")
    private String name;

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private Double basePrice;

    @NotNull(message = "Item type is required")
    private ItemType type;

    private Map<String, Double> sizePrices;

    private Set<Long> availableCustomizations;

    private String description;
    
    private boolean active = true;
}
