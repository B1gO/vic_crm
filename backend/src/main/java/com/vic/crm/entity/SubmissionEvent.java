package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vic.crm.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Tracks each status change in a submission's lifecycle.
 */
@Entity
@Table(name = "submission_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Submission submission;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus toStatus;

    // Type of event: STATUS_CHANGE, OA_RESULT, INTERVIEW_FEEDBACK, NOTE, etc.
    private String eventType;

    // Round number (for interview events)
    private Integer round;

    // Title of the event
    @Column(nullable = false)
    private String title;

    // Detailed notes/feedback
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Score or result (e.g., "92/100" for OA, "Pass" for screening)
    private String result;

    // Who performed this action
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "actor_id")
    private User actor;

    @CreationTimestamp
    private LocalDateTime eventDate;
}
