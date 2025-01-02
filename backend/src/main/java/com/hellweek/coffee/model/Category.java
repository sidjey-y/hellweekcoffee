package com.hellweek.coffee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Category {
    @Id
    @NotBlank(message = "Category ID is required")
    private String id;
    
    @NotBlank(message = "Category name is required")
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type")
    private ItemType type;
    
    private boolean active = true;
}
