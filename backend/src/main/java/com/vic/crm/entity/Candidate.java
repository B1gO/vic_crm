package com.vic.crm.entity;

import com.vic.crm.enums.CandidateStage;
import com.vic.crm.enums.CandidateSubStatus;
import com.vic.crm.enums.CloseReason;
import com.vic.crm.enums.OfferType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String wechatId;
    private String wechatName;
    private String discordName;
    private String linkedinUrl;
    private String marketingLinkedinUrl;
    private String techTags;

    // Work authorization
    private String workAuth;

    // Location
    private String city;
    private String state;
    private Boolean relocation;

    // Education
    private String school;
    private String major;

    // Lifecycle (single state machine)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStage stage = CandidateStage.SOURCING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateSubStatus subStatus = CandidateSubStatus.SOURCED;

    @Enumerated(EnumType.STRING)
    private CandidateStage lastActiveStage;

    private LocalDateTime stageUpdatedAt;

    // Hold/close/reactivate metadata
    private String holdReason;
    private LocalDateTime nextFollowUpAt;

    @Enumerated(EnumType.STRING)
    private CloseReason closeReason;

    @Column(columnDefinition = "TEXT")
    private String closeReasonNote;

    @Column(columnDefinition = "TEXT")
    private String withdrawReason;

    @Column(columnDefinition = "TEXT")
    private String reactivateReason;

    // Offer and placement dates
    @Enumerated(EnumType.STRING)
    private OfferType offerType;
    private LocalDate offerDate;
    private LocalDate startDate;

    // Relationships (batch is optional - null until assigned after screening)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recruiter_id")
    private User recruiter;

    // Readiness flags
    private Boolean resumeReady;
    private Integer completionRate;

    // Notes
    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
