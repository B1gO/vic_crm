package com.vic.crm.dto;

import com.vic.crm.enums.CandidateSubStatus;
import com.vic.crm.enums.CloseReason;
import com.vic.crm.enums.TimelineEventType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TimelineEventRequest {
    private TimelineEventType eventType;
    private String subType;
    private String title;
    private String description;
    private CloseReason closeReason;
    private CandidateSubStatus subStatus;
    private String metaJson;
    private LocalDateTime eventDate;
    private Long actorId;
}
