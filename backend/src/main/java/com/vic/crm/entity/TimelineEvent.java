package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vic.crm.enums.CandidateStage;
import com.vic.crm.enums.CandidateSubStatus;
import com.vic.crm.enums.CloseReason;
import com.vic.crm.enums.TimelineEventType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Timeline event for tracking candidate career journey.
 * Replaces simple stage transitions with comprehensive event tracking.
 */
@Entity
@Table(name = "timeline_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimelineEventType eventType;

    // Sub-type for more detail (e.g., "tech_mock_round_1", "contract_sent")
    private String subType;

    // For STAGE_CHANGE events
    @Enumerated(EnumType.STRING)
    private CandidateStage fromStage;

    @Enumerated(EnumType.STRING)
    private CandidateStage toStage;

    @Enumerated(EnumType.STRING)
    private CandidateSubStatus subStatus;

    // For CLOSED events
    @Enumerated(EnumType.STRING)
    private CloseReason closeReason;

    // Event title (e.g., "Contract Signed", "Mock 1 Passed")
    private String title;

    // Additional description
    private String description;

    // Who triggered this event
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime eventDate;

    @Column(columnDefinition = "TEXT")
    private String metaJson;

    @PrePersist
    protected void onCreate() {
        if (eventDate == null) {
            eventDate = LocalDateTime.now();
        }
    }
}
