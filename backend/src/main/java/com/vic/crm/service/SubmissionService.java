package com.vic.crm.service;

import com.vic.crm.entity.Submission;
import com.vic.crm.enums.SubmissionStatus;
import com.vic.crm.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;

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

    public Submission create(Submission submission) {
        if (submission.getStatus() == null) {
            submission.setStatus(SubmissionStatus.VENDOR_SCREENING);
        }
        if (submission.getCurrentRound() == null) {
            submission.setCurrentRound(0);
        }
        return submissionRepository.save(submission);
    }

    public Submission update(Long id, Submission submission) {
        Submission existing = findById(id);
        existing.setPositionTitle(submission.getPositionTitle());
        existing.setStatus(submission.getStatus());
        existing.setScreeningType(submission.getScreeningType());
        existing.setCurrentRound(submission.getCurrentRound());
        existing.setNotes(submission.getNotes());
        existing.setClient(submission.getClient());
        return submissionRepository.save(existing);
    }

    public Submission advanceRound(Long id) {
        Submission submission = findById(id);
        submission.setCurrentRound(submission.getCurrentRound() + 1);
        if (submission.getStatus() == SubmissionStatus.VENDOR_SCREENING) {
            submission.setStatus(SubmissionStatus.CLIENT_ROUND);
        }
        return submissionRepository.save(submission);
    }

    public void delete(Long id) {
        submissionRepository.deleteById(id);
    }
}
