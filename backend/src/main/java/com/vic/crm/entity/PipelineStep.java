package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import com.vic.crm.enums.StepType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pipeline_steps",
        indexes = {
                @Index(name = "idx_pipeline_step_opportunity_parent_time",
                        columnList = "opportunity_id, parent_step_id, happened_at")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class PipelineStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    @JsonIgnoreProperties({ "vendorEngagement", "position", "notes", "createdAt", "updatedAt" })
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_step_id")
    @JsonIgnoreProperties({ "opportunity", "parentStep" })
    private PipelineStep parentStep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StepType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StepState state = StepState.PLANNED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StepResult result = StepResult.PENDING;

    private Integer round;

    private LocalDateTime scheduledAt;

    private LocalDateTime happenedAt;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private String score;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
