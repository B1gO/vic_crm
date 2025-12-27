package com.vic.crm.repository;

import com.vic.crm.entity.VendorEngagement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorEngagementRepository extends JpaRepository<VendorEngagement, Long> {
    Optional<VendorEngagement> findByCandidateIdAndVendorId(Long candidateId, Long vendorId);

    List<VendorEngagement> findByCandidateId(Long candidateId);

    List<VendorEngagement> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
}
