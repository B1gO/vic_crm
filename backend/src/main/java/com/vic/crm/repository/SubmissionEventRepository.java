package com.vic.crm.repository;

import com.vic.crm.entity.SubmissionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionEventRepository extends JpaRepository<SubmissionEvent, Long> {
    List<SubmissionEvent> findBySubmissionIdOrderByEventDateDesc(Long submissionId);
}
