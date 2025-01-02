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
    @NotBlank
    private String categoryId;
    
    @NotBlank
    private String name;
    
    private boolean active = true;
} 