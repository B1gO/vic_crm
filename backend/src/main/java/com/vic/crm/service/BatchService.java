package com.vic.crm.service;

import com.vic.crm.dto.TransitionRequest;
import com.vic.crm.entity.Batch;
import com.vic.crm.entity.Candidate;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.enums.CandidateStage;
import com.vic.crm.enums.TimelineEventType;
import com.vic.crm.repository.BatchRepository;
import com.vic.crm.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateService candidateService;

    public List<Batch> findAll() {
        return batchRepository.findAll();
    }

    public Batch findById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }

    public Batch create(Batch batch) {
        return batchRepository.save(batch);
    }

    public Batch update(Long id, Batch updated) {
        Batch existing = findById(id);
        existing.setName(updated.getName());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setTrainer(updated.getTrainer());
        return batchRepository.save(existing);
    }

    @Transactional
    public Batch startBatch(Long id) {
        Batch batch = findById(id);
        List<Candidate> candidates = candidateRepository.findByBatchId(id);
        for (Candidate candidate : candidates) {
            if (candidate.getStage() != CandidateStage.SOURCING) {
                continue;
            }
            TransitionRequest request = new TransitionRequest();
            request.setToStage(CandidateStage.TRAINING);
            request.setReason("Batch started");
            Candidate updated = candidateService.transition(candidate.getId(), request, null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.BATCH, "batch_started",
                    "Batch Started", "Batch training started.", null, updated.getSubStatus(), null, null, null);
        }
        return batch;
    }

    @Transactional
    public Batch endBatch(Long id) {
        Batch batch = findById(id);
        List<Candidate> candidates = candidateRepository.findByBatchId(id);
        for (Candidate candidate : candidates) {
            if (candidate.getStage() != CandidateStage.TRAINING) {
                continue;
            }
            TransitionRequest request = new TransitionRequest();
            request.setToStage(CandidateStage.RESUME);
            request.setReason("Batch ended");
            Candidate updated = candidateService.transition(candidate.getId(), request, null);
            candidateService.addTimelineEvent(candidate.getId(), TimelineEventType.BATCH, "batch_ended",
                    "Batch Ended", "Batch training ended.", null, updated.getSubStatus(), null, null, null);
        }
        return batch;
    }

    public void delete(Long id) {
        batchRepository.deleteById(id);
    }
}
