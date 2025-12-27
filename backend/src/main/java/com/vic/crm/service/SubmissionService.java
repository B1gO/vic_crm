package com.vic.crm.service;

import com.vic.crm.entity.Submission;
import com.vic.crm.entity.SubmissionStep;
import com.vic.crm.enums.StepType;
import com.vic.crm.enums.SubmissionStatus;
import com.vic.crm.repository.SubmissionRepository;
import com.vic.crm.repository.SubmissionStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionStepRepository stepRepository;

    public List<Submission> findAll() {
        return submissionRepository.findAll();
    }

    public List<Submission> findByCandidateId(Long candidateId) {
        return submissionRepository.findByCandidateId(candidateId);
    }

    public List<Submission> findByVendorId(Long vendorId) {
        return submissionRepository.findByVendorId(vendorId);
    }

    public Submission findById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + id));
    }

    @Transactional
    public Submission create(Submission submission) {
        if (submission.getStatus() == null) {
            submission.setStatus(SubmissionStatus.ACTIVE);
        }
        return submissionRepository.save(submission);
    }

    @Transactional
    public Submission update(Long id, Submission submission) {
        Submission existing = findById(id);
        existing.setVendorContact(submission.getVendorContact());
        existing.setNotes(submission.getNotes());
        return submissionRepository.save(existing);
    }

    /**
     * Manually update submission status.
     */
    @Transactional
    public Submission updateStatus(Long id, SubmissionStatus status) {
        Submission submission = findById(id);
        submission.setStatus(status);
        return submissionRepository.save(submission);
    }

    /**
     * Get all steps for a submission as a flat list.
     */
    public List<SubmissionStep> getSteps(Long submissionId) {
        return stepRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId);
    }

    public void delete(Long id) {
        submissionRepository.deleteById(id);
    }
}
