package com.vic.crm.dto;

import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdatePipelineStepRequest {
    private StepState state;
    private StepResult result;
    private LocalDateTime scheduledAt;
    private LocalDateTime happenedAt;
    private String feedback;
    private String score;
}
