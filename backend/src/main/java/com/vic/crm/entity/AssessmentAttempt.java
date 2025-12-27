package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vic.crm.enums.AssessmentType;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_attempts",
        indexes = {
                @Index(name = "idx_attempt_vendor_type_track_time",
                        columnList = "vendor_engagement_id, attempt_type, track, happened_at")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class AssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_engagement_id", nullable = false)
    @JsonIgnoreProperties({ "candidate", "vendor", "notes", "createdAt", "updatedAt" })
    private VendorEngagement vendorEngagement;

    @Enumerated(EnumType.STRING)
    @Column(name = "attempt_type", nullable = false)
    private AssessmentType attemptType;

    private String track;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StepState state = StepState.PLANNED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StepResult result = StepResult.PENDING;

    private LocalDateTime happenedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
