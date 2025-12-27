package com.vic.crm.repository;

import com.vic.crm.entity.PipelineStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PipelineStepRepository extends JpaRepository<PipelineStep, Long> {
    List<PipelineStep> findByOpportunityIdOrderByCreatedAtAsc(Long opportunityId);

    Optional<PipelineStep> findFirstByOpportunityIdOrderByHappenedAtDescCreatedAtDesc(Long opportunityId);
}
