package com.vic.crm.dto;

import com.vic.crm.enums.CandidateStage;
import com.vic.crm.enums.CandidateSubStatus;
import com.vic.crm.enums.CloseReason;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TransitionRequest {
    private CandidateStage toStage;
    private CandidateSubStatus toSubStatus;
    private String reason;
    private CloseReason closeReason;
    private String withdrawReason;
    private String holdReason;
    private LocalDateTime nextFollowUpAt;
    private String reactivateReason;
    private LocalDate offerDate;
    private LocalDate startDate;
    private Long actorId;
}
