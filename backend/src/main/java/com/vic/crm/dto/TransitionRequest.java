package com.vic.crm.dto;

import com.vic.crm.enums.LifecycleStage;
import lombok.Data;

@Data
public class TransitionRequest {
    private LifecycleStage toStage;
    private String reason;
    private Long changedById;
}
