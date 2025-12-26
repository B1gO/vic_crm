package com.vic.crm.entity;

import com.vic.crm.enums.CandidateStage;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stage_transitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageTransition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStage fromStage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStage toStage;

    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
