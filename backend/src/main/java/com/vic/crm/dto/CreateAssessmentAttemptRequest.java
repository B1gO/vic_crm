package com.vic.crm.dto;

import com.vic.crm.enums.AssessmentType;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateAssessmentAttemptRequest {
    private AssessmentType attemptType;
    private String track;
    private StepState state;
    private StepResult result;
    private LocalDateTime happenedAt;
    private String notes;
}
