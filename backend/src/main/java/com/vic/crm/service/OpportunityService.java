package com.vic.crm.service;

import com.vic.crm.dto.CreateOpportunityRequest;
import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.entity.Opportunity;
import com.vic.crm.entity.OpportunityAttemptLink;
import com.vic.crm.entity.PipelineStep;
import com.vic.crm.entity.Position;
import com.vic.crm.entity.VendorEngagement;
import com.vic.crm.enums.OpportunityStatus;
import com.vic.crm.enums.StepState;
import com.vic.crm.enums.StepType;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.AssessmentAttemptRepository;
import com.vic.crm.repository.OpportunityAttemptLinkRepository;
import com.vic.crm.repository.OpportunityRepository;
import com.vic.crm.repository.PipelineStepRepository;
import com.vic.crm.repository.PositionRepository;
import com.vic.crm.repository.VendorEngagementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final VendorEngagementRepository engagementRepository;
    private final PositionRepository positionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final OpportunityAttemptLinkRepository linkRepository;
    private final PipelineStepRepository pipelineStepRepository;

    public Opportunity findById(Long id) {
        return opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + id));
    }

    @Transactional
    public Opportunity create(Long engagementId, CreateOpportunityRequest request) {
        VendorEngagement engagement = engagementRepository.findById(engagementId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor engagement not found: " + engagementId));

        if (request.getPositionId() == null) {
            throw new IllegalArgumentException("positionId is required");
        }

        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new ResourceNotFoundException("Position not found: " + request.getPositionId()));

        Opportunity opportunity = Opportunity.builder()
                .vendorEngagement(engagement)
                .position(position)
                .submittedAt(request.getSubmittedAt() != null ? request.getSubmittedAt() : LocalDateTime.now())
                .status(OpportunityStatus.ACTIVE)
                .build();

        Opportunity saved = opportunityRepository.save(opportunity);

        if (request.getAttachAttemptIds() != null && !request.getAttachAttemptIds().isEmpty()) {
            attachAttempts(saved.getId(), request.getAttachAttemptIds());
        }

        return saved;
    }

    @Transactional
    public List<OpportunityAttemptLink> attachAttempts(Long opportunityId, List<Long> attemptIds) {
        Opportunity opportunity = findById(opportunityId);
        List<OpportunityAttemptLink> created = new ArrayList<>();
        for (Long attemptId : attemptIds) {
            if (attemptId == null) {
                throw new IllegalArgumentException("attemptId is required");
            }
            AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Assessment attempt not found: " + attemptId));
            if (!attempt.getVendorEngagement().getId().equals(opportunity.getVendorEngagement().getId())) {
                throw new IllegalArgumentException("Attempt does not belong to the same vendor engagement");
            }

            boolean exists = linkRepository.findByOpportunityIdAndAttemptId(opportunityId, attemptId).isPresent();
            if (!exists) {
                OpportunityAttemptLink link = OpportunityAttemptLink.builder()
                        .opportunity(opportunity)
                        .attempt(attempt)
                        .build();
                created.add(linkRepository.save(link));
            }
        }
        return created;
    }

    public List<OpportunityAttemptLink> getAttemptLinks(Long opportunityId) {
        findById(opportunityId);
        return linkRepository.findByOpportunityId(opportunityId);
    }

    @Transactional
    public void detachAttempt(Long opportunityId, Long attemptId) {
        findById(opportunityId);
        linkRepository.deleteByOpportunityIdAndAttemptId(opportunityId, attemptId);
    }

    @Transactional
    public Opportunity refreshStatusFromSteps(Long opportunityId) {
        Opportunity opportunity = findById(opportunityId);
        if (opportunity.getStatusOverride() != null) {
            return opportunity;
        }
        List<PipelineStep> steps = pipelineStepRepository.findByOpportunityIdOrderByCreatedAtAsc(opportunityId);
        OpportunityStatus derived = deriveStatus(steps);
        if (derived != opportunity.getStatus()) {
            opportunity.setStatus(derived);
            return opportunityRepository.save(opportunity);
        }
        return opportunity;
    }

    private OpportunityStatus deriveStatus(List<PipelineStep> steps) {
        boolean hasInterview = steps.stream().anyMatch(step -> step.getType() == StepType.CLIENT_INTERVIEW);
        boolean hasOffer = steps.stream().anyMatch(step -> isCompletedOffer(step));
        boolean hasPlaced = steps.stream().anyMatch(step -> isCompletedPlaced(step));

        if (hasPlaced) {
            return OpportunityStatus.PLACED;
        }
        if (hasOffer) {
            return OpportunityStatus.OFFERED;
        }
        if (hasInterview) {
            return OpportunityStatus.INTERVIEWING;
        }
        return OpportunityStatus.ACTIVE;
    }

    private boolean isCompletedOffer(PipelineStep step) {
        if (step.getState() != StepState.COMPLETED) {
            return false;
        }
        return step.getType() == StepType.OFFER || step.getType() == StepType.OFFER_ACCEPTED;
    }

    private boolean isCompletedPlaced(PipelineStep step) {
        return step.getState() == StepState.COMPLETED && step.getType() == StepType.PLACED;
    }
}
