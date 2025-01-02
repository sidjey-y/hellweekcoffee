package com.hellweek.coffee.dto;

import com.hellweek.coffee.model.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.util.Set;

@Data
public class ItemRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ItemType type;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private Double basePrice;

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    private String description;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity cannot be negative")
    private Integer quantity = 0;

    private boolean active = true;

    private Set<String> availableCustomizations;
}
