package com.vic.crm.dto;

import com.vic.crm.enums.EngagementStatus;
import lombok.Data;

@Data
public class CreateVendorEngagementRequest {
    private Long candidateId;
    private Long vendorId;
    private EngagementStatus status;
    private String notes;
}
