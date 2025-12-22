package com.vic.crm.service;

import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.TimelineEvent;
import com.vic.crm.entity.User;
import com.vic.crm.enums.CloseReason;
import com.vic.crm.enums.LifecycleStage;
import com.vic.crm.enums.TimelineEventType;
import com.vic.crm.exception.InvalidTransitionException;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.CandidateRepository;
import com.vic.crm.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final TimelineEventRepository timelineEventRepository;

    // Define allowed transitions (Stage Gate rules)
    private static final Map<LifecycleStage, Set<LifecycleStage>> ALLOWED_TRANSITIONS = Map.of(
            LifecycleStage.RECRUITMENT, Set.of(LifecycleStage.TRAINING, LifecycleStage.ELIMINATED),
            LifecycleStage.TRAINING, Set.of(LifecycleStage.MARKET_READY, LifecycleStage.ELIMINATED),
            LifecycleStage.MARKET_READY, Set.of(LifecycleStage.PLACED, LifecycleStage.ELIMINATED),
            LifecycleStage.PLACED, Set.of(),
            LifecycleStage.ELIMINATED, Set.of());

    public List<Candidate> findAll() {
        return candidateRepository.findAll();
    }

    public Candidate findById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
    }

    public List<Candidate> findByStage(LifecycleStage stage) {
        return candidateRepository.findByLifecycleStage(stage);
    }

    @Transactional
    public Candidate create(Candidate candidate) {
        if (candidate.getLifecycleStage() == null) {
            candidate.setLifecycleStage(LifecycleStage.RECRUITMENT);
        }
        Candidate saved = candidateRepository.save(candidate);

        // Create initial timeline event: Contract Signed
        createTimelineEvent(saved, TimelineEventType.CONTRACT, "contract_signed",
                null, null, null, "Contract Signed", "Officially onboarded.", null);

        return saved;
    }

    @Transactional
    public Candidate update(Long id, Candidate updated) {
        Candidate existing = findById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setNotes(updated.getNotes());
        existing.setBatch(updated.getBatch());
        return candidateRepository.save(existing);
    }

    /**
     * Transition a candidate to a new lifecycle stage.
     * Validates Stage Gate rules before allowing the transition.
     */
    @Transactional
    public Candidate transition(Long candidateId, LifecycleStage toStage, String reason, User changedBy) {
        Candidate candidate = findById(candidateId);
        LifecycleStage fromStage = candidate.getLifecycleStage();

        // Validate transition is allowed
        if (!isTransitionAllowed(fromStage, toStage)) {
            throw new InvalidTransitionException(
                    String.format("Transition from %s to %s is not allowed", fromStage, toStage));
        }

        // Additional Stage Gate validations
        validateStageGateRules(candidate, toStage);

        // Generate title based on transition
        String title = generateTransitionTitle(toStage);

        // Create timeline event for stage change
        createTimelineEvent(candidate, TimelineEventType.STAGE_CHANGE, null,
                fromStage, toStage, null, title, reason, changedBy);

        // Update candidate stage
        candidate.setLifecycleStage(toStage);
        return candidateRepository.save(candidate);
    }

    private String generateTransitionTitle(LifecycleStage toStage) {
        return switch (toStage) {
            case TRAINING -> "Joined Training";
            case MARKET_READY -> "Unlocked Marketing";
            case PLACED -> "Placed Successfully";
            case ELIMINATED -> "Closed";
            default -> toStage.toString();
        };
    }

    private boolean isTransitionAllowed(LifecycleStage from, LifecycleStage to) {
        Set<LifecycleStage> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    private void validateStageGateRules(Candidate candidate, LifecycleStage toStage) {
        // Stage Gate rules can be added here in the future
    }

    public List<TimelineEvent> getTimeline(Long candidateId) {
        return timelineEventRepository.findByCandidateIdOrderByEventDateDesc(candidateId);
    }

    /**
     * Add a custom timeline event (e.g., COMMUNICATION, READINESS)
     */
    @Transactional
    public TimelineEvent addTimelineEvent(Long candidateId, TimelineEventType eventType,
            String subType, String title, String description, CloseReason closeReason, User createdBy) {
        Candidate candidate = findById(candidateId);
        return createTimelineEvent(candidate, eventType, subType, null, null, closeReason, title, description,
                createdBy);
    }

    private TimelineEvent createTimelineEvent(Candidate candidate, TimelineEventType eventType,
            String subType, LifecycleStage fromStage, LifecycleStage toStage, CloseReason closeReason,
            String title, String description, User createdBy) {
        TimelineEvent event = TimelineEvent.builder()
                .candidate(candidate)
                .eventType(eventType)
                .subType(subType)
                .fromStage(fromStage)
                .toStage(toStage)
                .closeReason(closeReason)
                .title(title)
                .description(description)
                .createdBy(createdBy)
                .build();
        return timelineEventRepository.save(event);
    }
}
