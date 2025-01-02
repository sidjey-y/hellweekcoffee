package com.hellweek.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.Set;
import java.util.HashSet;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
public class Customization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String code;
    
    private String name;
    
    @OneToMany(mappedBy = "customization", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties({"customization", "hibernateLazyInitializer", "handler"})
    private Set<CustomizationOption> options = new HashSet<>();
    
    @Enumerated(EnumType.STRING)
    private CategoryType categoryType;
    
    private boolean active;

    public void addOption(CustomizationOption option) {
        options.add(option);
        option.setCustomization(this);
    }

    public void removeOption(CustomizationOption option) {
        options.remove(option);
        option.setCustomization(null);
    }
}
