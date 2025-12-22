package com.vic.crm.dto;

import com.vic.crm.enums.CloseReason;
import com.vic.crm.enums.TimelineEventType;
import lombok.Data;

@Data
public class TimelineEventRequest {
    private TimelineEventType eventType;
    private String subType;
    private String title;
    private String description;
    private CloseReason closeReason;
    private Long createdById;
}
