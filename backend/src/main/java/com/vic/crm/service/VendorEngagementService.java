package com.vic.crm.service;

import com.vic.crm.dto.CreateVendorEngagementRequest;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.Vendor;
import com.vic.crm.entity.VendorEngagement;
import com.vic.crm.enums.EngagementStatus;
import com.vic.crm.exception.ResourceNotFoundException;
import com.vic.crm.repository.CandidateRepository;
import com.vic.crm.repository.VendorEngagementRepository;
import com.vic.crm.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorEngagementService {

    private final VendorEngagementRepository engagementRepository;
    private final CandidateRepository candidateRepository;
    private final VendorRepository vendorRepository;

    public VendorEngagement findById(Long id) {
        return engagementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor engagement not found: " + id));
    }

    public List<VendorEngagement> findByCandidateId(Long candidateId) {
        return engagementRepository.findByCandidateId(candidateId);
    }

    @Transactional
    public VendorEngagement create(CreateVendorEngagementRequest request) {
        if (request.getCandidateId() == null || request.getVendorId() == null) {
            throw new IllegalArgumentException("candidateId and vendorId are required");
        }

        engagementRepository.findByCandidateIdAndVendorId(request.getCandidateId(), request.getVendorId())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Vendor engagement already exists for candidate and vendor");
                });

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + request.getCandidateId()));
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found: " + request.getVendorId()));

        VendorEngagement engagement = VendorEngagement.builder()
                .candidate(candidate)
                .vendor(vendor)
                .status(request.getStatus() != null ? request.getStatus() : EngagementStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        return engagementRepository.save(engagement);
    }
}
