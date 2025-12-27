package com.vic.crm.dto;

import com.vic.crm.enums.AssessmentType;
import com.vic.crm.enums.EngagementStatus;
import com.vic.crm.enums.OpportunityStatus;
import com.vic.crm.enums.StepResult;
import com.vic.crm.enums.StepState;
import com.vic.crm.enums.StepType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class VendorEngagementResponse {
    private Long id;
    private EngagementStatus status;
    private CandidateSummary candidate;
    private List<AssessmentAttemptSummary> attempts;
    private List<OpportunitySummary> opportunities;

    @Data
    public static class CandidateSummary {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    public static class AssessmentAttemptSummary {
        private Long id;
        private AssessmentType attemptType;
        private String track;
        private StepState state;
        private StepResult result;
        private LocalDateTime happenedAt;
    }

    @Data
    public static class OpportunitySummary {
        private Long id;
        private Long positionId;
        private String positionTitle;
        private Long clientId;
        private String clientName;
        private OpportunityStatus status;
        private LocalDateTime submittedAt;
        private PipelineStepSummary latestStep;
    }

    @Data
    public static class PipelineStepSummary {
        private Long id;
        private StepType type;
        private StepState state;
        private StepResult result;
        private LocalDateTime happenedAt;
    }
}
