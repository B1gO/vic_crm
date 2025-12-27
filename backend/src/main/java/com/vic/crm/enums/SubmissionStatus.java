package com.vic.crm.enums;

/**
 * Overall status of a submission (manually updated).
 */
public enum SubmissionStatus {
    ACTIVE, // In progress
    OFFERED, // Has at least one offer
    PLACED, // Successfully placed
    REJECTED, // All paths failed
    WITHDRAWN // Candidate withdrew
}
