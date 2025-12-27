package com.vic.crm.enums;

/**
 * Types of events in the candidate career timeline
 */
public enum TimelineEventType {
    CANDIDATE_CREATED, // candidate created
    STAGE_CHANGED, // stage transitioned
    SUBSTATUS_CHANGED, // sub-status updated
    ON_HOLD, // put on hold
    ELIMINATED, // eliminated/closed
    WITHDRAWN, // candidate withdrawn
    REACTIVATED, // reactivated from eliminated/withdrawn
    OFFERED, // offer issued/accepted
    PLACED, // placed successfully
    NOTE, // manual note

    STAGE_CHANGE, // Lifecycle stage transitions (auto)
    COMMUNICATION, // talked, scheduled_screening
    CONTRACT, // contract_sent, contract_signed
    BATCH, // batch_started, batch_ended
    READINESS, // resume_ready
    MOCK, // tech_mock, general_mock
    INTERVIEW, // general interview events
    OUTCOME, // offer, placed
    CLOSED, // closed with reason
    // Vendor/Client engagement events
    VENDOR_SUBMIT, // submitted to vendor
    VENDOR_OA, // vendor online assessment
    VENDOR_INTERVIEW, // vendor interview
    CLIENT_SUBMIT, // submitted to client
    CLIENT_INTERVIEW // client interview round
}
