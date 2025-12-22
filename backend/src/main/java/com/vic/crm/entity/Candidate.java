package com.vic.crm.entity;

import com.vic.crm.enums.LifecycleStage;
import com.vic.crm.enums.WorkAuth;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    // === Basic Profile ===
    @NotBlank
    private String name;

    @Email
    private String email;

    private String phone;

    private String wechatId;

    private String wechatName;

    private String discordName;

    private String techTags;

    @Enumerated(EnumType.STRING)
    private WorkAuth workAuth;

    private String city;

    private String state;

    private Boolean relocation;

    private String education;

    // === Workspace ===
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LifecycleStage lifecycleStage;

    // Many-to-Many: Candidate can join 1-2 batches
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "candidate_batches", joinColumns = @JoinColumn(name = "candidate_id"), inverseJoinColumns = @JoinColumn(name = "batch_id"))
    @Builder.Default
    private Set<Batch> batches = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recruiter_id")
    private User recruiter;

    private Boolean resumeReady;

    private Integer completionRate;

    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (lifecycleStage == null) {
            lifecycleStage = LifecycleStage.RECRUITMENT;
        }
        if (resumeReady == null) {
            resumeReady = false;
        }
        if (completionRate == null) {
            completionRate = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
