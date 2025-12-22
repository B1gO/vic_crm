package com.vic.crm.service;

import com.vic.crm.dto.BatchDetail;
import com.vic.crm.dto.RecruiterStats;
import com.vic.crm.entity.Batch;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.User;
import com.vic.crm.enums.LifecycleStage;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.BatchRepository;
import com.vic.crm.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final CandidateRepository candidateRepository;

    public List<Batch> findAll() {
        return batchRepository.findAll();
    }

    public Batch findById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }

    public BatchDetail getDetail(Long id) {
        Batch batch = findById(id);
        List<Candidate> candidates = candidateRepository.findByBatchId(id);

        // Group candidates by recruiter and calculate stats
        Map<Long, List<Candidate>> byRecruiter = candidates.stream()
                .filter(c -> c.getRecruiter() != null)
                .collect(Collectors.groupingBy(c -> c.getRecruiter().getId()));

        List<RecruiterStats> stats = byRecruiter.entrySet().stream()
                .map(entry -> {
                    List<Candidate> recruiterCandidates = entry.getValue();
                    User recruiter = recruiterCandidates.get(0).getRecruiter();

                    long sourced = recruiterCandidates.size();
                    long ready = recruiterCandidates.stream()
                            .filter(c -> c.getLifecycleStage() == LifecycleStage.MARKET_READY)
                            .count();
                    long placed = recruiterCandidates.stream()
                            .filter(c -> c.getLifecycleStage() == LifecycleStage.PLACED)
                            .count();

                    return RecruiterStats.builder()
                            .recruiterId(recruiter.getId())
                            .recruiterName(recruiter.getName())
                            .sourced(sourced)
                            .ready(ready)
                            .placed(placed)
                            .build();
                })
                .collect(Collectors.toList());

        return BatchDetail.from(batch, candidates.size(), stats);
    }

    @Transactional
    public Batch create(Batch batch) {
        return batchRepository.save(batch);
    }

    @Transactional
    public Batch update(Long id, Batch updated) {
        Batch existing = findById(id);
        existing.setName(updated.getName());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setStatus(updated.getStatus());
        existing.setTrainer(updated.getTrainer());
        return batchRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        batchRepository.deleteById(id);
    }
}
