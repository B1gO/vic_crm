package com.vic.crm.repository;

import com.vic.crm.entity.Candidate;
import com.vic.crm.enums.LifecycleStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByLifecycleStage(LifecycleStage stage);

    @Query("SELECT c FROM Candidate c JOIN c.batches b WHERE b.id = :batchId")
    List<Candidate> findByBatchId(@Param("batchId") Long batchId);

    List<Candidate> findByRecruiterId(Long recruiterId);

    @Query("SELECT c FROM Candidate c JOIN c.batches b WHERE b.id = :batchId AND c.recruiter.id = :recruiterId")
    List<Candidate> findByBatchIdAndRecruiterId(@Param("batchId") Long batchId, @Param("recruiterId") Long recruiterId);
}
