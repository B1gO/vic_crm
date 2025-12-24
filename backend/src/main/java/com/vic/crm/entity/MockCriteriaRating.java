package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Individual criterion rating for a mock interview.
 * Links a Mock to a MockCriteria with a score (1-5).
 */
@Entity
@Table(name = "mock_criteria_ratings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockCriteriaRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "criteriaRatings" })
    private Mock mock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criteria_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private MockCriteria criteria;

    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer score;
}
