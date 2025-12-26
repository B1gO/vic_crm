package com.vic.crm.controller;

import com.vic.crm.entity.Submission;
import com.vic.crm.entity.SubmissionEvent;
import com.vic.crm.enums.SubmissionStatus;
import com.vic.crm.service.SubmissionService;
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

    // ===== Status Update Endpoints =====

    /**
     * Update submission status directly.
     */
    @PostMapping("/{id}/status")
    public Submission updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        SubmissionStatus status = SubmissionStatus.valueOf((String) payload.get("status"));
        String notes = (String) payload.get("notes");
        String result = (String) payload.get("result");
        Integer round = payload.get("round") != null ? ((Number) payload.get("round")).intValue() : null;
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.updateStatus(id, status, notes, result, round, actorId);
    }

    /**
     * Get submission timeline events.
     */
    @GetMapping("/{id}/events")
    public List<SubmissionEvent> getEvents(@PathVariable Long id) {
        return submissionService.getEvents(id);
    }

    // ===== OA Endpoints =====

    @PostMapping("/{id}/oa/schedule")
    public Submission scheduleOa(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        LocalDateTime scheduledAt = LocalDateTime.parse((String) payload.get("scheduledAt"));
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.scheduleOa(id, scheduledAt, actorId);
    }

    @PostMapping("/{id}/oa/result")
    public Submission recordOaResult(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        boolean passed = (Boolean) payload.get("passed");
        String score = (String) payload.get("score");
        String feedback = (String) payload.get("feedback");
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.recordOaResult(id, passed, score, feedback, actorId);
    }

    // ===== Vendor Screening Endpoints =====

    @PostMapping("/{id}/vendor-screening/schedule")
    public Submission scheduleVendorScreening(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        LocalDateTime scheduledAt = LocalDateTime.parse((String) payload.get("scheduledAt"));
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.scheduleVendorScreening(id, scheduledAt, actorId);
    }

    @PostMapping("/{id}/vendor-screening/result")
    public Submission recordVendorScreeningResult(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        boolean passed = (Boolean) payload.get("passed");
        String feedback = (String) payload.get("feedback");
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.recordVendorScreeningResult(id, passed, feedback, actorId);
    }

    // ===== Interview Endpoints =====

    @PostMapping("/{id}/interview/schedule")
    public Submission scheduleInterview(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        int round = ((Number) payload.get("round")).intValue();
        LocalDateTime scheduledAt = LocalDateTime.parse((String) payload.get("scheduledAt"));
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.scheduleInterview(id, round, scheduledAt, actorId);
    }

    @PostMapping("/{id}/interview/result")
    public Submission recordInterviewResult(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        int round = ((Number) payload.get("round")).intValue();
        boolean passed = (Boolean) payload.get("passed");
        String feedback = (String) payload.get("feedback");
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.recordInterviewResult(id, round, passed, feedback, actorId);
    }

    // ===== Offer Endpoints =====

    @PostMapping("/{id}/offer")
    public Submission recordOffer(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String offerDetails = (String) payload.get("offerDetails");
        LocalDateTime offerDate = payload.get("offerDate") != null
                ? LocalDateTime.parse((String) payload.get("offerDate"))
                : null;
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.recordOffer(id, offerDetails, offerDate, actorId);
    }

    @PostMapping("/{id}/offer/respond")
    public Submission respondToOffer(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        boolean accepted = (Boolean) payload.get("accepted");
        String notes = (String) payload.get("notes");
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        return submissionService.respondToOffer(id, accepted, notes, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        submissionService.delete(id);
    }
}
