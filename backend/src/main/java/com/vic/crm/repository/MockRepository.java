package com.vic.crm.repository;

import com.vic.crm.entity.Mock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockRepository extends JpaRepository<Mock, Long> {
    List<Mock> findByCandidateIdOrderByScheduledAtDesc(Long candidateId);

    List<Mock> findByEvaluatorIdOrderByScheduledAtDesc(Long evaluatorId);

    // Find scheduled mock for a candidate by stage
    @Query("SELECT m FROM Mock m WHERE m.candidate.id = :candidateId AND LOWER(m.stage) = LOWER(:stage) AND m.scheduledAt IS NOT NULL ORDER BY m.scheduledAt DESC")
    List<Mock> findByCandidateIdAndStage(@Param("candidateId") Long candidateId, @Param("stage") String stage);

    // Find completed mock with decision for a candidate by stage
    @Query("SELECT m FROM Mock m WHERE m.candidate.id = :candidateId AND LOWER(m.stage) = LOWER(:stage) AND m.completed = true AND m.decision IS NOT NULL ORDER BY m.completedAt DESC")
    List<Mock> findCompletedByCandidateIdAndStage(@Param("candidateId") Long candidateId, @Param("stage") String stage);
}
