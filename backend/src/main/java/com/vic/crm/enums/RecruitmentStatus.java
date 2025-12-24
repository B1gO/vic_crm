package com.vic.crm.enums;

/**
 * Tracks candidate progress through the sourcing/screening process
 * before they are assigned to a training batch.
 */
public enum RecruitmentStatus {
    SOURCED, // 刚录入，待联系
    SCREENING_SCHEDULED, // 已安排 Screening
    SCREENING_PASSED, // Screening 通过，待分配 Batch
    SCREENING_FAILED, // Screening 失败
    DIRECT_MARKETING // 有经验，不需要培训，直接 Marketing
}
