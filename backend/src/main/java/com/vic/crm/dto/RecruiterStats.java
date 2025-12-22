package com.vic.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterStats {
    private Long recruiterId;
    private String recruiterName;
    private long sourced;
    private long ready;
    private long placed;
}
