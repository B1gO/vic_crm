package com.vic.crm.dto;

import com.vic.crm.enums.CandidateSubStatus;
import lombok.Data;

@Data
public class SubStatusUpdateRequest {
    private CandidateSubStatus subStatus;
    private String reason;
    private Long actorId;
}
