package com.vic.crm.service;

import com.vic.crm.entity.Mock;
import com.vic.crm.repository.MockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MockService {

    private final MockRepository mockRepository;

    public MockService(MockRepository mockRepository) {
        this.mockRepository = mockRepository;
    }

    public List<Mock> findAll() {
        return mockRepository.findAll();
    }

    public Mock findById(Long id) {
        return mockRepository.findById(id).orElse(null);
    }

    public List<Mock> findByCandidateId(Long candidateId) {
        return mockRepository.findByCandidateIdOrderByScheduledAtDesc(candidateId);
    }

    public List<Mock> findByEvaluatorId(Long evaluatorId) {
        return mockRepository.findByEvaluatorIdOrderByScheduledAtDesc(evaluatorId);
    }

    public Mock create(Mock mock) {
        return mockRepository.save(mock);
    }

    public Mock update(Long id, Mock mock) {
        return mockRepository.findById(id)
                .map(existing -> {
                    // Basic fields
                    if (mock.getScheduledAt() != null) {
                        existing.setScheduledAt(mock.getScheduledAt());
                    }
                    if (mock.getCandidate() != null) {
                        existing.setCandidate(mock.getCandidate());
                    }
                    if (mock.getEvaluator() != null) {
                        existing.setEvaluator(mock.getEvaluator());
                    }

                    // Role and Stage
                    if (mock.getRole() != null) {
                        existing.setRole(mock.getRole());
                    }
                    if (mock.getStage() != null) {
                        existing.setStage(mock.getStage());
                    }

                    // Feedback fields
                    if (mock.getScore() != null) {
                        existing.setScore(mock.getScore());
                    }
                    if (mock.getDecision() != null) {
                        existing.setDecision(mock.getDecision());
                    }
                    if (mock.getStrengths() != null) {
                        existing.setStrengths(mock.getStrengths());
                    }
                    if (mock.getWeaknesses() != null) {
                        existing.setWeaknesses(mock.getWeaknesses());
                    }
                    if (mock.getActionItems() != null) {
                        existing.setActionItems(mock.getActionItems());
                    }
                    if (mock.getSummary() != null) {
                        existing.setSummary(mock.getSummary());
                    }
                    if (mock.getFeedback() != null) {
                        existing.setFeedback(mock.getFeedback());
                    }
                    if (mock.getCompleted() != null) {
                        existing.setCompleted(mock.getCompleted());
                        if (mock.getCompleted()) {
                            existing.setCompletedAt(LocalDateTime.now());
                        }
                    }

                    return mockRepository.save(existing);
                })
                .orElse(null);
    }

    public void delete(Long id) {
        mockRepository.deleteById(id);
    }
}
