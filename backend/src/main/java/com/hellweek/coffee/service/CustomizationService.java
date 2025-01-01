package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.CustomizationRequest;
import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.model.CustomizationOption;
import com.hellweek.coffee.repository.CustomizationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomizationService {
    private final CustomizationRepository customizationRepository;

    @Transactional
    public Customization createCustomization(CustomizationRequest request) {
        if (customizationRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Customization name already exists");
        }

        Customization customization = new Customization();
        customization.setName(request.getName());
        customization.setDescription(request.getDescription());
        customization.setApplicableType(request.getApplicableType());

        List<CustomizationOption> options = new ArrayList<>();
        if (request.getOptions() != null) {
            for (CustomizationRequest.CustomizationOptionRequest optionRequest : request.getOptions()) {
                CustomizationOption option = new CustomizationOption();
                option.setName(optionRequest.getName());
                option.setPrice(optionRequest.getPrice());
                option.setCustomization(customization);
                options.add(option);
            }
        }
        customization.setOptions(options);

        return customizationRepository.save(customization);
    }

    @Transactional
    public Customization updateCustomization(Long id, CustomizationRequest request) {
        Customization customization = customizationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Customization not found"));

        if (!customization.getName().equals(request.getName()) && 
            customizationRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Customization name already exists");
        }

        customization.setName(request.getName());
        customization.setDescription(request.getDescription());
        customization.setApplicableType(request.getApplicableType());

        // Update options
        customization.getOptions().clear();
        if (request.getOptions() != null) {
            for (CustomizationRequest.CustomizationOptionRequest optionRequest : request.getOptions()) {
                CustomizationOption option = new CustomizationOption();
                option.setName(optionRequest.getName());
                option.setPrice(optionRequest.getPrice());
                option.setCustomization(customization);
                customization.getOptions().add(option);
            }
        }

        return customizationRepository.save(customization);
    }

    @Transactional
    public void deleteCustomization(Long id) {
        Customization customization = customizationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Customization not found"));
        customizationRepository.delete(customization);
    }

    public List<Customization> getCustomizationsByType(Customization.ItemType type) {
        return customizationRepository.findByApplicableType(type);
    }

    public Customization getCustomization(Long id) {
        return customizationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Customization not found"));
    }
}
