package com.vic.crm.service;

import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.StageTransition;
import com.vic.crm.entity.User;
import com.vic.crm.enums.LifecycleStage;
import com.vic.crm.exception.InvalidTransitionException;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.CandidateRepository;
import com.vic.crm.repository.StageTransitionRepository;
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
    private final StageTransitionRepository stageTransitionRepository;

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
        return candidateRepository.save(candidate);
    }

    @Transactional
    public Candidate update(Long id, Candidate updated) {
        Candidate existing = findById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setNotes(updated.getNotes());
        existing.setBatches(updated.getBatches());
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

        // Log the transition
        StageTransition transition = StageTransition.builder()
                .candidate(candidate)
                .fromStage(fromStage)
                .toStage(toStage)
                .reason(reason)
                .changedBy(changedBy)
                .build();
        stageTransitionRepository.save(transition);

        // Update candidate stage
        candidate.setLifecycleStage(toStage);
        return candidateRepository.save(candidate);
    }

    private boolean isTransitionAllowed(LifecycleStage from, LifecycleStage to) {
        Set<LifecycleStage> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    /**
     * Additional business rules for Stage Gate.
     * Currently simplified - no mock requirements.
     */
    private void validateStageGateRules(Candidate candidate, LifecycleStage toStage) {
        // Stage Gate rules can be added here in the future
        // Example: require certain conditions before transitioning
    }

    public List<StageTransition> getTransitionHistory(Long candidateId) {
        return stageTransitionRepository.findByCandidateIdOrderByChangedAtDesc(candidateId);
    }

    @Transactional
    public Candidate assignToBatch(Long candidateId, Long batchId) {
        Candidate candidate = findById(candidateId);
        com.vic.crm.entity.Batch batch = new com.vic.crm.entity.Batch();
        batch.setId(batchId);
        candidate.getBatches().add(batch);
        return candidateRepository.save(candidate);
    }
}
