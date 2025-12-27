package com.vic.crm.controller;

import com.vic.crm.dto.CreateAssessmentAttemptRequest;
import com.vic.crm.dto.CreateOpportunityRequest;
import com.vic.crm.dto.CreateVendorEngagementRequest;
import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.entity.Opportunity;
import com.vic.crm.entity.VendorEngagement;
import com.vic.crm.enums.AssessmentType;
import com.vic.crm.service.AssessmentAttemptService;
import com.vic.crm.service.OpportunityService;
import com.vic.crm.service.VendorEngagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor-engagements")
@RequiredArgsConstructor
public class VendorEngagementController {

    private final VendorEngagementService engagementService;
    private final AssessmentAttemptService attemptService;
    private final OpportunityService opportunityService;

    @GetMapping("/{id}")
    public VendorEngagement getById(@PathVariable Long id) {
        return engagementService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendorEngagement create(@RequestBody CreateVendorEngagementRequest request) {
        return engagementService.create(request);
    }

    @GetMapping("/{id}/attempts")
    public List<AssessmentAttempt> getAttempts(@PathVariable Long id,
            @RequestParam(required = false) AssessmentType attemptType,
            @RequestParam(required = false) String track,
            @RequestParam(required = false) Integer limit) {
        return attemptService.findByVendorEngagement(id, attemptType, track, limit);
    }

    @PostMapping("/{id}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public AssessmentAttempt createAttempt(@PathVariable Long id,
            @RequestBody CreateAssessmentAttemptRequest request) {
        return attemptService.create(id, request);
    }

    @PostMapping("/{id}/opportunities")
    @ResponseStatus(HttpStatus.CREATED)
    public Opportunity createOpportunity(@PathVariable Long id,
            @RequestBody CreateOpportunityRequest request) {
        return opportunityService.create(id, request);
    }
}
