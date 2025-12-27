package com.vic.crm.controller;

import com.vic.crm.dto.CreateAttemptLinkRequest;
import com.vic.crm.dto.CreatePipelineStepRequest;
import com.vic.crm.entity.Opportunity;
import com.vic.crm.entity.OpportunityAttemptLink;
import com.vic.crm.entity.PipelineStep;
import com.vic.crm.service.OpportunityService;
import com.vic.crm.service.PipelineStepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
@RequiredArgsConstructor
public class OpportunityController {

    private final OpportunityService opportunityService;
    private final PipelineStepService pipelineStepService;

    @GetMapping("/{id}")
    public Opportunity getById(@PathVariable Long id) {
        return opportunityService.findById(id);
    }

    @GetMapping("/{id}/steps")
    public List<PipelineStep> getSteps(@PathVariable Long id) {
        return pipelineStepService.findByOpportunityId(id);
    }

    @GetMapping("/{id}/attempt-links")
    public List<OpportunityAttemptLink> getAttemptLinks(@PathVariable Long id) {
        return opportunityService.getAttemptLinks(id);
    }

    @PostMapping("/{id}/steps")
    @ResponseStatus(HttpStatus.CREATED)
    public PipelineStep createStep(@PathVariable Long id,
            @RequestBody CreatePipelineStepRequest request) {
        return pipelineStepService.create(id, request);
    }

    @PostMapping("/{id}/attempt-links")
    @ResponseStatus(HttpStatus.CREATED)
    public List<OpportunityAttemptLink> addAttemptLink(@PathVariable Long id,
            @RequestBody CreateAttemptLinkRequest request) {
        return opportunityService.attachAttempts(id, List.of(request.getAttemptId()));
    }

    @DeleteMapping("/{id}/attempt-links/{attemptId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeAttemptLink(@PathVariable Long id, @PathVariable Long attemptId) {
        opportunityService.detachAttempt(id, attemptId);
    }
}
