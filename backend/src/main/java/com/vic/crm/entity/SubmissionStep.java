package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a step in the submission pipeline (tree-based).
 */
@Entity
@Table(name = "submission_steps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_step_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "submission", "parentStep" })
    private SubmissionStep parentStep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StepType type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id")
    private Position position;

    private Integer round;

    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StepResult result = StepResult.PENDING;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private String score;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
