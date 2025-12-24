package com.vic.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Configurable rating criteria for mock interviews.
 * Admin can create different criteria sets per role (Java/React) and stage
 * (Screening/TechMock/RealMock).
 */
@Entity
@Table(name = "mock_criteria")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String role; // "Java" or "React"

    @Column(nullable = false)
    private String stage; // "Screening", "TechMock", "RealMock"

    @Column(nullable = false)
    private String name; // e.g. "JVM Internals"

    @Column(columnDefinition = "TEXT")
    private String description; // e.g. "Memory Model (Heap/Stack), GC algorithms, Classloading"

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
