package com.vic.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vic.crm.enums.OpportunityStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "opportunities",
        indexes = {
                @Index(name = "idx_opportunity_vendor_time", columnList = "vendor_engagement_id, submitted_at")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Opportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_engagement_id", nullable = false)
    private VendorEngagement vendorEngagement;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OpportunityStatus status = OpportunityStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private OpportunityStatus statusOverride;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
