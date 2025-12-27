package com.vic.crm.repository;

import com.vic.crm.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByClientId(Long clientId);

    List<Position> findByStatus(String status);

    List<Position> findByClientIdAndStatus(Long clientId, String status);

    List<Position> findBySourceVendorId(Long sourceVendorId);
}
