package com.hellweek.coffee.dto;

import com.hellweek.coffee.model.ItemType;
import lombok.Data;
import java.util.Map;

@Data
public class CustomizationRequest {
    private String id;
    private String name;
    private Map<String, Double> optionsWithPrices;
    private ItemType applicableType;
    private boolean active;
}
