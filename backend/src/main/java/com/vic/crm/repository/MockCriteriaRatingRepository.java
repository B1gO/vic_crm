package com.vic.crm.repository;

import com.vic.crm.entity.MockCriteriaRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockCriteriaRatingRepository extends JpaRepository<MockCriteriaRating, Long> {

    List<MockCriteriaRating> findByMockId(Long mockId);

    void deleteByMockId(Long mockId);
}
