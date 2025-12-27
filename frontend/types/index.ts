/**
 * Shared TypeScript types for VicCRM frontend
 */

// === Enums ===
export type CandidateStage =
    | 'SOURCING'
    | 'TRAINING'
    | 'RESUME'
    | 'MOCKING'
    | 'MARKETING'
    | 'OFFERED'
    | 'PLACED'
    | 'ELIMINATED'
    | 'WITHDRAWN'
    | 'ON_HOLD';

export type CandidateSubStatus =
    | 'SOURCED'
    | 'CONTACTED'
    | 'SCREENING_SCHEDULED'
    | 'SCREENING_PASSED'
    | 'SCREENING_FAILED'
    | 'TRAINING_CONTRACT_SENT'
    | 'TRAINING_CONTRACT_SIGNED'
    | 'BATCH_ASSIGNED'
    | 'DIRECT_MARKETING_READY'
    | 'IN_TRAINING'
    | 'RESUME_PREPARING'
    | 'RESUME_READY'
    | 'MOCK_THEORY_READY'
    | 'MOCK_THEORY_SCHEDULED'
    | 'MOCK_THEORY_PASSED'
    | 'MOCK_THEORY_FAILED'
    | 'MOCK_REAL_SCHEDULED'
    | 'MOCK_REAL_PASSED'
    | 'MOCK_REAL_FAILED'
    | 'MARKETING_ACTIVE'
    | 'OFFER_PENDING'
    | 'OFFER_ACCEPTED'
    | 'OFFER_DECLINED'
    | 'WAITING_DOCS'
    | 'PERSONAL_PAUSE'
    | 'VISA_ISSUE'
    | 'OTHER'
    | 'PLACED_CONFIRMED'
    | 'CLOSED'
    | 'SELF_WITHDRAWN';
export type WorkAuth = 'CITIZEN' | 'GC' | 'OPT' | 'H1B' | 'CPT' | 'OTHER';
export type UserRole = 'ADMIN' | 'RECRUITER' | 'TRAINER' | 'SUPPORTER' | 'MANAGER';

export type TimelineEventType =
    | 'CANDIDATE_CREATED'
    | 'STAGE_CHANGED'
    | 'SUBSTATUS_CHANGED'
    | 'ON_HOLD'
    | 'ELIMINATED'
    | 'WITHDRAWN'
    | 'REACTIVATED'
    | 'OFFERED'
    | 'PLACED'
    | 'NOTE'
    | 'STAGE_CHANGE'
    | 'COMMUNICATION'
    | 'CONTRACT'
    | 'BATCH'
    | 'READINESS'
    | 'MOCK'
    | 'INTERVIEW'
    | 'OUTCOME'
    | 'CLOSED'
    | 'VENDOR_SUBMIT'
    | 'VENDOR_OA'
    | 'VENDOR_INTERVIEW'
    | 'CLIENT_SUBMIT'
    | 'CLIENT_INTERVIEW';

export type CloseReason =
    | 'RETURNED_HOME'
    | 'FOUND_FULLTIME'
    | 'OTHER_OPPORTUNITY'
    | 'NO_HOMEWORK'
    | 'BEHAVIOR_ISSUE'
    | 'NO_RESPONSE';

export type OfferType = 'W2' | 'C2C';

// V2: Simplified submission status (manual update)
export type SubmissionStatus = 'ACTIVE' | 'OFFERED' | 'PLACED' | 'REJECTED' | 'WITHDRAWN';

// Step types for the tree-based pipeline
export type StepType = 'OA' | 'VENDOR_SCREENING' | 'CLIENT_INTERVIEW' | 'OFFER' | 'OFFER_ACCEPTED' | 'OFFER_DECLINED' | 'PLACED' | 'REJECTED' | 'WITHDRAWN';
export type StepResult = 'PENDING' | 'PASS' | 'FAIL';

// V2.0: Vendor Engagement and Opportunity types
export type AssessmentType = 'OA' | 'VENDOR_SCREENING';
export type StepState = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type EngagementStatus = 'ACTIVE' | 'INACTIVE';
export type OpportunityStatus = 'ACTIVE' | 'INTERVIEWING' | 'OFFERED' | 'PLACED';

