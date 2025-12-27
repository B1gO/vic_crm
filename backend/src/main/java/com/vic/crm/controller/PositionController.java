package com.vic.crm.controller;

import com.vic.crm.entity.Position;
import com.vic.crm.service.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @GetMapping
    public List<Position> getAll(@RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String status) {
        if (clientId != null) {
            return positionService.findByClientId(clientId);
        }
        if (vendorId != null) {
            return positionService.findBySourceVendorId(vendorId);
        }
        if (status != null) {
            return positionService.findByStatus(status);
        }
        return positionService.findAll();
    }

    @GetMapping("/open")
    public List<Position> getOpen() {
        return positionService.findOpen();
    }

    @GetMapping("/{id}")
    public Position getById(@PathVariable Long id) {
        return positionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Position create(@RequestBody Position position) {
        return positionService.create(position);
    }

    @PutMapping("/{id}")
    public Position update(@PathVariable Long id, @RequestBody Position position) {
        return positionService.update(id, position);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        positionService.delete(id);
    }
}
