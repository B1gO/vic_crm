package com.vic.crm.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateOpportunityRequest {
    private Long positionId;
    private LocalDateTime submittedAt;
    private List<Long> attachAttemptIds;
}
