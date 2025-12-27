package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a job position at a client company.
 */
@Entity
@Table(name = "positions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Client client;

    // Source vendor (who provided this position info)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_vendor_id")
    @JsonIgnoreProperties({ "clients", "contacts", "hibernateLazyInitializer", "handler" })
    private Vendor sourceVendor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private String location;

    @Builder.Default
    private String status = "OPEN"; // OPEN, ON_HOLD, CLOSED, FILLED

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Extended fields
    private String teamName; // Team within client
    private String hiringManager; // HM name
    private String jobId; // External job ID
    private String track; // backend, fullstack, frontend, etc.
    private String employmentType; // CONTRACT, FULLTIME, C2H
    private String contractLength; // 6 months, 12 months, etc.
    private Double billRate; // Bill rate
    private Double payRate; // Pay rate
    private Integer headcount; // Number of openings
    private String jdUrl; // Link to full JD

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
