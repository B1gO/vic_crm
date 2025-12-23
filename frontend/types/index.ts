/**
 * Shared TypeScript types for VicCRM frontend
 */

// === Enums ===
export type LifecycleStage = 'RECRUITMENT' | 'TRAINING' | 'MARKET_READY' | 'PLACED' | 'ELIMINATED';
export type WorkAuth = 'CITIZEN' | 'GC' | 'OPT' | 'H1B' | 'CPT' | 'OTHER';
export type UserRole = 'ADMIN' | 'RECRUITER' | 'TRAINER' | 'SUPPORTER' | 'MANAGER';

export type TimelineEventType =
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
    education: string | null;
    // Workspace
    lifecycleStage: LifecycleStage;
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
    fromStage?: LifecycleStage;
    toStage?: LifecycleStage;
    closeReason?: CloseReason;
    title: string;
    description?: string;
    eventDate: string;
    createdBy?: User;
}

// Legacy alias for backwards compatibility
export type StageTransition = TimelineEvent;

