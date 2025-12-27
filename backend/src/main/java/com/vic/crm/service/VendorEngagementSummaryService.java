package com.vic.crm.service;

import com.vic.crm.dto.VendorEngagementResponse;
import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.Opportunity;
import com.vic.crm.entity.PipelineStep;
import com.vic.crm.entity.VendorEngagement;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.AssessmentAttemptRepository;
import com.vic.crm.repository.OpportunityRepository;
import com.vic.crm.repository.PipelineStepRepository;
import com.vic.crm.repository.VendorEngagementRepository;
import com.vic.crm.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VendorEngagementSummaryService {

    private final VendorRepository vendorRepository;
    private final VendorEngagementRepository engagementRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final OpportunityRepository opportunityRepository;
    private final PipelineStepRepository pipelineStepRepository;
    private final OpportunityService opportunityService;

    public List<VendorEngagementResponse> getEngagements(Long vendorId) {
        if (!vendorRepository.existsById(vendorId)) {
            throw new ResourceNotFoundException("Vendor not found: " + vendorId);
        }

        List<VendorEngagement> engagements = engagementRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
        List<VendorEngagementResponse> responses = new ArrayList<>();

        for (VendorEngagement engagement : engagements) {
            VendorEngagementResponse response = new VendorEngagementResponse();
            response.setId(engagement.getId());
            response.setStatus(engagement.getStatus());
            response.setCandidate(toCandidateSummary(engagement.getCandidate()));

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

    private VendorEngagementResponse.CandidateSummary toCandidateSummary(Candidate candidate) {
        VendorEngagementResponse.CandidateSummary summary = new VendorEngagementResponse.CandidateSummary();
        summary.setId(candidate.getId());
        summary.setName(candidate.getName());
        summary.setEmail(candidate.getEmail());
        summary.setPhone(candidate.getPhone());
        return summary;
    }

    private List<VendorEngagementResponse.AssessmentAttemptSummary> toAttemptSummaries(
            List<AssessmentAttempt> attempts) {
        List<VendorEngagementResponse.AssessmentAttemptSummary> summaries = new ArrayList<>();
        for (AssessmentAttempt attempt : attempts) {
            VendorEngagementResponse.AssessmentAttemptSummary summary =
                    new VendorEngagementResponse.AssessmentAttemptSummary();
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

    private List<VendorEngagementResponse.OpportunitySummary> toOpportunitySummaries(
            List<Opportunity> opportunities) {
        List<VendorEngagementResponse.OpportunitySummary> summaries = new ArrayList<>();
        for (Opportunity opportunity : opportunities) {
            Opportunity refreshed = opportunityService.refreshStatusFromSteps(opportunity.getId());
            VendorEngagementResponse.OpportunitySummary summary =
                    new VendorEngagementResponse.OpportunitySummary();
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

    private VendorEngagementResponse.PipelineStepSummary toStepSummary(PipelineStep step) {
        VendorEngagementResponse.PipelineStepSummary summary =
                new VendorEngagementResponse.PipelineStepSummary();
        summary.setId(step.getId());
        summary.setType(step.getType());
        summary.setState(step.getState());
        summary.setResult(step.getResult());
        summary.setHappenedAt(step.getHappenedAt());
        return summary;
    }
}
