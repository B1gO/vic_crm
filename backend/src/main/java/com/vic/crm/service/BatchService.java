package com.vic.crm.service;

import com.vic.crm.entity.Batch;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;

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

    public void delete(Long id) {
        batchRepository.deleteById(id);
    }
}
