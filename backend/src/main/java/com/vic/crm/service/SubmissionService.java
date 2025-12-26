package com.vic.crm.service;

import com.vic.crm.entity.Submission;
import com.vic.crm.entity.SubmissionEvent;
import com.vic.crm.entity.User;
import com.vic.crm.enums.SubmissionStatus;
import com.vic.crm.repository.SubmissionEventRepository;
import com.vic.crm.repository.SubmissionRepository;
import com.vic.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionEventRepository submissionEventRepository;
    private final UserRepository userRepository;

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
            submission.setStatus(SubmissionStatus.SUBMITTED);
        }
        if (submission.getCurrentRound() == null) {
            submission.setCurrentRound(0);
        }
        if (submission.getHasOa() == null) {
            submission.setHasOa(false);
        }
        if (submission.getHasVendorScreening() == null) {
            submission.setHasVendorScreening(false);
        }
        Submission saved = submissionRepository.save(submission);

        // Create initial event
        createEvent(saved, null, SubmissionStatus.SUBMITTED, "CREATED",
                "Submission Created", "Submitted to " + saved.getVendor().getCompanyName(), null, null, null);

        return saved;
    }

    @Transactional
    public Submission update(Long id, Submission submission) {
        Submission existing = findById(id);
        existing.setPositionTitle(submission.getPositionTitle());
        existing.setScreeningType(submission.getScreeningType());
        existing.setCurrentRound(submission.getCurrentRound());
        existing.setTotalRounds(submission.getTotalRounds());
        existing.setNotes(submission.getNotes());
        existing.setClient(submission.getClient());
        existing.setHasOa(submission.getHasOa());
        existing.setHasVendorScreening(submission.getHasVendorScreening());
        existing.setOaScheduledAt(submission.getOaScheduledAt());
        existing.setOaScore(submission.getOaScore());
        existing.setOaFeedback(submission.getOaFeedback());
        existing.setVendorScreeningAt(submission.getVendorScreeningAt());
        existing.setVendorScreeningFeedback(submission.getVendorScreeningFeedback());
        existing.setInterviewScheduledAt(submission.getInterviewScheduledAt());
        existing.setLastFeedback(submission.getLastFeedback());
        existing.setOfferDate(submission.getOfferDate());
        existing.setOfferDetails(submission.getOfferDetails());
        return submissionRepository.save(existing);
    }

    /**
     * Update submission status with event tracking.
     */
    @Transactional
    public Submission updateStatus(Long id, SubmissionStatus newStatus, String notes,
            String result, Integer round, Long actorId) {
        Submission submission = findById(id);
        SubmissionStatus oldStatus = submission.getStatus();

        if (oldStatus == newStatus) {
            return submission;
        }

        submission.setStatus(newStatus);

        // Update round if provided
        if (round != null) {
            submission.setCurrentRound(round);
        }

        // Update feedback
        if (notes != null && !notes.isEmpty()) {
            submission.setLastFeedback(notes);
        }

        // Handle specific status transitions
        String eventType = determineEventType(newStatus);
        String title = generateEventTitle(newStatus, round);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;

        Submission saved = submissionRepository.save(submission);
        createEvent(saved, oldStatus, newStatus, eventType, title, notes, result, round, actor);

        return saved;
    }

    /**
     * Schedule OA for submission.
     */
    @Transactional
    public Submission scheduleOa(Long id, LocalDateTime scheduledAt, Long actorId) {
        Submission submission = findById(id);
        submission.setHasOa(true);
        submission.setOaScheduledAt(scheduledAt);
        submission.setStatus(SubmissionStatus.OA_SCHEDULED);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, submission.getStatus(), SubmissionStatus.OA_SCHEDULED,
                "OA_SCHEDULED", "OA Scheduled", "OA scheduled for " + scheduledAt, null, null, actor);

        return saved;
    }

    /**
     * Record OA result.
     */
    @Transactional
    public Submission recordOaResult(Long id, boolean passed, String score, String feedback, Long actorId) {
        Submission submission = findById(id);
        SubmissionStatus oldStatus = submission.getStatus();
        SubmissionStatus newStatus = passed ? SubmissionStatus.OA_PASSED : SubmissionStatus.OA_FAILED;

        submission.setStatus(newStatus);
        submission.setOaScore(score);
        submission.setOaFeedback(feedback);

        if (!passed) {
            submission.setFailReason("Failed OA: " + feedback);
        }

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, oldStatus, newStatus, "OA_RESULT",
                passed ? "OA Passed" : "OA Failed", feedback, score, null, actor);

        return saved;
    }

    /**
     * Schedule vendor screening.
     */
    @Transactional
    public Submission scheduleVendorScreening(Long id, LocalDateTime scheduledAt, Long actorId) {
        Submission submission = findById(id);
        submission.setHasVendorScreening(true);
        submission.setVendorScreeningAt(scheduledAt);
        submission.setStatus(SubmissionStatus.VENDOR_SCREENING_SCHEDULED);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, submission.getStatus(), SubmissionStatus.VENDOR_SCREENING_SCHEDULED,
                "VENDOR_SCREENING_SCHEDULED", "Vendor Screening Scheduled",
                "Vendor screening scheduled for " + scheduledAt, null, null, actor);

        return saved;
    }

    /**
     * Record vendor screening result.
     */
    @Transactional
    public Submission recordVendorScreeningResult(Long id, boolean passed, String feedback, Long actorId) {
        Submission submission = findById(id);
        SubmissionStatus oldStatus = submission.getStatus();
        SubmissionStatus newStatus = passed ? SubmissionStatus.VENDOR_SCREENING_PASSED
                : SubmissionStatus.VENDOR_SCREENING_FAILED;

        submission.setStatus(newStatus);
        submission.setVendorScreeningFeedback(feedback);

        if (!passed) {
            submission.setFailReason("Failed Vendor Screening: " + feedback);
        }

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, oldStatus, newStatus, "VENDOR_SCREENING_RESULT",
                passed ? "Vendor Screening Passed" : "Vendor Screening Failed", feedback, null, null, actor);

        return saved;
    }

    /**
     * Schedule client interview.
     */
    @Transactional
    public Submission scheduleInterview(Long id, int round, LocalDateTime scheduledAt, Long actorId) {
        Submission submission = findById(id);
        submission.setCurrentRound(round);
        submission.setInterviewScheduledAt(scheduledAt);
        submission.setStatus(SubmissionStatus.CLIENT_INTERVIEW);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, submission.getStatus(), SubmissionStatus.CLIENT_INTERVIEW,
                "INTERVIEW_SCHEDULED", "Round " + round + " Scheduled",
                "Client interview round " + round + " scheduled for " + scheduledAt, null, round, actor);

        return saved;
    }

    /**
     * Record client interview result.
     */
    @Transactional
    public Submission recordInterviewResult(Long id, int round, boolean passed, String feedback, Long actorId) {
        Submission submission = findById(id);
        SubmissionStatus oldStatus = submission.getStatus();

        submission.setLastFeedback(feedback);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved;

        if (passed) {
            // Check if this is the final round
            Integer totalRounds = submission.getTotalRounds();
            if (totalRounds != null && round >= totalRounds) {
                // All rounds passed, move to OFFERED
                submission.setStatus(SubmissionStatus.OFFERED);
                saved = submissionRepository.save(submission);
                createEvent(saved, oldStatus, SubmissionStatus.OFFERED,
                        "INTERVIEW_PASSED", "Round " + round + " Passed - All Rounds Complete", feedback, "Pass", round,
                        actor);
            } else {
                // More rounds to go
                saved = submissionRepository.save(submission);
                createEvent(saved, oldStatus, oldStatus,
                        "INTERVIEW_PASSED", "Round " + round + " Passed", feedback, "Pass", round, actor);
            }
        } else {
            submission.setStatus(SubmissionStatus.REJECTED);
            submission.setFailReason("Failed Round " + round + ": " + feedback);
            saved = submissionRepository.save(submission);
            createEvent(saved, oldStatus, SubmissionStatus.REJECTED,
                    "INTERVIEW_FAILED", "Round " + round + " Failed", feedback, "Fail", round, actor);
        }

        return saved;
    }

    /**
     * Record offer.
     */
    @Transactional
    public Submission recordOffer(Long id, String offerDetails, LocalDateTime offerDate, Long actorId) {
        Submission submission = findById(id);
        SubmissionStatus oldStatus = submission.getStatus();

        submission.setStatus(SubmissionStatus.OFFERED);
        submission.setOfferDetails(offerDetails);
        submission.setOfferDate(offerDate);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, oldStatus, SubmissionStatus.OFFERED,
                "OFFER_RECEIVED", "Offer Received", offerDetails, null, null, actor);

        return saved;
    }

    /**
     * Accept or decline offer.
     */
    @Transactional
    public Submission respondToOffer(Long id, boolean accepted, String notes, Long actorId) {
        Submission submission = findById(id);
        SubmissionStatus oldStatus = submission.getStatus();
        SubmissionStatus newStatus = accepted ? SubmissionStatus.OFFER_ACCEPTED : SubmissionStatus.OFFER_DECLINED;

        submission.setStatus(newStatus);

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;
        Submission saved = submissionRepository.save(submission);
        createEvent(saved, oldStatus, newStatus,
                accepted ? "OFFER_ACCEPTED" : "OFFER_DECLINED",
                accepted ? "Offer Accepted" : "Offer Declined", notes, null, null, actor);

        return saved;
    }

    /**
     * Get submission events (timeline).
     */
    public List<SubmissionEvent> getEvents(Long submissionId) {
        return submissionEventRepository.findBySubmissionIdOrderByEventDateDesc(submissionId);
    }

    public void delete(Long id) {
        submissionRepository.deleteById(id);
    }

    // Helper methods
    private void createEvent(Submission submission, SubmissionStatus fromStatus, SubmissionStatus toStatus,
            String eventType, String title, String notes, String result, Integer round, User actor) {
        SubmissionEvent event = SubmissionEvent.builder()
                .submission(submission)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .eventType(eventType)
                .title(title)
                .notes(notes)
                .result(result)
                .round(round)
                .actor(actor)
                .build();
        submissionEventRepository.save(event);
    }

    private String determineEventType(SubmissionStatus status) {
        return switch (status) {
            case OA_SCHEDULED, OA_PASSED, OA_FAILED -> "OA";
            case VENDOR_SCREENING_SCHEDULED, VENDOR_SCREENING_PASSED, VENDOR_SCREENING_FAILED -> "VENDOR_SCREENING";
            case CLIENT_INTERVIEW -> "INTERVIEW";
            case OFFERED, OFFER_ACCEPTED, OFFER_DECLINED -> "OFFER";
            case PLACED -> "PLACED";
            case REJECTED, WITHDRAWN -> "CLOSED";
            default -> "STATUS_CHANGE";
        };
    }

    private String generateEventTitle(SubmissionStatus status, Integer round) {
        return switch (status) {
            case SUBMITTED -> "Submitted";
            case OA_SCHEDULED -> "OA Scheduled";
            case OA_PASSED -> "OA Passed";
            case OA_FAILED -> "OA Failed";
            case VENDOR_SCREENING_SCHEDULED -> "Vendor Screening Scheduled";
            case VENDOR_SCREENING_PASSED -> "Vendor Screening Passed";
            case VENDOR_SCREENING_FAILED -> "Vendor Screening Failed";
            case CLIENT_INTERVIEW -> round != null ? "Interview Round " + round : "Client Interview";
            case OFFERED -> "Offer Received";
            case OFFER_ACCEPTED -> "Offer Accepted";
            case OFFER_DECLINED -> "Offer Declined";
            case PLACED -> "Placed";
            case REJECTED -> "Rejected";
            case WITHDRAWN -> "Withdrawn";
        };
    }
}
