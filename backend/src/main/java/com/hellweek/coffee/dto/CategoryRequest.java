package com.hellweek.coffee.dto;

import com.hellweek.coffee.model.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ItemType type;

    public CategoryRequest(String name, String type) {
        this.name = name;
        this.type = ItemType.valueOf(type);
    }
} 