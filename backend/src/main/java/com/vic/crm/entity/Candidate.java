package com.vic.crm.entity;

import com.vic.crm.enums.LifecycleStage;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String wechatId;
    private String wechatName;
    private String discordName;
    private String linkedinUrl;
    private String marketingLinkedinUrl;
    private String techTags;

    // Work authorization
    private String workAuth;

    // Location
    private String city;
    private String state;
    private Boolean relocation;

    // Education
    private String education;

    // Lifecycle
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LifecycleStage lifecycleStage = LifecycleStage.RECRUITMENT;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recruiter_id")
    private User recruiter;

    // Readiness flags
    private Boolean resumeReady;
    private Integer completionRate;

    // Notes
    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
