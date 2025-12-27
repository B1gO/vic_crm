package com.vic.crm.service;

import com.vic.crm.dto.CandidateEngagementResponse;
import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.entity.Opportunity;
import com.vic.crm.entity.PipelineStep;
import com.vic.crm.entity.Vendor;
import com.vic.crm.entity.VendorEngagement;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.AssessmentAttemptRepository;
import com.vic.crm.repository.CandidateRepository;
import com.vic.crm.repository.OpportunityRepository;
import com.vic.crm.repository.PipelineStepRepository;
import com.vic.crm.repository.VendorEngagementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CandidateEngagementService {

    private final CandidateRepository candidateRepository;
    private final VendorEngagementRepository engagementRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final OpportunityRepository opportunityRepository;
    private final PipelineStepRepository pipelineStepRepository;
    private final OpportunityService opportunityService;

    public List<CandidateEngagementResponse> getEngagements(Long candidateId) {
        if (!candidateRepository.existsById(candidateId)) {
            throw new ResourceNotFoundException("Candidate not found: " + candidateId);
        }

        List<VendorEngagement> engagements = engagementRepository.findByCandidateId(candidateId);
        List<CandidateEngagementResponse> responses = new ArrayList<>();

        for (VendorEngagement engagement : engagements) {
            CandidateEngagementResponse response = new CandidateEngagementResponse();
            response.setId(engagement.getId());
            response.setStatus(engagement.getStatus());
            response.setVendor(toVendorSummary(engagement.getVendor()));

            List<AssessmentAttempt> attempts = attemptRepository
                    .findByVendorEngagementIdOrderByHappenedAtDesc(engagement.getId());
            response.setAttempts(toAttemptSummaries(attempts));

            List<Opportunity> opportunities = opportunityRepository
                    .findByVendorEngagementIdOrderBySubmittedAtDesc(engagement.getId());
            response.setOpportunities(toOpportunitySummaries(opportunities));

            responses.add(response);
        }

        return responses;
    }

    private CandidateEngagementResponse.VendorSummary toVendorSummary(Vendor vendor) {
        CandidateEngagementResponse.VendorSummary summary = new CandidateEngagementResponse.VendorSummary();
        summary.setId(vendor.getId());
        summary.setCompanyName(vendor.getCompanyName());
        summary.setContactName(vendor.getContactName());
        summary.setEmail(vendor.getEmail());
        summary.setPhone(vendor.getPhone());
        return summary;
    }

    private List<CandidateEngagementResponse.AssessmentAttemptSummary> toAttemptSummaries(
            List<AssessmentAttempt> attempts) {
        List<CandidateEngagementResponse.AssessmentAttemptSummary> summaries = new ArrayList<>();
        for (AssessmentAttempt attempt : attempts) {
            CandidateEngagementResponse.AssessmentAttemptSummary summary =
                    new CandidateEngagementResponse.AssessmentAttemptSummary();
            summary.setId(attempt.getId());
            summary.setAttemptType(attempt.getAttemptType());
            summary.setTrack(attempt.getTrack());
            summary.setState(attempt.getState());
            summary.setResult(attempt.getResult());
            summary.setHappenedAt(attempt.getHappenedAt());
            summaries.add(summary);
        }
        return summaries;
    }

    private List<CandidateEngagementResponse.OpportunitySummary> toOpportunitySummaries(
            List<Opportunity> opportunities) {
        List<CandidateEngagementResponse.OpportunitySummary> summaries = new ArrayList<>();
        for (Opportunity opportunity : opportunities) {
            Opportunity refreshed = opportunityService.refreshStatusFromSteps(opportunity.getId());
            CandidateEngagementResponse.OpportunitySummary summary =
                    new CandidateEngagementResponse.OpportunitySummary();
            summary.setId(refreshed.getId());
            summary.setPositionId(refreshed.getPosition().getId());
            summary.setPositionTitle(refreshed.getPosition().getTitle());
            summary.setClientId(refreshed.getPosition().getClient().getId());
            summary.setClientName(refreshed.getPosition().getClient().getCompanyName());
            summary.setStatus(refreshed.getStatus());
            summary.setSubmittedAt(refreshed.getSubmittedAt());

            Optional<PipelineStep> latest = pipelineStepRepository
                    .findFirstByOpportunityIdOrderByHappenedAtDescCreatedAtDesc(refreshed.getId());
            latest.ifPresent(step -> summary.setLatestStep(toStepSummary(step)));
            summaries.add(summary);
        }
        return summaries;
    }

    private CandidateEngagementResponse.PipelineStepSummary toStepSummary(PipelineStep step) {
        CandidateEngagementResponse.PipelineStepSummary summary =
                new CandidateEngagementResponse.PipelineStepSummary();
        summary.setId(step.getId());
        summary.setType(step.getType());
        summary.setState(step.getState());
        summary.setResult(step.getResult());
        summary.setHappenedAt(step.getHappenedAt());
        return summary;
    }
}
