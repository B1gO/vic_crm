/**
 * Shared TypeScript types for VicCRM frontend
 */

// === Enums ===
export type CandidateStage =
    | 'SOURCING'
    | 'TRAINING'
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

export type SubmissionStatus = 'VENDOR_SCREENING' | 'CLIENT_ROUND' | 'OFFERED' | 'PLACED' | 'REJECTED';
export type ScreeningType = 'OA' | 'INTERVIEW' | 'DIRECT';

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
    completionRate: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Submission {
    id: number;
    candidate: Candidate;
    vendor: Vendor;
    client: Client | null;
    vendorContact: string | null;  // Vendor's contact name
    positionTitle: string;
    status: SubmissionStatus;
    screeningType: ScreeningType | null;
    currentRound: number;
    notes: string | null;
    submittedAt: string;
    updatedAt: string;
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
