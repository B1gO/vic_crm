/**
 * API client for VicCRM backend
 */
import type { User, Batch, Candidate, TimelineEvent, CandidateStage, CandidateSubStatus, CloseReason, OfferType, Vendor, Client, StepResult, Position, InterviewExperience, VendorContact, Mock, MockCriteria, CandidateDocument, DocumentType, VendorEngagement, AssessmentAttempt, Opportunity, PipelineStep, OpportunityAttemptLink, CandidateEngagementResponse, AssessmentType, StepState, StepType } from '@/types';

// Re-export types for convenience
export type { User, Batch, Candidate, TimelineEvent, CandidateStage, CandidateSubStatus, WorkAuth, UserRole, TimelineEventType, CloseReason, OfferType, Vendor, Client, StepType, StepResult, Position, InterviewExperience, VendorContact, Mock, MockCriteria, MockCriteriaRating, CandidateDocument, DocumentType, VendorEngagement, AssessmentAttempt, Opportunity, PipelineStep, OpportunityAttemptLink, CandidateEngagementResponse, AssessmentType, StepState } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'API Error' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
}

// Users API
export const usersApi = {
    getAll: () => fetchApi<User[]>('/api/users'),
    getById: (id: number) => fetchApi<User>(`/api/users/${id}`),
    create: (data: Partial<User>) => fetchApi<User>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<User>) => fetchApi<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE' }),
};

