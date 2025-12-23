package com.vic.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "vendors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    private String contactName;
    private String email;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "vendor_clients", joinColumns = @JoinColumn(name = "vendor_id"), inverseJoinColumns = @JoinColumn(name = "client_id"))
    @Builder.Default
    private Set<Client> clients = new HashSet<>();

    // Vendor's contacts with full details
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "vendor_contacts", joinColumns = @JoinColumn(name = "vendor_id"))
    @Builder.Default
    private List<VendorContact> contacts = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
