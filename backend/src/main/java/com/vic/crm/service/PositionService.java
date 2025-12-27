package com.vic.crm.service;

import com.vic.crm.entity.Position;
import com.vic.crm.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    public List<Position> findAll() {
        return positionRepository.findAll();
    }

    public List<Position> findByClientId(Long clientId) {
        return positionRepository.findByClientId(clientId);
    }

    public List<Position> findByStatus(String status) {
        return positionRepository.findByStatus(status);
    }

    public List<Position> findBySourceVendorId(Long vendorId) {
        return positionRepository.findBySourceVendorId(vendorId);
    }

    public List<Position> findOpen() {
        return positionRepository.findByStatus("OPEN");
    }

    public Position findById(Long id) {
        return positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Position not found: " + id));
    }

    public Position create(Position position) {
        if (position.getStatus() == null) {
            position.setStatus("OPEN");
        }
        return positionRepository.save(position);
    }

    public Position update(Long id, Position position) {
        Position existing = findById(id);
        existing.setTitle(position.getTitle());
        existing.setClient(position.getClient());
        existing.setDescription(position.getDescription());
        existing.setRequirements(position.getRequirements());
        existing.setLocation(position.getLocation());
        existing.setStatus(position.getStatus());
        existing.setNotes(position.getNotes());
        // Extended fields
        existing.setSourceVendor(position.getSourceVendor());
        existing.setTeamName(position.getTeamName());
        existing.setHiringManager(position.getHiringManager());
        existing.setJobId(position.getJobId());
        existing.setTrack(position.getTrack());
        existing.setEmploymentType(position.getEmploymentType());
        existing.setContractLength(position.getContractLength());
        existing.setBillRate(position.getBillRate());
        existing.setPayRate(position.getPayRate());
        existing.setHeadcount(position.getHeadcount());
        existing.setJdUrl(position.getJdUrl());
        return positionRepository.save(existing);
    }

    public void delete(Long id) {
        positionRepository.deleteById(id);
    }
}
