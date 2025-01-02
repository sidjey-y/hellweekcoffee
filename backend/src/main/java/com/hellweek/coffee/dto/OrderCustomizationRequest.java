package com.hellweek.coffee.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderCustomizationRequest {
    @NotNull(message = "Customization ID is required")
    private Long customizationId;

    @NotEmpty(message = "Selected options cannot be empty")
    private List<Long> selectedOptionIds;
}
