package com.vic.crm.repository;

import com.vic.crm.entity.MockCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockCriteriaRepository extends JpaRepository<MockCriteria, Long> {

    List<MockCriteria> findByRoleAndStageAndActiveTrueOrderByDisplayOrderAsc(String role, String stage);

    List<MockCriteria> findByRoleAndActiveTrue(String role);

    List<MockCriteria> findAllByOrderByRoleAscStageAscDisplayOrderAsc();
}