// Batches API
export const batchesApi = {
    getAll: () => fetchApi<Batch[]>('/api/batches'),
    getById: (id: number) => fetchApi<Batch>(`/api/batches/${id}`),
    create: (data: Partial<Batch>) => fetchApi<Batch>('/api/batches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Batch>) => fetchApi<Batch>(`/api/batches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    start: (id: number) => fetchApi<Batch>(`/api/batches/${id}/start`, { method: 'POST' }),
    end: (id: number) => fetchApi<Batch>(`/api/batches/${id}/end`, { method: 'POST' }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/batches/${id}`, { method: 'DELETE' }),
};

// Candidates API
export const candidatesApi = {
    getAll: (stage?: CandidateStage) => fetchApi<Candidate[]>(`/api/candidates${stage ? `?stage=${stage}` : ''}`),
    getById: (id: number) => fetchApi<Candidate>(`/api/candidates/${id}`),
    create: (data: Partial<Candidate>) => fetchApi<Candidate>('/api/candidates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Candidate>) => fetchApi<Candidate>(`/api/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    transition: (id: number, payload: {
        toStage: CandidateStage;
        toSubStatus?: CandidateSubStatus;
        reason?: string;
        closeReason?: CloseReason;
        withdrawReason?: string;
        holdReason?: string;
        nextFollowUpAt?: string;
        reactivateReason?: string;
        offerType?: OfferType;
        offerDate?: string;
        startDate?: string;
        actorId?: number;
    }) =>
        fetchApi<Candidate>(`/api/candidates/${id}/transition`, {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    updateSubStatus: (id: number, payload: {
        subStatus: CandidateSubStatus;
        reason?: string;
        actorId?: number;
    }) =>
        fetchApi<Candidate>(`/api/candidates/${id}/substatus`, {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    getTimeline: (id: number) => fetchApi<TimelineEvent[]>(`/api/candidates/${id}/timeline`),
    getTransitions: (id: number) => fetchApi<TimelineEvent[]>(`/api/candidates/${id}/timeline`),
    getEngagements: (id: number) => fetchApi<CandidateEngagementResponse[]>(`/api/candidates/${id}/engagements`),
};

// Vendors API
export const vendorsApi = {
    getAll: () => fetchApi<Vendor[]>('/api/vendors'),
    getById: (id: number) => fetchApi<Vendor>(`/api/vendors/${id}`),
    create: (data: Partial<Vendor>) => fetchApi<Vendor>('/api/vendors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Vendor>) => fetchApi<Vendor>(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/vendors/${id}`, { method: 'DELETE' }),
};

// Clients API
export const clientsApi = {
    getAll: () => fetchApi<Client[]>('/api/clients'),
    getById: (id: number) => fetchApi<Client>(`/api/clients/${id}`),
    create: (data: Partial<Client>) => fetchApi<Client>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Client>) => fetchApi<Client>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/clients/${id}`, { method: 'DELETE' }),
};

// Positions API
export const positionsApi = {
    getAll: (clientId?: number) => fetchApi<Position[]>(`/api/positions${clientId ? `?clientId=${clientId}` : ''}`),
    getOpen: () => fetchApi<Position[]>('/api/positions/open'),
    getById: (id: number) => fetchApi<Position>(`/api/positions/${id}`),
    create: (data: Partial<Position>) => fetchApi<Position>('/api/positions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Position>) => fetchApi<Position>(`/api/positions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/positions/${id}`, { method: 'DELETE' }),
};

// Interview Experiences API
export const interviewsApi = {
    getAll: (category?: string) => fetchApi<InterviewExperience[]>(`/api/interviews${category ? `?category=${category}` : ''}`),
    getByCandidate: (candidateId: number) => fetchApi<InterviewExperience[]>(`/api/interviews/candidate/${candidateId}`),
    getById: (id: number) => fetchApi<InterviewExperience>(`/api/interviews/${id}`),
    create: (data: Partial<InterviewExperience>) => fetchApi<InterviewExperience>('/api/interviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<InterviewExperience>) => fetchApi<InterviewExperience>(`/api/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/interviews/${id}`, { method: 'DELETE' }),
};

// Mocks API
export const mocksApi = {
    getAll: () => fetchApi<Mock[]>('/api/mocks'),
    getById: (id: number) => fetchApi<Mock>(`/api/mocks/${id}`),
    getByCandidate: (candidateId: number) => fetchApi<Mock[]>(`/api/mocks/candidate/${candidateId}`),
    getByEvaluator: (evaluatorId: number) => fetchApi<Mock[]>(`/api/mocks/evaluator/${evaluatorId}`),
    create: (data: Partial<Mock>) => fetchApi<Mock>('/api/mocks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Mock>) => fetchApi<Mock>(`/api/mocks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/mocks/${id}`, { method: 'DELETE' }),
};

// Mock Criteria API
export const mockCriteriaApi = {
    getAll: () => fetchApi<MockCriteria[]>('/api/mock-criteria'),
    getByRoleAndStage: (role: string, stage: string) => fetchApi<MockCriteria[]>(`/api/mock-criteria/by-role-stage?role=${role}&stage=${stage}`),
    getById: (id: number) => fetchApi<MockCriteria>(`/api/mock-criteria/${id}`),
    create: (data: Partial<MockCriteria>) => fetchApi<MockCriteria>('/api/mock-criteria', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<MockCriteria>) => fetchApi<MockCriteria>(`/api/mock-criteria/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/mock-criteria/${id}`, { method: 'DELETE' }),
};

// Documents API
export const documentsApi = {
    getByCandidate: (candidateId: number) => fetchApi<CandidateDocument[]>(`/api/documents/candidate/${candidateId}`),
    getById: (id: number) => fetchApi<CandidateDocument>(`/api/documents/${id}`),
    upload: async (candidateId: number, file: File, documentType: DocumentType, notes?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('candidateId', candidateId.toString());
        formData.append('documentType', documentType);
        if (notes) formData.append('notes', notes);

        const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || `HTTP ${res.status}`);
        }

        return res.json() as Promise<CandidateDocument>;
    },
    delete: (id: number) => fetch(`${API_BASE_URL}/api/documents/${id}`, { method: 'DELETE' }),
    getDownloadUrl: (id: number) => `${API_BASE_URL}/api/documents/${id}/download`,
};

// Vendor Engagements API
export const vendorEngagementsApi = {
    getById: (id: number) => fetchApi<VendorEngagement>(`/api/vendor-engagements/${id}`),
    create: (data: { candidateId: number; vendorId: number }) =>
        fetchApi<VendorEngagement>('/api/vendor-engagements', { method: 'POST', body: JSON.stringify(data) }),
    getAttempts: (id: number, params?: { attemptType?: AssessmentType; track?: string; limit?: number }) => {
        const qs = new URLSearchParams();
        if (params?.attemptType) qs.set('attemptType', params.attemptType);
        if (params?.track) qs.set('track', params.track);
        if (params?.limit) qs.set('limit', params.limit.toString());
        return fetchApi<AssessmentAttempt[]>(`/api/vendor-engagements/${id}/attempts${qs.toString() ? '?' + qs : ''}`);
    },
    createAttempt: (id: number, data: {
        attemptType: AssessmentType;
        track?: string;
        state?: StepState;
        result?: StepResult;
        happenedAt?: string;
        notes?: string;
    }) => fetchApi<AssessmentAttempt>(`/api/vendor-engagements/${id}/attempts`, { method: 'POST', body: JSON.stringify(data) }),
    createOpportunity: (id: number, data: {
        positionId: number;
        submittedAt?: string;
        attachAttemptIds?: number[];
    }) => fetchApi<Opportunity>(`/api/vendor-engagements/${id}/opportunities`, { method: 'POST', body: JSON.stringify(data) }),
};

// Opportunities API
export const opportunitiesApi = {
    getById: (id: number) => fetchApi<Opportunity>(`/api/opportunities/${id}`),
    getSteps: (id: number) => fetchApi<PipelineStep[]>(`/api/opportunities/${id}/steps`),
    createStep: (id: number, data: {
        parentStepId?: number | null;
        type: StepType;
        state?: StepState;
        result?: StepResult;
        round?: number;
        scheduledAt?: string;
        happenedAt?: string;
        feedback?: string;
        score?: string;
    }) => fetchApi<PipelineStep>(`/api/opportunities/${id}/steps`, { method: 'POST', body: JSON.stringify(data) }),
    getAttemptLinks: (id: number) => fetchApi<OpportunityAttemptLink[]>(`/api/opportunities/${id}/attempt-links`),
    attachAttempt: (id: number, attemptId: number) =>
        fetchApi<OpportunityAttemptLink[]>(`/api/opportunities/${id}/attempt-links`,
            { method: 'POST', body: JSON.stringify({ attemptId }) }),
    detachAttempt: (id: number, attemptId: number) =>
        fetch(`${API_BASE_URL}/api/opportunities/${id}/attempt-links/${attemptId}`, { method: 'DELETE' }),
};

// Pipeline Steps API
export const pipelineStepsApi = {
    update: (id: number, data: {
        state?: StepState;
        result?: StepResult;
        happenedAt?: string;
        feedback?: string;
        score?: string;
    }) => fetchApi<PipelineStep>(`/api/pipeline-steps/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Assessment Attempts API
export const assessmentAttemptsApi = {
    update: (id: number, data: {
        state?: StepState;
        result?: StepResult;
        happenedAt?: string;
        notes?: string;
    }) => fetchApi<AssessmentAttempt>(`/api/assessment-attempts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
