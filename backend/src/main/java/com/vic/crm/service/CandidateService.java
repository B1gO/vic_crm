package com.vic.crm.service;

import com.vic.crm.dto.TransitionRequest;
import com.vic.crm.entity.Batch;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.TimelineEvent;
import com.vic.crm.entity.User;
import com.vic.crm.enums.CandidateStage;
import com.vic.crm.enums.CandidateSubStatus;
import com.vic.crm.enums.CloseReason;
import com.vic.crm.enums.TimelineEventType;
import com.vic.crm.exception.InvalidTransitionException;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.CandidateRepository;
import com.vic.crm.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private static final Set<CandidateStage> NON_TERMINAL_STAGES = Set.of(
            CandidateStage.SOURCING,
            CandidateStage.TRAINING,
            CandidateStage.MOCKING,
            CandidateStage.MARKETING,
            CandidateStage.OFFERED);

    private static final Map<CandidateStage, Set<CandidateStage>> ALLOWED_TRANSITIONS = Map.of(
            CandidateStage.SOURCING, Set.of(CandidateStage.TRAINING, CandidateStage.MARKETING,
                    CandidateStage.ELIMINATED, CandidateStage.WITHDRAWN, CandidateStage.ON_HOLD),
            CandidateStage.TRAINING, Set.of(CandidateStage.MOCKING, CandidateStage.ELIMINATED,
                    CandidateStage.WITHDRAWN, CandidateStage.ON_HOLD),
            CandidateStage.MOCKING, Set.of(CandidateStage.MARKETING, CandidateStage.ELIMINATED,
                    CandidateStage.WITHDRAWN, CandidateStage.ON_HOLD),
            CandidateStage.MARKETING, Set.of(CandidateStage.OFFERED, CandidateStage.ELIMINATED,
                    CandidateStage.WITHDRAWN, CandidateStage.ON_HOLD),
            CandidateStage.OFFERED, Set.of(CandidateStage.PLACED, CandidateStage.MARKETING,
                    CandidateStage.ELIMINATED, CandidateStage.WITHDRAWN, CandidateStage.ON_HOLD),
            CandidateStage.PLACED, Set.of(CandidateStage.MARKETING, CandidateStage.ELIMINATED, CandidateStage.WITHDRAWN),
            CandidateStage.ELIMINATED, Set.of(CandidateStage.SOURCING, CandidateStage.TRAINING,
                    CandidateStage.MOCKING, CandidateStage.MARKETING, CandidateStage.OFFERED),
            CandidateStage.WITHDRAWN, Set.of(CandidateStage.SOURCING, CandidateStage.TRAINING,
                    CandidateStage.MOCKING, CandidateStage.MARKETING, CandidateStage.OFFERED),
            CandidateStage.ON_HOLD, Set.of(CandidateStage.SOURCING, CandidateStage.TRAINING,
                    CandidateStage.MOCKING, CandidateStage.MARKETING, CandidateStage.OFFERED));

    private static final Map<CandidateStage, Set<CandidateSubStatus>> SUB_STATUS_BY_STAGE = Map.of(
            CandidateStage.SOURCING, Set.of(
                    CandidateSubStatus.SOURCED, CandidateSubStatus.CONTACTED, CandidateSubStatus.SCREENING_SCHEDULED,
                    CandidateSubStatus.SCREENING_PASSED, CandidateSubStatus.SCREENING_FAILED,
                    CandidateSubStatus.TRAINING_CONTRACT_SENT, CandidateSubStatus.TRAINING_CONTRACT_SIGNED,
                    CandidateSubStatus.BATCH_ASSIGNED,
                    CandidateSubStatus.DIRECT_MARKETING_READY),
            CandidateStage.TRAINING, Set.of(
                    CandidateSubStatus.IN_TRAINING),
            CandidateStage.MOCKING, Set.of(
                    CandidateSubStatus.MOCK_THEORY_READY, CandidateSubStatus.MOCK_THEORY_SCHEDULED,
                    CandidateSubStatus.MOCK_THEORY_PASSED, CandidateSubStatus.MOCK_THEORY_FAILED,
                    CandidateSubStatus.MOCK_REAL_SCHEDULED, CandidateSubStatus.MOCK_REAL_PASSED,
                    CandidateSubStatus.MOCK_REAL_FAILED),
            CandidateStage.MARKETING, Set.of(CandidateSubStatus.MARKETING_ACTIVE),
            CandidateStage.OFFERED, Set.of(
                    CandidateSubStatus.OFFER_PENDING, CandidateSubStatus.OFFER_ACCEPTED,
                    CandidateSubStatus.OFFER_DECLINED),
            CandidateStage.ON_HOLD, Set.of(
                    CandidateSubStatus.WAITING_DOCS, CandidateSubStatus.PERSONAL_PAUSE,
                    CandidateSubStatus.VISA_ISSUE, CandidateSubStatus.OTHER),
            CandidateStage.PLACED, Set.of(CandidateSubStatus.PLACED_CONFIRMED),
            CandidateStage.ELIMINATED, Set.of(CandidateSubStatus.CLOSED),
            CandidateStage.WITHDRAWN, Set.of(CandidateSubStatus.SELF_WITHDRAWN));

    private static final Map<CandidateStage, CandidateSubStatus> DEFAULT_SUB_STATUS = Map.of(
            CandidateStage.SOURCING, CandidateSubStatus.SOURCED,
            CandidateStage.TRAINING, CandidateSubStatus.IN_TRAINING,
            CandidateStage.MOCKING, CandidateSubStatus.MOCK_THEORY_READY,
            CandidateStage.MARKETING, CandidateSubStatus.MARKETING_ACTIVE,
            CandidateStage.OFFERED, CandidateSubStatus.OFFER_PENDING,
            CandidateStage.ON_HOLD, CandidateSubStatus.OTHER,
            CandidateStage.PLACED, CandidateSubStatus.PLACED_CONFIRMED,
            CandidateStage.ELIMINATED, CandidateSubStatus.CLOSED,
            CandidateStage.WITHDRAWN, CandidateSubStatus.SELF_WITHDRAWN);

    private final CandidateRepository candidateRepository;
    private final TimelineEventRepository timelineEventRepository;

    public List<Candidate> findAll() {
        return candidateRepository.findAll();
    }

    public Candidate findById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
    }

    public List<Candidate> findByStage(CandidateStage stage) {
        return candidateRepository.findByStage(stage);
    }

    @Transactional
    public Candidate create(Candidate candidate) {
        if (candidate.getStage() == null) {
            candidate.setStage(CandidateStage.SOURCING);
        }
        if (candidate.getSubStatus() == null) {
            candidate.setSubStatus(DEFAULT_SUB_STATUS.get(candidate.getStage()));
        }
        candidate.setStageUpdatedAt(LocalDateTime.now());
        Candidate saved = candidateRepository.save(candidate);

        createTimelineEvent(saved, TimelineEventType.CANDIDATE_CREATED, "Candidate Created",
                "Candidate record created.", null, null, null, saved.getSubStatus(), null, null, null, null);

        if (saved.getStage() == CandidateStage.SOURCING
                && saved.getBatch() != null
                && saved.getSubStatus() != CandidateSubStatus.BATCH_ASSIGNED) {
            saved.setSubStatus(CandidateSubStatus.BATCH_ASSIGNED);
            saved = candidateRepository.save(saved);
            String batchLabel = saved.getBatch().getName() != null
                    ? saved.getBatch().getName()
                    : String.valueOf(saved.getBatch().getId());
            createTimelineEvent(saved, TimelineEventType.BATCH, "Batch Assigned",
                    String.format("Assigned to batch %s.", batchLabel),
                    saved.getStage(), saved.getStage(), "batch_assigned", saved.getSubStatus(),
                    null, null, null, null);
        }

        return saved;
    }

    @Transactional
    public Candidate update(Long id, Candidate updated) {
        Candidate existing = findById(id);
        Batch previousBatch = existing.getBatch();
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setNotes(updated.getNotes());
        existing.setBatch(updated.getBatch());
        existing.setResumeReady(updated.getResumeReady());
        existing.setCompletionRate(updated.getCompletionRate());
        Candidate saved = candidateRepository.save(existing);

        if (previousBatch == null && updated.getBatch() != null && existing.getStage() == CandidateStage.SOURCING) {
            if (saved.getSubStatus() != CandidateSubStatus.BATCH_ASSIGNED) {
                saved.setSubStatus(CandidateSubStatus.BATCH_ASSIGNED);
                saved = candidateRepository.save(saved);
            }
            String title = "Batch Assigned";
            String batchLabel = updated.getBatch().getName() != null
                    ? updated.getBatch().getName()
                    : String.valueOf(updated.getBatch().getId());
            String description = String.format("Assigned to batch %s.", batchLabel);
            createTimelineEvent(saved, TimelineEventType.BATCH, title, description,
                    saved.getStage(), saved.getStage(), "batch_assigned", saved.getSubStatus(),
                    null, null, null, null);
        }

        return saved;
    }

    @Transactional
    public Candidate transition(Long candidateId, TransitionRequest request, User actor) {
        Candidate candidate = findById(candidateId);
        CandidateStage fromStage = candidate.getStage();
        CandidateStage toStage = request.getToStage();

        if (toStage == null) {
            throw new InvalidTransitionException("toStage is required");
        }

        if (!isTransitionAllowed(fromStage, toStage)) {
            throw new InvalidTransitionException(
                    String.format("Transition from %s to %s is not allowed", fromStage, toStage));
        }

        validateTransitionRules(candidate, fromStage, toStage, request);

        CandidateSubStatus nextSubStatus = request.getToSubStatus() != null
                ? request.getToSubStatus()
                : DEFAULT_SUB_STATUS.get(toStage);
        if (!isSubStatusAllowed(toStage, nextSubStatus)) {
            throw new InvalidTransitionException(
                    String.format("SubStatus %s is not allowed for stage %s", nextSubStatus, toStage));
        }

        if (toStage == CandidateStage.ON_HOLD && fromStage != CandidateStage.ON_HOLD) {
            candidate.setLastActiveStage(fromStage);
        }

        candidate.setStage(toStage);
        candidate.setSubStatus(nextSubStatus);
        candidate.setStageUpdatedAt(LocalDateTime.now());
        applyTransitionMetadata(candidate, request);
        if (toStage == CandidateStage.ELIMINATED && !isBlank(request.getReason())) {
            candidate.setCloseReasonNote(request.getReason());
        }

        Candidate saved = candidateRepository.save(candidate);

        TimelineEventType eventType = resolveEventType(fromStage, toStage);
        String title = generateTransitionTitle(fromStage, toStage);

        createTimelineEvent(saved, eventType, title, request.getReason(),
                fromStage, toStage, null, nextSubStatus, request.getCloseReason(),
                actor, null, null);

        return saved;
    }

    @Transactional
    public Candidate updateSubStatus(Long candidateId, CandidateSubStatus subStatus, String reason, User actor) {
        Candidate candidate = findById(candidateId);
        CandidateStage stage = candidate.getStage();

        if (subStatus == null) {
            throw new InvalidTransitionException("subStatus is required");
        }
        if (!isSubStatusAllowed(stage, subStatus)) {
            throw new InvalidTransitionException(
                    String.format("SubStatus %s is not allowed for stage %s", subStatus, stage));
        }
        if (candidate.getSubStatus() == subStatus) {
            return candidate;
        }

        candidate.setSubStatus(subStatus);
        Candidate saved = candidateRepository.save(candidate);

        String title = String.format("Sub-status set to %s", subStatus);
        createTimelineEvent(saved, TimelineEventType.SUBSTATUS_CHANGED, title, reason,
                stage, stage, null, subStatus, null, actor, null, null);

        return saved;
    }

    public List<TimelineEvent> getTimeline(Long candidateId) {
        return timelineEventRepository.findByCandidateIdOrderByEventDateDesc(candidateId);
    }

    @Transactional
    public TimelineEvent addTimelineEvent(Long candidateId, TimelineEventType eventType, String subType,
            String title, String description, CloseReason closeReason, CandidateSubStatus subStatus,
            String metaJson, LocalDateTime eventDate, User actor) {
        Candidate candidate = findById(candidateId);
        return createTimelineEvent(candidate, eventType, title, description,
                null, null, subType, subStatus, closeReason, actor, metaJson, eventDate);
    }

    private void validateTransitionRules(Candidate candidate, CandidateStage fromStage, CandidateStage toStage,
            TransitionRequest request) {
        if (toStage == CandidateStage.TRAINING) {
            requireBatch(candidate.getBatch());
        }

        if (fromStage == CandidateStage.SOURCING && toStage == CandidateStage.MARKETING) {
            if (candidate.getSubStatus() != CandidateSubStatus.DIRECT_MARKETING_READY) {
                throw new InvalidTransitionException("DIRECT_MARKETING_READY is required for direct marketing");
            }
            validateDirectMarketingCompleteness(candidate);
        }

        if (fromStage == CandidateStage.MOCKING && toStage == CandidateStage.MARKETING) {
            if (candidate.getSubStatus() != CandidateSubStatus.MOCK_REAL_PASSED) {
                throw new InvalidTransitionException("MOCK_REAL_PASSED is required to enter MARKETING");
            }
        }

        if (toStage == CandidateStage.PLACED) {
            requireDate(request.getStartDate(), "startDate is required for PLACED");
        }

        if (toStage == CandidateStage.OFFERED && request.getOfferType() == null) {
            throw new InvalidTransitionException("offerType is required for OFFERED");
        }

        if (toStage == CandidateStage.ELIMINATED && request.getCloseReason() == null) {
            throw new InvalidTransitionException("closeReason is required for ELIMINATED");
        }

        if (toStage == CandidateStage.WITHDRAWN && isBlank(request.getWithdrawReason())) {
            throw new InvalidTransitionException("withdrawReason is required for WITHDRAWN");
        }

        if (toStage == CandidateStage.ON_HOLD) {
            if (isBlank(request.getHoldReason()) || request.getNextFollowUpAt() == null) {
                throw new InvalidTransitionException("holdReason and nextFollowUpAt are required for ON_HOLD");
            }
        }

        if ((fromStage == CandidateStage.ELIMINATED || fromStage == CandidateStage.WITHDRAWN)
                && NON_TERMINAL_STAGES.contains(toStage)) {
            if (isBlank(request.getReactivateReason())) {
                throw new InvalidTransitionException("reactivateReason is required to reactivate a candidate");
            }
        }

        if (fromStage == CandidateStage.ON_HOLD
                && candidate.getLastActiveStage() != null
                && toStage != candidate.getLastActiveStage()
                && isBlank(request.getReason())) {
            throw new InvalidTransitionException("reason is required to jump from ON_HOLD to a new stage");
        }

        if (fromStage == CandidateStage.OFFERED && toStage == CandidateStage.MARKETING) {
            requireReason(request.getReason(), "reason is required to return to MARKETING");
        }
        if (fromStage == CandidateStage.PLACED && toStage == CandidateStage.MARKETING) {
            requireReason(request.getReason(), "reason is required to return to MARKETING");
        }
    }

    private void applyTransitionMetadata(Candidate candidate, TransitionRequest request) {
        if (request.getHoldReason() != null) {
            candidate.setHoldReason(request.getHoldReason());
        }
        if (request.getNextFollowUpAt() != null) {
            candidate.setNextFollowUpAt(request.getNextFollowUpAt());
        }
        if (request.getCloseReason() != null) {
            candidate.setCloseReason(request.getCloseReason());
        }
        if (request.getWithdrawReason() != null) {
            candidate.setWithdrawReason(request.getWithdrawReason());
        }
        if (request.getReactivateReason() != null) {
            candidate.setReactivateReason(request.getReactivateReason());
        }
        if (request.getOfferDate() != null) {
            candidate.setOfferDate(request.getOfferDate());
        }
        if (request.getOfferType() != null) {
            candidate.setOfferType(request.getOfferType());
        }
        if (request.getStartDate() != null) {
            candidate.setStartDate(request.getStartDate());
        }
    }

    private void validateDirectMarketingCompleteness(Candidate candidate) {
        if (isBlank(candidate.getName())) {
            throw new InvalidTransitionException("name is required for direct marketing");
        }
        if (isBlank(candidate.getEmail()) && isBlank(candidate.getPhone())) {
            throw new InvalidTransitionException("email or phone is required for direct marketing");
        }
        if (isBlank(candidate.getWorkAuth())) {
            throw new InvalidTransitionException("workAuth is required for direct marketing");
        }
        if (isBlank(candidate.getTechTags())) {
            throw new InvalidTransitionException("techTags is required for direct marketing");
        }
        if (isBlank(candidate.getCity()) && isBlank(candidate.getState())) {
            throw new InvalidTransitionException("city or state is required for direct marketing");
        }
        if (candidate.getResumeReady() == null || !candidate.getResumeReady()) {
            throw new InvalidTransitionException("resumeReady must be true for direct marketing");
        }
    }

    private void requireBatch(Batch batch) {
        if (batch == null) {
            throw new InvalidTransitionException("batch is required for TRAINING");
        }
    }

    private void requireDate(LocalDate date, String message) {
        if (date == null) {
            throw new InvalidTransitionException(message);
        }
    }

    private void requireReason(String reason, String message) {
        if (isBlank(reason)) {
            throw new InvalidTransitionException(message);
        }
    }

    private boolean isTransitionAllowed(CandidateStage from, CandidateStage to) {
        Set<CandidateStage> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    private boolean isSubStatusAllowed(CandidateStage stage, CandidateSubStatus subStatus) {
        Set<CandidateSubStatus> allowed = SUB_STATUS_BY_STAGE.get(stage);
        return allowed != null && allowed.contains(subStatus);
    }

    private TimelineEventType resolveEventType(CandidateStage fromStage, CandidateStage toStage) {
        if (toStage == CandidateStage.ON_HOLD) {
            return TimelineEventType.ON_HOLD;
        }
        if (toStage == CandidateStage.ELIMINATED) {
            return TimelineEventType.ELIMINATED;
        }
        if (toStage == CandidateStage.WITHDRAWN) {
            return TimelineEventType.WITHDRAWN;
        }
        if (toStage == CandidateStage.OFFERED) {
            return TimelineEventType.OFFERED;
        }
        if (toStage == CandidateStage.PLACED) {
            return TimelineEventType.PLACED;
        }
        if (fromStage == CandidateStage.ELIMINATED || fromStage == CandidateStage.WITHDRAWN) {
            return TimelineEventType.REACTIVATED;
        }
        return TimelineEventType.STAGE_CHANGED;
    }

    private String generateTransitionTitle(CandidateStage fromStage, CandidateStage toStage) {
        if (toStage == CandidateStage.ON_HOLD) {
            return "Placed On Hold";
        }
        if (toStage == CandidateStage.ELIMINATED) {
            return "Closed";
        }
        if (toStage == CandidateStage.WITHDRAWN) {
            return "Withdrawn";
        }
        if (fromStage == CandidateStage.ELIMINATED || fromStage == CandidateStage.WITHDRAWN) {
            return "Reactivated";
        }
        return switch (toStage) {
            case TRAINING -> "Joined Training";
            case MOCKING -> "Entered Mocking";
            case MARKETING -> "Entered Marketing";
            case OFFERED -> "Offer Received";
            case PLACED -> "Placed Successfully";
            default -> toStage.toString();
        };
    }

    private TimelineEvent createTimelineEvent(Candidate candidate, TimelineEventType eventType,
            String title, String description, CandidateStage fromStage, CandidateStage toStage,
            String subType, CandidateSubStatus subStatus, CloseReason closeReason, User createdBy,
            String metaJson, LocalDateTime eventDate) {
        TimelineEvent event = TimelineEvent.builder()
                .candidate(candidate)
                .eventType(eventType)
                .subType(subType)
                .title(title)
                .description(description)
                .fromStage(fromStage)
                .toStage(toStage)
                .subStatus(subStatus)
                .closeReason(closeReason)
                .createdBy(createdBy)
                .metaJson(metaJson)
                .eventDate(eventDate)
                .build();
        return timelineEventRepository.save(event);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
