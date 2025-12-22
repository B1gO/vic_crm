package com.vic.crm.repository;

import com.vic.crm.entity.Homework;
import com.vic.crm.enums.HomeworkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByCandidateId(Long candidateId);
    List<Homework> findByStatus(HomeworkStatus status);
}
