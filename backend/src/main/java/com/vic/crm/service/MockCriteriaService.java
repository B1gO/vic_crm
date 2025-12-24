package com.vic.crm.service;

import com.vic.crm.entity.MockCriteria;
import com.vic.crm.repository.MockCriteriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MockCriteriaService {

    private final MockCriteriaRepository criteriaRepository;

    public List<MockCriteria> getAll() {
        return criteriaRepository.findAllByOrderByRoleAscStageAscDisplayOrderAsc();
    }

    public List<MockCriteria> getByRoleAndStage(String role, String stage) {
        return criteriaRepository.findByRoleAndStageAndActiveTrueOrderByDisplayOrderAsc(role, stage);
    }

    public Optional<MockCriteria> getById(Long id) {
        return criteriaRepository.findById(id);
    }

    public MockCriteria create(MockCriteria criteria) {
        return criteriaRepository.save(criteria);
    }

    public MockCriteria update(Long id, MockCriteria criteria) {
        return criteriaRepository.findById(id)
                .map(existing -> {
                    existing.setRole(criteria.getRole());
                    existing.setStage(criteria.getStage());
                    existing.setName(criteria.getName());
                    existing.setDescription(criteria.getDescription());
                    existing.setDisplayOrder(criteria.getDisplayOrder());
                    existing.setActive(criteria.getActive());
                    return criteriaRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("MockCriteria not found: " + id));
    }

    public void delete(Long id) {
        criteriaRepository.deleteById(id);
    }
}
