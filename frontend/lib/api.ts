/**
 * API client for VicCRM backend
 */
import type { User, Batch, Candidate, TimelineEvent, LifecycleStage, Vendor, Client, Submission, InterviewExperience, VendorContact, Mock, MockCriteria, CandidateDocument, DocumentType } from '@/types';

// Re-export types for convenience
export type { User, Batch, Candidate, TimelineEvent, LifecycleStage, WorkAuth, UserRole, TimelineEventType, CloseReason, Vendor, Client, Submission, InterviewExperience, SubmissionStatus, ScreeningType, VendorContact, Mock, MockCriteria, MockCriteriaRating, CandidateDocument, DocumentType } from '@/types';

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
    delete: (id: number) => fetch(`${API_BASE_URL}/api/batches/${id}`, { method: 'DELETE' }),
};

// Candidates API
export const candidatesApi = {
    getAll: (stage?: LifecycleStage) => fetchApi<Candidate[]>(`/api/candidates${stage ? `?stage=${stage}` : ''}`),
    getById: (id: number) => fetchApi<Candidate>(`/api/candidates/${id}`),
    create: (data: Partial<Candidate>) => fetchApi<Candidate>('/api/candidates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Candidate>) => fetchApi<Candidate>(`/api/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    transition: (id: number, toStage: LifecycleStage, reason?: string) =>
        fetchApi<Candidate>(`/api/candidates/${id}/transition`, {
            method: 'POST',
            body: JSON.stringify({ toStage, reason })
        }),
    getTimeline: (id: number) => fetchApi<TimelineEvent[]>(`/api/candidates/${id}/timeline`),
    getTransitions: (id: number) => fetchApi<TimelineEvent[]>(`/api/candidates/${id}/timeline`),
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

// Submissions API
export const submissionsApi = {
    getAll: () => fetchApi<Submission[]>('/api/submissions'),
    getByCandidate: (candidateId: number) => fetchApi<Submission[]>(`/api/submissions/candidate/${candidateId}`),
    getByVendor: (vendorId: number) => fetchApi<Submission[]>(`/api/submissions/vendor/${vendorId}`),
    getById: (id: number) => fetchApi<Submission>(`/api/submissions/${id}`),
    create: (data: Partial<Submission>) => fetchApi<Submission>('/api/submissions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Submission>) => fetchApi<Submission>(`/api/submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    advanceRound: (id: number) => fetchApi<Submission>(`/api/submissions/${id}/advance`, { method: 'POST' }),
    delete: (id: number) => fetch(`${API_BASE_URL}/api/submissions/${id}`, { method: 'DELETE' }),
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
    getByCandidate: (candidateId: number) => fetchApi<CandidateDocument[]>(`/api/candidates/${candidateId}/documents`),
    upload: async (candidateId: number, file: File, documentType: DocumentType, notes?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        if (notes) formData.append('notes', notes);
        const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/documents`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        return response.json() as Promise<CandidateDocument>;
    },
    download: (candidateId: number, documentId: number) =>
        `${API_BASE_URL}/api/candidates/${candidateId}/documents/${documentId}/download`,
    delete: (candidateId: number, documentId: number) =>
        fetch(`${API_BASE_URL}/api/candidates/${candidateId}/documents/${documentId}`, { method: 'DELETE' }),
};
