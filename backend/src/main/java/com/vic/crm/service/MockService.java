package com.vic.crm.service;

import com.vic.crm.entity.Mock;
import com.vic.crm.repository.MockRepository;
import org.springframework.stereotype.Service;

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
        return mockRepository.findByCandidateId(candidateId);
    }

    public List<Mock> findByEvaluatorId(Long evaluatorId) {
        return mockRepository.findByEvaluatorId(evaluatorId);
    }

    public Mock create(Mock mock) {
        return mockRepository.save(mock);
    }

    public Mock update(Long id, Mock mock) {
        return mockRepository.findById(id)
                .map(existing -> {
                    existing.setScore(mock.getScore());
                    existing.setFeedback(mock.getFeedback());
                    existing.setScheduledAt(mock.getScheduledAt());
                    if (mock.getCandidate() != null) {
                        existing.setCandidate(mock.getCandidate());
                    }
                    if (mock.getEvaluator() != null) {
                        existing.setEvaluator(mock.getEvaluator());
                    }
                    return mockRepository.save(existing);
                })
                .orElse(null);
    }

    public void delete(Long id) {
        mockRepository.deleteById(id);
    }
}
