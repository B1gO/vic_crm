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
    private String teamName;
    private String hiringManager;
    private String jobId;
    private String track;
    private String employmentType;
    private String contractLength;
    private Double billRate;
    private Double payRate;
    private Integer headcount;
    private String jdUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
