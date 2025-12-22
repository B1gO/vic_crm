/**
 * Shared TypeScript types for VicCRM frontend
 */

// === Enums ===
export type LifecycleStage = 'RECRUITMENT' | 'TRAINING' | 'MARKET_READY' | 'PLACED' | 'ELIMINATED';
export type WorkAuth = 'CITIZEN' | 'GC' | 'OPT' | 'H1B' | 'CPT' | 'OTHER';
export type UserRole = 'ADMIN' | 'RECRUITER' | 'TRAINER' | 'MANAGER';

export type TimelineEventType =
    | 'STAGE_CHANGE'
    | 'COMMUNICATION'
    | 'CONTRACT'
    | 'BATCH'
    | 'READINESS'
    | 'MOCK'
    | 'INTERVIEW'
    | 'OUTCOME'
    | 'CLOSED';

export type CloseReason =
    | 'RETURNED_HOME'
    | 'FOUND_FULLTIME'
    | 'OTHER_OPPORTUNITY'
    | 'NO_HOMEWORK'
    | 'BEHAVIOR_ISSUE'
    | 'NO_RESPONSE';

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

export interface Candidate {
    id: number;
    // Basic Profile
    name: string;
    email: string;
    phone: string;
    wechatId: string | null;
    wechatName: string | null;
    discordName: string | null;
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
