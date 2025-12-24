package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mocks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "batch", "recruiter" })
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User evaluator;

    // Role and Stage for criteria selection
    private String role; // "Java" or "React"
    private String stage; // "Screening", "TechMock", "RealMock"

    // Overall score (calculated average from criteria ratings, 0-100)
    @Min(0)
    @Max(100)
    private Integer score;

    // Decision
    private String decision; // "Strong Hire", "Hire", "Weak Hire", "No Hire"

    // Structured feedback
    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String actionItems;

    @Column(columnDefinition = "TEXT")
    private String summary;

    // Legacy field for backward compatibility (now called 'summary')
    @Column(columnDefinition = "TEXT")
    private String feedback;

    // Whether feedback is completed
    private Boolean completed;

    private LocalDateTime scheduledAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    // Criteria ratings
    @OneToMany(mappedBy = "mock", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({ "mock" })
    @Builder.Default
    private List<MockCriteriaRating> criteriaRatings = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (completed == null) {
            completed = false;
        }
    }
}
