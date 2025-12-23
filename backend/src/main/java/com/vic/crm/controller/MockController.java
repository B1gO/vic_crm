package com.vic.crm.controller;

import com.vic.crm.entity.Mock;
import com.vic.crm.service.MockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mocks")
@CrossOrigin(origins = "*")
public class MockController {

    private final MockService mockService;

    public MockController(MockService mockService) {
        this.mockService = mockService;
    }

    @GetMapping
    public List<Mock> getAll() {
        return mockService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mock> getById(@PathVariable Long id) {
        Mock mock = mockService.findById(id);
        return mock != null ? ResponseEntity.ok(mock) : ResponseEntity.notFound().build();
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Mock> getByCandidateId(@PathVariable Long candidateId) {
        return mockService.findByCandidateId(candidateId);
    }

    @GetMapping("/evaluator/{evaluatorId}")
    public List<Mock> getByEvaluatorId(@PathVariable Long evaluatorId) {
        return mockService.findByEvaluatorId(evaluatorId);
    }

    @PostMapping
    public Mock create(@RequestBody Mock mock) {
        return mockService.create(mock);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mock> update(@PathVariable Long id, @RequestBody Mock mock) {
        Mock updated = mockService.update(id, mock);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
