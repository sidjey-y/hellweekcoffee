package com.hellweek.coffee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "customizations")
public class Customization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Customization name is required")
    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType applicableType; // FOOD or DRINK only

    @OneToMany(mappedBy = "customization", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomizationOption> options;

    @ManyToMany(mappedBy = "availableCustomizations")
    private List<Item> items;

    public enum ItemType {
        FOOD,
        DRINK
    }

    @PrePersist
    @PreUpdate
    protected void validateCustomization() {
        if (options != null && options.size() > 5) {
            throw new IllegalStateException("A customization cannot have more than 5 options");
        }
    }
}
