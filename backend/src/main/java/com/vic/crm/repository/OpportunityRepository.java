package com.vic.crm.repository;

import com.vic.crm.entity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByVendorEngagementIdOrderBySubmittedAtDesc(Long vendorEngagementId);
}
