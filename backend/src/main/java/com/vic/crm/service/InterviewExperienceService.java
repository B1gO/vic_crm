package com.vic.crm.service;

import com.vic.crm.entity.InterviewExperience;
import com.vic.crm.repository.InterviewExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewExperienceService {

    private final InterviewExperienceRepository repository;

    public List<InterviewExperience> findAll() {
        return repository.findAll();
    }

    public List<InterviewExperience> findByTechCategory(String techCategory) {
        return repository.findByTechCategory(techCategory);
    }

    public List<InterviewExperience> findByCandidateId(Long candidateId) {
        return repository.findByCandidateId(candidateId);
    }

    public InterviewExperience findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview experience not found: " + id));
    }

    public InterviewExperience create(InterviewExperience experience) {
        return repository.save(experience);
    }

    public InterviewExperience update(Long id, InterviewExperience experience) {
        InterviewExperience existing = findById(id);
        existing.setTechCategory(experience.getTechCategory());
        existing.setClient(experience.getClient());
        existing.setVendor(experience.getVendor());
        existing.setCandidate(experience.getCandidate());
        existing.setTechTags(experience.getTechTags());
        existing.setRecordingUrl(experience.getRecordingUrl());
        existing.setNotes(experience.getNotes());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
