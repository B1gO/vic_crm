package com.vic.crm.dto;

import com.vic.crm.entity.Batch;
import com.vic.crm.entity.User;
import com.vic.crm.enums.BatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDetail {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private BatchStatus status;
    private User trainer;
    private LocalDateTime createdAt;
    private long totalCandidates;
    private List<RecruiterStats> recruiterStats;

    public static BatchDetail from(Batch batch, long totalCandidates, List<RecruiterStats> stats) {
        return BatchDetail.builder()
                .id(batch.getId())
                .name(batch.getName())
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .status(batch.getStatus())
                .trainer(batch.getTrainer())
                .createdAt(batch.getCreatedAt())
                .totalCandidates(totalCandidates)
                .recruiterStats(stats)
                .build();
    }
}
