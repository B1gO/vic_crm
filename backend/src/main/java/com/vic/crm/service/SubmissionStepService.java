package com.vic.crm.service;

import com.vic.crm.entity.Position;
import com.vic.crm.entity.Submission;
import com.vic.crm.entity.SubmissionStep;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepType;
import com.vic.crm.repository.PositionRepository;
import com.vic.crm.repository.SubmissionRepository;
import com.vic.crm.repository.SubmissionStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionStepService {

    private final SubmissionStepRepository stepRepository;
    private final SubmissionRepository submissionRepository;
    private final PositionRepository positionRepository;

    /**
     * Get all steps for a submission.
     */
    public List<SubmissionStep> findBySubmissionId(Long submissionId) {
        return stepRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId);
    }

    /**
     * Get root steps (no parent) for a submission.
     */
    public List<SubmissionStep> findRootSteps(Long submissionId) {
        return stepRepository.findBySubmissionIdAndParentStepIsNullOrderByCreatedAtAsc(submissionId);
    }

    /**
     * Get child steps of a parent step.
     */
    public List<SubmissionStep> findChildSteps(Long parentStepId) {
        return stepRepository.findByParentStepId(parentStepId);
    }

    /**
     * Get a step by ID.
     */
    public SubmissionStep findById(Long id) {
        return stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubmissionStep not found: " + id));
    }

    /**
     * Add a new step to a submission.
     */
    @Transactional
    public SubmissionStep addStep(Long submissionId, Long parentStepId, StepType type,
            Long positionId, Integer round, LocalDateTime scheduledAt) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        SubmissionStep parentStep = null;
        if (parentStepId != null) {
            parentStep = findById(parentStepId);
        }

        Position position = null;
        if (positionId != null) {
            position = positionRepository.findById(positionId).orElse(null);
        }

        SubmissionStep step = SubmissionStep.builder()
                .submission(submission)
                .parentStep(parentStep)
                .type(type)
                .position(position)
                .round(round)
                .scheduledAt(scheduledAt)
                .result(StepResult.PENDING)
                .build();

        return stepRepository.save(step);
    }

    /**
     * Update step result (Pass/Fail).
     */
    @Transactional
    public SubmissionStep updateResult(Long stepId, StepResult result, String feedback, String score) {
        SubmissionStep step = findById(stepId);
        step.setResult(result);
        step.setFeedback(feedback);
        step.setScore(score);
        if (result != StepResult.PENDING) {
            step.setCompletedAt(LocalDateTime.now());
        }
        return stepRepository.save(step);
    }

    /**
     * Update step schedule.
     */
    @Transactional
    public SubmissionStep updateSchedule(Long stepId, LocalDateTime scheduledAt) {
        SubmissionStep step = findById(stepId);
        step.setScheduledAt(scheduledAt);
        return stepRepository.save(step);
    }

    /**
     * Delete a step (and its children will be orphaned).
     */
    @Transactional
    public void delete(Long stepId) {
        stepRepository.deleteById(stepId);
    }
}
