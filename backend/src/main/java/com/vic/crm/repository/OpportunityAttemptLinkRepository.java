package com.vic.crm.repository;

import com.vic.crm.entity.OpportunityAttemptLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OpportunityAttemptLinkRepository extends JpaRepository<OpportunityAttemptLink, Long> {
    List<OpportunityAttemptLink> findByOpportunityId(Long opportunityId);

    Optional<OpportunityAttemptLink> findByOpportunityIdAndAttemptId(Long opportunityId, Long attemptId);

    void deleteByOpportunityIdAndAttemptId(Long opportunityId, Long attemptId);
}
