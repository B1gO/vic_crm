package com.vic.crm.repository;

import com.vic.crm.entity.Mock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockRepository extends JpaRepository<Mock, Long> {
    List<Mock> findByCandidateId(Long candidateId);
    List<Mock> findByEvaluatorId(Long evaluatorId);
}
