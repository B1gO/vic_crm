package com.vic.crm.enums;

/**
 * Types of events in the candidate career timeline
 */
public enum TimelineEventType {
    STAGE_CHANGE, // Lifecycle stage transitions (auto)
    COMMUNICATION, // talked, scheduled_screening
    CONTRACT, // contract_sent, contract_signed
    BATCH, // batch_started, batch_ended
    READINESS, // resume_ready
    MOCK, // tech_mock, general_mock (future)
    INTERVIEW, // vendor_oa, client (future)
    OUTCOME, // offer, placed
    CLOSED // closed with reason
}
