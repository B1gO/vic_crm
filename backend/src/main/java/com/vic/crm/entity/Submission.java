package com.vic.crm.entity;

import com.vic.crm.enums.ScreeningType;
import com.vic.crm.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    private Client client;

    // Vendor contact who submitted
    private String vendorContact;

    @Column(nullable = false)
    private String positionTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    // Screening type (OA, INTERVIEW, DIRECT)
    @Enumerated(EnumType.STRING)
    private ScreeningType screeningType;

    // Current interview round (1, 2, 3...)
    @Builder.Default
    private Integer currentRound = 0;

    // Total rounds required for this submission (can be 1, 2, 3, etc.)
    private Integer totalRounds;

    // Stage tracking flags (optional stages)
    @Builder.Default
    private Boolean hasOa = false;

    @Builder.Default
    private Boolean hasVendorScreening = false;

    // OA details (optional)
    private LocalDateTime oaScheduledAt;
    private String oaScore;
    @Column(columnDefinition = "TEXT")
    private String oaFeedback;

    // Vendor screening details (optional)
    private LocalDateTime vendorScreeningAt;
    @Column(columnDefinition = "TEXT")
    private String vendorScreeningFeedback;

    // Current interview scheduled date
    private LocalDateTime interviewScheduledAt;

    // Last feedback received
    @Column(columnDefinition = "TEXT")
    private String lastFeedback;

    // Fail reason if rejected
    @Column(columnDefinition = "TEXT")
    private String failReason;

    // Offer details
    private LocalDateTime offerDate;
    @Column(columnDefinition = "TEXT")
    private String offerDetails;

    // General notes
    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
