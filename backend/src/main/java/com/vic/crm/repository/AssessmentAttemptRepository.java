package com.vic.crm.repository;

import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.enums.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {

    List<AssessmentAttempt> findByVendorEngagementIdOrderByHappenedAtDesc(Long vendorEngagementId);

    @Query("""
            select attempt from AssessmentAttempt attempt
            where attempt.vendorEngagement.id = :engagementId
              and (:attemptType is null or attempt.attemptType = :attemptType)
              and (:track is null or attempt.track = :track)
            order by attempt.happenedAt desc, attempt.createdAt desc
            """)
    List<AssessmentAttempt> findFiltered(@Param("engagementId") Long engagementId,
                                         @Param("attemptType") AssessmentType attemptType,
                                         @Param("track") String track);
}
