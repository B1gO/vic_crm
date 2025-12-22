/**
 * Shared TypeScript types for VicCRM frontend
 */

// === Enums ===
export type LifecycleStage = 'RECRUITMENT' | 'TRAINING' | 'MARKET_READY' | 'PLACED' | 'ELIMINATED';
export type WorkAuth = 'CITIZEN' | 'GC' | 'OPT' | 'H1B' | 'CPT' | 'OTHER';
export type UserRole = 'ADMIN' | 'RECRUITER' | 'TRAINER' | 'MANAGER';
export type BatchStatus = 'ACTIVE' | 'COMPLETED';

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
    status: BatchStatus;
    trainer: User | null;
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
    batches: Batch[];  // ManyToMany: 1-2 batches
    recruiter: User | null;
    resumeReady: boolean;
    completionRate: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StageTransition {
    id: number;
    fromStage: LifecycleStage;
    toStage: LifecycleStage;
    reason: string;
    changedBy: User | null;
    changedAt: string;
}

// === DTOs ===
export interface RecruiterStats {
    recruiterId: number;
    recruiterName: string;
    sourced: number;
    ready: number;
    placed: number;
}

export interface BatchDetail {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: BatchStatus;
    trainer: User | null;
    createdAt: string;
    totalCandidates: number;
    recruiterStats: RecruiterStats[];
}
