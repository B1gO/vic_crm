package com.vic.crm.dto;

import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import com.vic.crm.enums.StepType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreatePipelineStepRequest {
    private Long parentStepId;
    private StepType type;
    private StepState state;
    private StepResult result;
    private Integer round;
    private LocalDateTime scheduledAt;
    private LocalDateTime happenedAt;
    private String feedback;
    private String score;
}
