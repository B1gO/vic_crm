package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "opportunity_attempt_links",
        uniqueConstraints = @UniqueConstraint(columnNames = { "opportunity_id", "attempt_id" }),
        indexes = {
                @Index(name = "idx_opportunity_attempt_links_attempt", columnList = "attempt_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class OpportunityAttemptLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    @JsonIgnoreProperties({ "vendorEngagement", "position", "notes", "createdAt", "updatedAt" })
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnoreProperties({ "vendorEngagement", "notes", "createdAt", "updatedAt" })
    private AssessmentAttempt attempt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
