package com.vic.crm.repository;

import com.vic.crm.entity.InterviewExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewExperienceRepository extends JpaRepository<InterviewExperience, Long> {
    List<InterviewExperience> findByTechCategory(String techCategory);

    List<InterviewExperience> findByCandidateId(Long candidateId);

    List<InterviewExperience> findByClientId(Long clientId);
}
