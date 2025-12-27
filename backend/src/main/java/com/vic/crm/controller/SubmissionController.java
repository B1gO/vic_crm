package com.vic.crm.controller;

import com.vic.crm.entity.Submission;
import com.vic.crm.entity.SubmissionStep;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepType;
import com.vic.crm.enums.SubmissionStatus;
import com.vic.crm.service.SubmissionService;
import com.vic.crm.service.SubmissionStepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionStepService stepService;

    @GetMapping
    public List<Submission> getAll() {
        return submissionService.findAll();
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Submission> getByCandidateId(@PathVariable Long candidateId) {
        return submissionService.findByCandidateId(candidateId);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Submission> getByVendorId(@PathVariable Long vendorId) {
        return submissionService.findByVendorId(vendorId);
    }

    @GetMapping("/{id}")
    public Submission getById(@PathVariable Long id) {
        return submissionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Submission create(@RequestBody Submission submission) {
        return submissionService.create(submission);
    }

    @PutMapping("/{id}")
    public Submission update(@PathVariable Long id, @RequestBody Submission submission) {
        return submissionService.update(id, submission);
    }

    /**
     * Manually update submission status.
     */
    @PutMapping("/{id}/status")
    public Submission updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        SubmissionStatus status = SubmissionStatus.valueOf(payload.get("status"));
        return submissionService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        submissionService.delete(id);
    }

    // ===== Step Endpoints =====

    /**
     * Get all steps for a submission.
     */
    @GetMapping("/{id}/steps")
    public List<SubmissionStep> getSteps(@PathVariable Long id) {
        return stepService.findBySubmissionId(id);
    }

    /**
     * Add a step to a submission.
     */
    @PostMapping("/{id}/steps")
    @ResponseStatus(HttpStatus.CREATED)
    public SubmissionStep addStep(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Long parentStepId = payload.get("parentStepId") != null
                ? ((Number) payload.get("parentStepId")).longValue()
                : null;
        StepType type = StepType.valueOf((String) payload.get("type"));
        Long positionId = payload.get("positionId") != null
                ? ((Number) payload.get("positionId")).longValue()
                : null;
        Integer round = payload.get("round") != null
                ? ((Number) payload.get("round")).intValue()
                : null;
        LocalDateTime scheduledAt = payload.get("scheduledAt") != null
                ? LocalDateTime.parse((String) payload.get("scheduledAt"))
                : null;

        return stepService.addStep(id, parentStepId, type, positionId, round, scheduledAt);
    }

    /**
     * Update step result (Pass/Fail).
     */
    @PutMapping("/steps/{stepId}/result")
    public SubmissionStep updateStepResult(@PathVariable Long stepId, @RequestBody Map<String, Object> payload) {
        StepResult result = StepResult.valueOf((String) payload.get("result"));
        String feedback = (String) payload.get("feedback");
        String score = (String) payload.get("score");
        return stepService.updateResult(stepId, result, feedback, score);
    }

    /**
     * Update step schedule.
     */
    @PutMapping("/steps/{stepId}/schedule")
    public SubmissionStep updateStepSchedule(@PathVariable Long stepId, @RequestBody Map<String, Object> payload) {
        LocalDateTime scheduledAt = LocalDateTime.parse((String) payload.get("scheduledAt"));
        return stepService.updateSchedule(stepId, scheduledAt);
    }

    /**
     * Delete a step.
     */
    @DeleteMapping("/steps/{stepId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStep(@PathVariable Long stepId) {
        stepService.delete(stepId);
    }
}
