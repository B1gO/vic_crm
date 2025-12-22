package com.vic.crm.repository;

import com.vic.crm.entity.StageTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StageTransitionRepository extends JpaRepository<StageTransition, Long> {
    List<StageTransition> findByCandidateIdOrderByChangedAtDesc(Long candidateId);
}
