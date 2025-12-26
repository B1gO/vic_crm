package com.vic.crm.repository;

import com.vic.crm.entity.Candidate;
import com.vic.crm.enums.CandidateStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByStage(CandidateStage stage);
}
