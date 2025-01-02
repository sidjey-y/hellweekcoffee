package com.hellweek.coffee.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
public class Category {
    @Id
    private String id;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    private ItemType type;
    
    private boolean active = true;
}
