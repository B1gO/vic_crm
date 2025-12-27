package com.vic.crm.service;

import com.vic.crm.dto.CreatePipelineStepRequest;
import com.vic.crm.dto.UpdatePipelineStepRequest;
import com.vic.crm.entity.Opportunity;
import com.vic.crm.entity.PipelineStep;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import com.vic.crm.enums.StepType;
import com.vic.crm.exception.InvalidTransitionException;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.OpportunityRepository;
import com.vic.crm.repository.PipelineStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PipelineStepService {

    private static final Set<StepType> VENDOR_SIDE_TYPES = Set.of(
            StepType.OA,
            StepType.VENDOR_SCREENING);

    private final PipelineStepRepository stepRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunityService opportunityService;

    public List<PipelineStep> findByOpportunityId(Long opportunityId) {
        return stepRepository.findByOpportunityIdOrderByCreatedAtAsc(opportunityId);
    }

    public PipelineStep findById(Long id) {
        return stepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline step not found: " + id));
    }

    @Transactional
    public PipelineStep create(Long opportunityId, CreatePipelineStepRequest request) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));

        if (request.getType() == null) {
            throw new IllegalArgumentException("type is required");
        }
        validatePipelineStepType(request.getType());

        PipelineStep parent = null;
        if (request.getParentStepId() != null) {
            parent = findById(request.getParentStepId());
            if (!parent.getOpportunity().getId().equals(opportunityId)) {
                throw new IllegalArgumentException("parentStepId must belong to the same opportunity");
            }
        }

        StepState state = request.getState() != null ? request.getState() : StepState.PLANNED;
        StepResult result = request.getResult() != null ? request.getResult() : StepResult.PENDING;
        validateResultState(state, result);

        LocalDateTime happenedAt = request.getHappenedAt();
        if (state == StepState.COMPLETED && happenedAt == null) {
            happenedAt = LocalDateTime.now();
        }

        PipelineStep step = PipelineStep.builder()
                .opportunity(opportunity)
                .parentStep(parent)
                .type(request.getType())
                .state(state)
                .result(result)
                .round(request.getRound())
                .scheduledAt(request.getScheduledAt())
                .happenedAt(happenedAt)
                .feedback(request.getFeedback())
                .score(request.getScore())
                .build();

        PipelineStep saved = stepRepository.save(step);
        opportunityService.refreshStatusFromSteps(opportunityId);
        return saved;
    }

    @Transactional
    public PipelineStep update(Long stepId, UpdatePipelineStepRequest request) {
        PipelineStep step = findById(stepId);

        if (request.getState() != null) {
            step.setState(request.getState());
        }
        if (request.getResult() != null) {
            step.setResult(request.getResult());
        }
        if (request.getScheduledAt() != null) {
            step.setScheduledAt(request.getScheduledAt());
        }
        if (request.getHappenedAt() != null) {
            step.setHappenedAt(request.getHappenedAt());
        }
        if (request.getFeedback() != null) {
            step.setFeedback(request.getFeedback());
        }
        if (request.getScore() != null) {
            step.setScore(request.getScore());
        }

        validateResultState(step.getState(), step.getResult());

        if (step.getState() == StepState.COMPLETED && step.getHappenedAt() == null) {
            step.setHappenedAt(LocalDateTime.now());
        }

        PipelineStep saved = stepRepository.save(step);
        opportunityService.refreshStatusFromSteps(step.getOpportunity().getId());
        return saved;
    }

    private void validatePipelineStepType(StepType type) {
        if (VENDOR_SIDE_TYPES.contains(type)) {
            throw new InvalidTransitionException("Vendor-side step types are not allowed in pipeline steps");
        }
    }

    private void validateResultState(StepState state, StepResult result) {
        if (state != StepState.COMPLETED && result != StepResult.PENDING) {
            throw new InvalidTransitionException("Result can only be PASS/FAIL when state is COMPLETED");
        }
    }
}
