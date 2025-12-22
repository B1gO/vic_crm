package com.vic.crm.repository;

import com.vic.crm.entity.TimelineEvent;
import com.vic.crm.enums.TimelineEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {

    List<TimelineEvent> findByCandidateIdOrderByEventDateDesc(Long candidateId);

    List<TimelineEvent> findByCandidateIdAndEventTypeOrderByEventDateDesc(
            Long candidateId, TimelineEventType eventType);
}
