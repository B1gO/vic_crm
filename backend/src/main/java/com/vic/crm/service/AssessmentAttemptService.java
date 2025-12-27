package com.vic.crm.service;

import com.vic.crm.dto.CreateAssessmentAttemptRequest;
import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.entity.VendorEngagement;
import com.vic.crm.enums.AssessmentType;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import com.vic.crm.exception.InvalidTransitionException;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.AssessmentAttemptRepository;
import com.vic.crm.repository.VendorEngagementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssessmentAttemptService {

    private final AssessmentAttemptRepository attemptRepository;
    private final VendorEngagementRepository engagementRepository;

    public List<AssessmentAttempt> findByVendorEngagement(Long engagementId,
            AssessmentType attemptType, String track, Integer limit) {
        List<AssessmentAttempt> attempts = attemptRepository.findFiltered(engagementId, attemptType, track);
        if (limit != null && limit > 0 && attempts.size() > limit) {
            return attempts.subList(0, limit);
        }
        return attempts;
    }

    @Transactional
    public AssessmentAttempt create(Long engagementId, CreateAssessmentAttemptRequest request) {
        VendorEngagement engagement = engagementRepository.findById(engagementId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor engagement not found: " + engagementId));

        if (request.getAttemptType() == null) {
            throw new IllegalArgumentException("attemptType is required");
        }

        StepState state = request.getState() != null ? request.getState() : StepState.PLANNED;
        StepResult result = request.getResult() != null ? request.getResult() : StepResult.PENDING;
        validateResultState(state, result);

        LocalDateTime happenedAt = request.getHappenedAt();
        if (state == StepState.COMPLETED && happenedAt == null) {
            happenedAt = LocalDateTime.now();
        }

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .vendorEngagement(engagement)
                .attemptType(request.getAttemptType())
                .track(request.getTrack())
                .state(state)
                .result(result)
                .happenedAt(happenedAt)
                .notes(request.getNotes())
                .build();

        return attemptRepository.save(attempt);
    }

    public AssessmentAttempt findById(Long id) {
        return attemptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment attempt not found: " + id));
    }

    @Transactional
    public AssessmentAttempt update(Long attemptId, com.vic.crm.dto.UpdateAssessmentAttemptRequest request) {
        AssessmentAttempt attempt = findById(attemptId);

        if (request.getState() != null) {
            attempt.setState(request.getState());
        }
        if (request.getResult() != null) {
            attempt.setResult(request.getResult());
        }
        if (request.getHappenedAt() != null) {
            attempt.setHappenedAt(request.getHappenedAt());
        }
        if (request.getNotes() != null) {
            attempt.setNotes(request.getNotes());
        }

        validateResultState(attempt.getState(), attempt.getResult());

        if (attempt.getState() == StepState.COMPLETED && attempt.getHappenedAt() == null) {
            attempt.setHappenedAt(LocalDateTime.now());
        }

        return attemptRepository.save(attempt);
    }

    private void validateResultState(StepState state, StepResult result) {
        if (state != StepState.COMPLETED && result != StepResult.PENDING) {
            throw new InvalidTransitionException("Result can only be PASS/FAIL when state is COMPLETED");
        }
    }
}
