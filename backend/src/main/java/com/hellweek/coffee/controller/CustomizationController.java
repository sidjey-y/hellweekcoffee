package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.CustomizationRequest;
import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.service.CustomizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customizations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomizationController {
    private final CustomizationService customizationService;

    @PostMapping
    public ResponseEntity<Customization> createCustomization(@Valid @RequestBody CustomizationRequest request) {
        return ResponseEntity.ok(customizationService.createCustomization(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customization> updateCustomization(
            @PathVariable Long id,
            @Valid @RequestBody CustomizationRequest request) {
        return ResponseEntity.ok(customizationService.updateCustomization(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomization(@PathVariable Long id) {
        customizationService.deleteCustomization(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Customization>> getCustomizationsByType(
            @PathVariable Customization.ItemType type) {
        return ResponseEntity.ok(customizationService.getCustomizationsByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customization> getCustomization(@PathVariable Long id) {
        return ResponseEntity.ok(customizationService.getCustomization(id));
    }
}
