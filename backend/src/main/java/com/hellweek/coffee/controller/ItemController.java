package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.ErrorResponse;
import com.hellweek.coffee.dto.ItemRequest;
import com.hellweek.coffee.model.Item;
import com.hellweek.coffee.model.ItemType;
import com.hellweek.coffee.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/items", "/items"})
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ItemController {
    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);
    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<?> createItem(@Valid @RequestBody ItemRequest request) {
        try {
            logger.info("Creating new item: {}", request.getName());
            Item item = itemService.createItem(request);
            logger.info("Item created successfully: {}", item.getCode());
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            logger.error("Error creating item: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Error creating item: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllItems(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String categoryId) {
        try {
            logger.info("Fetching all items. Active: {}, CategoryId: {}", active, categoryId);
            List<Item> items = itemService.getAllItems(active, categoryId);
            logger.info("Found {} items", items.size());
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            logger.error("Error fetching items: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Error fetching items: " + e.getMessage()));
        }
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getItemByCode(@PathVariable String code) {
        try {
            logger.info("Fetching item by code: {}", code);
            Item item = itemService.getItemByCode(code);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            logger.error("Error fetching item {}: {}", code, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Error fetching item: " + e.getMessage()));
        }
    }

    @PutMapping("/{code}")
    public ResponseEntity<?> updateItem(
            @PathVariable String code,
            @Valid @RequestBody ItemRequest request) {
        try {
            logger.info("Updating item {}: {}", code, request.getName());
            Item item = itemService.updateItem(code, request);
            logger.info("Item updated successfully: {}", code);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            logger.error("Error updating item {}: {}", code, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Error updating item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteItem(@PathVariable String code) {
        try {
            logger.info("Deleting item: {}", code);
            itemService.deleteItem(code);
            logger.info("Item deleted successfully: {}", code);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting item {}: {}", code, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Error deleting item: " + e.getMessage()));
        }
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<?> getItemsByType(@PathVariable ItemType type) {
        try {
            logger.info("Fetching items by type: {}", type);
            List<Item> items = itemService.getItemsByType(type);
            logger.info("Found {} items of type {}", items.size(), type);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            logger.error("Error fetching items by type {}: {}", type, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Error fetching items by type: " + e.getMessage()));
        }
    }
}
