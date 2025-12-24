package com.vic.crm.controller;

import com.vic.crm.entity.MockCriteria;
import com.vic.crm.service.MockCriteriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mock-criteria")
@RequiredArgsConstructor
public class MockCriteriaController {

    private final MockCriteriaService criteriaService;

    @GetMapping
    public List<MockCriteria> getAll() {
        return criteriaService.getAll();
    }

    @GetMapping("/by-role-stage")
    public List<MockCriteria> getByRoleAndStage(
            @RequestParam String role,
            @RequestParam String stage) {
        return criteriaService.getByRoleAndStage(role, stage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MockCriteria> getById(@PathVariable Long id) {
        return criteriaService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MockCriteria create(@RequestBody MockCriteria criteria) {
        return criteriaService.create(criteria);
    }

    @PutMapping("/{id}")
    public MockCriteria update(@PathVariable Long id, @RequestBody MockCriteria criteria) {
        return criteriaService.update(id, criteria);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        criteriaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
