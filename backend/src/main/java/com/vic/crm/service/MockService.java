package com.vic.crm.service;

import com.vic.crm.dto.TransitionRequest;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.Mock;
import com.vic.crm.enums.CandidateStage;
import com.vic.crm.enums.CandidateSubStatus;
import com.vic.crm.enums.TimelineEventType;
import com.vic.crm.exception.InvalidTransitionException;
import com.vic.crm.repository.MockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MockService {

    private static final String STAGE_SCREENING = "screening";
    private static final String STAGE_THEORY = "techmock";
    private static final String STAGE_REAL = "realmock";

    private final MockRepository mockRepository;
    private final CandidateService candidateService;

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

    @Transactional
    public Mock create(Mock mock) {
        Mock saved = mockRepository.save(mock);
        applyMockScheduled(saved);
        return saved;
    }

    @Transactional
    public Mock update(Long id, Mock mock) {
        return mockRepository.findById(id)
                .map(existing -> {
                    boolean wasCompleted = Boolean.TRUE.equals(existing.getCompleted());

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

                    Mock saved = mockRepository.save(existing);
                    if (!wasCompleted && Boolean.TRUE.equals(saved.getCompleted())) {
                        applyMockCompleted(saved);
                    }
                    return saved;
                })
                .orElse(null);
    }

    public void delete(Long id) {
        mockRepository.deleteById(id);
    }

    private void applyMockScheduled(Mock mock) {
        if (mock.getCandidate() == null || mock.getCandidate().getId() == null) {
            return;
        }
        Candidate candidate = candidateService.findById(mock.getCandidate().getId());
        String stage = normalizeStage(mock.getStage());

        if (STAGE_SCREENING.equals(stage)) {
            requireStage(candidate, CandidateStage.SOURCING, "Screening mock requires SOURCING stage");
            candidateService.updateSubStatus(candidate.getId(), CandidateSubStatus.SCREENING_SCHEDULED,
                    "Screening mock scheduled", null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.MOCK, "screening_scheduled",
                    "Screening Mock Scheduled", "Screening mock scheduled.", null,
                    CandidateSubStatus.SCREENING_SCHEDULED, null, null, null);
            return;
        }

        if (STAGE_THEORY.equals(stage)) {
            requireStage(candidate, CandidateStage.MOCKING, "Theory mock requires MOCKING stage");
            if (candidate.getSubStatus() != CandidateSubStatus.MOCK_THEORY_READY
                    && candidate.getSubStatus() != CandidateSubStatus.MOCK_THEORY_FAILED) {
                throw new InvalidTransitionException("MOCK_THEORY_READY or MOCK_THEORY_FAILED is required to schedule theory mock");
            }
            candidateService.updateSubStatus(candidate.getId(), CandidateSubStatus.MOCK_THEORY_SCHEDULED,
                    "Theory mock scheduled", null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.MOCK, "theory_scheduled",
                    "Theory Mock Scheduled", "Theory mock scheduled.", null,
                    CandidateSubStatus.MOCK_THEORY_SCHEDULED, null, null, null);
            return;
        }

        if (STAGE_REAL.equals(stage)) {
            requireStage(candidate, CandidateStage.MOCKING, "Real mock requires MOCKING stage");
            if (candidate.getSubStatus() != CandidateSubStatus.MOCK_THEORY_PASSED) {
                throw new InvalidTransitionException("MOCK_THEORY_PASSED is required to schedule real mock");
            }
            candidateService.updateSubStatus(candidate.getId(), CandidateSubStatus.MOCK_REAL_SCHEDULED,
                    "Real mock scheduled", null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.MOCK, "real_scheduled",
                    "Real Mock Scheduled", "Real mock scheduled.", null,
                    CandidateSubStatus.MOCK_REAL_SCHEDULED, null, null, null);
        }
    }

    private void applyMockCompleted(Mock mock) {
        if (mock.getCandidate() == null || mock.getCandidate().getId() == null) {
            return;
        }
        Candidate candidate = candidateService.findById(mock.getCandidate().getId());
        String stage = normalizeStage(mock.getStage());
        boolean passed = isPassingDecision(mock.getDecision());

        if (STAGE_SCREENING.equals(stage)) {
            requireStage(candidate, CandidateStage.SOURCING, "Screening mock completion requires SOURCING stage");
            if (candidate.getSubStatus() != CandidateSubStatus.SCREENING_SCHEDULED) {
                throw new InvalidTransitionException("SCREENING_SCHEDULED is required to complete screening mock");
            }
            CandidateSubStatus next = passed ? CandidateSubStatus.SCREENING_PASSED : CandidateSubStatus.SCREENING_FAILED;
            candidateService.updateSubStatus(candidate.getId(), next, "Screening mock completed", null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.MOCK,
                    passed ? "screening_passed" : "screening_failed",
                    passed ? "Screening Passed" : "Screening Failed",
                    "Screening mock completed.", null, next, null, null, null);
            return;
        }

        if (STAGE_THEORY.equals(stage)) {
            requireStage(candidate, CandidateStage.MOCKING, "Theory mock completion requires MOCKING stage");
            if (candidate.getSubStatus() != CandidateSubStatus.MOCK_THEORY_SCHEDULED) {
                throw new InvalidTransitionException("MOCK_THEORY_SCHEDULED is required to complete theory mock");
            }
            CandidateSubStatus next = passed ? CandidateSubStatus.MOCK_THEORY_PASSED : CandidateSubStatus.MOCK_THEORY_FAILED;
            candidateService.updateSubStatus(candidate.getId(), next, "Theory mock completed", null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.MOCK,
                    passed ? "theory_passed" : "theory_failed",
                    passed ? "Theory Mock Passed" : "Theory Mock Failed",
                    "Theory mock completed.", null, next, null, null, null);
            return;
        }

        if (STAGE_REAL.equals(stage)) {
            requireStage(candidate, CandidateStage.MOCKING, "Real mock completion requires MOCKING stage");
            if (candidate.getSubStatus() != CandidateSubStatus.MOCK_REAL_SCHEDULED) {
                throw new InvalidTransitionException("MOCK_REAL_SCHEDULED is required to complete real mock");
            }
            CandidateSubStatus next = passed ? CandidateSubStatus.MOCK_REAL_PASSED : CandidateSubStatus.MOCK_REAL_FAILED;
            candidateService.updateSubStatus(candidate.getId(), next, "Real mock completed", null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.MOCK,
                    passed ? "real_passed" : "real_failed",
                    passed ? "Real Mock Passed" : "Real Mock Failed",
                    "Real mock completed.", null, next, null, null, null);
            if (passed) {
                TransitionRequest request = new TransitionRequest();
                request.setToStage(CandidateStage.MARKETING);
                request.setReason("Real mock passed");
                candidateService.transition(candidate.getId(), request, null);
            }
        }
    }

    private boolean isPassingDecision(String decision) {
        if (decision == null) {
            return false;
        }
        String normalized = decision.trim().toLowerCase(Locale.US);
        return normalized.equals("strong hire") || normalized.equals("hire");
    }

    private String normalizeStage(String stage) {
        if (stage == null) {
            return "";
        }
        return stage.trim().toLowerCase(Locale.US);
    }

    private void requireStage(Candidate candidate, CandidateStage expected, String message) {
        if (candidate.getStage() != expected) {
            throw new InvalidTransitionException(message);
        }
    }
}
