package com.vic.crm.enums;

/**
 * Submission status enum with flexible pipeline stages.
 * OA and Vendor Screening are optional.
 * Client interviews can be 1-N rounds.
 */
public enum SubmissionStatus {
    // Initial
    SUBMITTED, // Just submitted to vendor

    // OA Stage (Optional)
    OA_SCHEDULED, // OA scheduled
    OA_PASSED, // Passed OA
    OA_FAILED, // Failed OA

    // Vendor Screening Stage (Optional)
    VENDOR_SCREENING_SCHEDULED, // Vendor screening scheduled
    VENDOR_SCREENING_PASSED, // Passed vendor screening
    VENDOR_SCREENING_FAILED, // Failed vendor screening

    // Client Interview Stage (Dynamic rounds)
    CLIENT_INTERVIEW, // In client interview process (use currentRound for round number)

    // Final Status
    OFFERED, // Received offer
    OFFER_ACCEPTED, // Accepted offer
    OFFER_DECLINED, // Declined offer
    PLACED, // Started working
    REJECTED, // Rejected by client
    WITHDRAWN // Candidate withdrew
}