// === Entities ===
export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface Batch {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface VendorContact {
    name: string;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    notes: string | null;
}

export interface Vendor {
    id: number;
    companyName: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
    clients: Client[];
    contacts: VendorContact[];
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    id: number;
    companyName: string;
    industry: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Candidate {
    id: number;
    // Basic Profile
    name: string;
    email: string;
    phone: string;
    wechatId: string | null;
    wechatName: string | null;
    discordName: string | null;
    linkedinUrl: string | null;
    marketingLinkedinUrl: string | null;
    techTags: string | null;
    workAuth: WorkAuth | null;
    city: string | null;
    state: string | null;
    relocation: boolean | null;
    school: string | null;
    major: string | null;
    // Lifecycle
    stage: CandidateStage;
    subStatus: CandidateSubStatus;
    lastActiveStage: CandidateStage | null;
    stageUpdatedAt: string;
    holdReason: string | null;
    nextFollowUpAt: string | null;
    closeReason: CloseReason | null;
    closeReasonNote: string | null;
    withdrawReason: string | null;
    reactivateReason: string | null;
    offerType: OfferType | null;
    offerDate: string | null;
    startDate: string | null;
    batch: Batch | null;
    recruiter: User | null;
    resumeReady: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// Position entity (V2)
export interface Position {
    id: number;
    title: string;
    client: Client;
    sourceVendor?: { id: number; companyName: string } | null;
    description: string | null;
    requirements: string | null;
    location: string | null;
    status: 'OPEN' | 'ON_HOLD' | 'CLOSED' | 'FILLED';
    notes: string | null;
    // Extended fields
    teamName: string | null;
    hiringManager: string | null;
    jobId: string | null;
    track: string | null;
    employmentType: string | null;  // CONTRACT, FULLTIME, C2H
    contractLength: string | null;
    billRate: number | null;
    payRate: number | null;
    headcount: number | null;
    jdUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

// Simplified Submission (V2)
export interface Submission {
    id: number;
    candidate: Candidate;
    vendor: Vendor;
    vendorContact: string | null;
    status: SubmissionStatus;
    notes: string | null;
    submittedAt: string;
    updatedAt: string;
}

// SubmissionStep for tree-based pipeline (V2)
export interface SubmissionStep {
    id: number;
    submission: { id: number };
    parentStep: { id: number } | null;
    type: StepType;
    position: Position | null;
    round: number | null;
    scheduledAt: string | null;
    completedAt: string | null;
    result: StepResult;
    feedback: string | null;
    score: string | null;
    createdAt: string;
}

export interface InterviewExperience {
    id: number;
    techCategory: string;
    client: Client | null;
    vendor: Vendor | null;
    candidate: Candidate | null;
    techTags: string | null;
    recordingUrl: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TimelineEvent {
    id: number;
    eventType: TimelineEventType;
    subType?: string;
    fromStage?: CandidateStage;
    toStage?: CandidateStage;
    subStatus?: CandidateSubStatus;
    closeReason?: CloseReason;
    title: string;
    description?: string;
    eventDate: string;
    createdBy?: User;
    metaJson?: string;
}

// Legacy alias for backwards compatibility
export type StageTransition = TimelineEvent;

export interface Mock {
    id: number;
    candidate: Candidate;
    evaluator: User;
    role: string | null;        // "Java" or "React"
    stage: string | null;       // "Screening", "TechMock", "RealMock"
    score: number | null;
    decision: string | null;    // "Strong Hire", "Hire", "Weak Hire", "No Hire"
    strengths: string | null;
    weaknesses: string | null;
    actionItems: string | null;
    summary: string | null;
    feedback: string | null;    // Legacy field
    completed: boolean;
    scheduledAt: string | null;
    completedAt: string | null;
    createdAt: string;
    criteriaRatings: MockCriteriaRating[];
}

export interface MockCriteria {
    id: number;
    role: string;               // "Java" or "React"
    stage: string;              // "Screening", "TechMock", "RealMock"
    name: string;
    description: string | null;
    displayOrder: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MockCriteriaRating {
    id: number;
    mockId: number;
    criteria: MockCriteria;
    score: number;              // 1-5
}

// === Document Types ===
export type DocumentType = 'RESUME' | 'CONTRACT' | 'DL' | 'OPT_EAD' | 'GC' | 'PASSPORT';

export interface CandidateDocument {
    id: number;
    candidateId: number;
    documentType: DocumentType;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    storageType: string;
    uploadedAt: string;
    notes: string;
}

// === V2.0 Submission Model ===

// VendorEngagement: Candidate × Vendor relationship
export interface VendorEngagement {
    id: number;
    candidate: { id: number };
    vendor: Vendor;
    status: EngagementStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// AssessmentAttempt: Vendor-side OA/Screening
export interface AssessmentAttempt {
    id: number;
    vendorEngagement: { id: number };
    attemptType: AssessmentType;
    track: string | null;
    state: StepState;
    result: StepResult;
    happenedAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// Opportunity: Submission instance (VendorEngagement × Position)
export interface Opportunity {
    id: number;
    vendorEngagement: VendorEngagement;
    position: Position;
    submittedAt: string | null;
    status: OpportunityStatus;
    statusOverride: OpportunityStatus | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// PipelineStep: Client-side step (tree structure)
export interface PipelineStep {
    id: number;
    opportunity: { id: number };
    parentStep: { id: number } | null;
    type: StepType;
    state: StepState;
    result: StepResult;
    round: number | null;
    scheduledAt: string | null;
    happenedAt: string | null;
    feedback: string | null;
    score: string | null;
    createdAt: string;
}

// OpportunityAttemptLink: Weak binding between Opportunity and Attempt
export interface OpportunityAttemptLink {
    id: number;
    opportunity: { id: number };
    attempt: AssessmentAttempt;
    createdAt: string;
}

// CandidateEngagementResponse: Aggregated view for candidate detail page
export interface VendorSummary {
    id: number;
    companyName: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
}

export interface AssessmentAttemptSummary {
    id: number;
    attemptType: AssessmentType;
    track: string | null;
    state: StepState;
    result: StepResult;
    happenedAt: string | null;
}

export interface PipelineStepSummary {
    id: number;
    type: StepType;
    state: StepState;
    result: StepResult;
    round?: number;
    happenedAt: string | null;
}

export interface OpportunitySummary {
    id: number;
    positionId: number;
    positionTitle: string;
    clientId: number;
    clientName: string;
    status: OpportunityStatus;
    submittedAt: string | null;
    latestStep: PipelineStepSummary | null;
}

export interface CandidateEngagementResponse {
    id: number;
    status: EngagementStatus;
    vendor: VendorSummary;
    attempts: AssessmentAttemptSummary[];
    opportunities: OpportunitySummary[];
}
