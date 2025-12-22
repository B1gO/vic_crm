package com.vic.crm.repository;

import com.vic.crm.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByCandidateId(Long candidateId);

    List<Submission> findByVendorId(Long vendorId);

    List<Submission> findByClientId(Long clientId);
}
