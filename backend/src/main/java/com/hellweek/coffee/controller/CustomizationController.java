package com.hellweek.coffee.controller;

import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.model.CategoryType;
import com.hellweek.coffee.service.CustomizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/customizations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true", maxAge = 3600)
public class CustomizationController {
    private final CustomizationService customizationService;

    public CustomizationController(CustomizationService customizationService) {
        this.customizationService = customizationService;
    }

    @GetMapping
    public ResponseEntity<List<Customization>> getAllCustomizations() {
        return ResponseEntity.ok(customizationService.getAllCustomizations());
    }

    @GetMapping("/by-category/{categoryType}")
    public Set<Customization> getCustomizationsByCategory(@PathVariable CategoryType categoryType) {
        return customizationService.getCustomizationsByCategory(categoryType);
    }
}
