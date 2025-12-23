package com.vic.crm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorContact {

    @Column(name = "contact_name")
    private String name;

    @Column(name = "contact_email")
    private String email;

    @Column(name = "contact_phone")
    private String phone;

    @Column(name = "contact_linkedin")
    private String linkedinUrl;

    @Column(name = "contact_notes", columnDefinition = "TEXT")
    private String notes;
}
