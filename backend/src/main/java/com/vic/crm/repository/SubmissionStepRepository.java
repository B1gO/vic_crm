package com.vic.crm.repository;

import com.vic.crm.entity.SubmissionStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionStepRepository extends JpaRepository<SubmissionStep, Long> {
    List<SubmissionStep> findBySubmissionIdOrderByCreatedAtAsc(Long submissionId);

    List<SubmissionStep> findByParentStepId(Long parentStepId);

    List<SubmissionStep> findBySubmissionIdAndParentStepIsNullOrderByCreatedAtAsc(Long submissionId);
}
