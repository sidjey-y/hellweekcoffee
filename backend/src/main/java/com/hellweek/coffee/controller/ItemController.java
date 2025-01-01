package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.ItemRequest;
import com.hellweek.coffee.model.Item;
import com.hellweek.coffee.model.ItemType;
import com.hellweek.coffee.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ItemController {
    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<Item> createItem(@Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(itemService.createItem(request));
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String categoryId) {
        return ResponseEntity.ok(itemService.getAllItems(active, categoryId));
    }

    @GetMapping("/{code}")
    public ResponseEntity<Item> getItemByCode(@PathVariable String code) {
        return ResponseEntity.ok(itemService.getItemByCode(code));
    }

    @PutMapping("/{code}")
    public ResponseEntity<Item> updateItem(
            @PathVariable String code,
            @Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(itemService.updateItem(code, request));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteItem(@PathVariable String code) {
        itemService.deleteItem(code);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<Item>> getItemsByType(@PathVariable ItemType type) {
        return ResponseEntity.ok(itemService.getItemsByType(type));
    }
}
