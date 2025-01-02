package com.hellweek.coffee.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderItemRequest {
    private String itemCode;
    private int quantity;
    private List<OrderCustomizationRequest> customizations;
}
