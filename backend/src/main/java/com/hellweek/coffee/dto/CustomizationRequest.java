package com.hellweek.coffee.dto;

import com.hellweek.coffee.model.Customization;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class CustomizationRequest {
    @NotBlank(message = "Customization name is required")
    private String name;

    private String description;

    @NotNull(message = "Applicable item type is required")
    private Customization.ItemType applicableType;

    @Valid
    @Size(max = 5, message = "A customization cannot have more than 5 options")
    private List<CustomizationOptionRequest> options;

    @Data
    public static class CustomizationOptionRequest {
        @NotBlank(message = "Option name is required")
        private String name;

        @NotNull(message = "Price is required")
        private Double price;
    }
}
