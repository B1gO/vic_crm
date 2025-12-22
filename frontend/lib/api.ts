/**
 * API client for VicCRM backend
 */
import type { User, Batch, Candidate, TimelineEvent, LifecycleStage } from '@/types';

// Re-export types for convenience
export type { User, Batch, Candidate, TimelineEvent, LifecycleStage, WorkAuth, UserRole, TimelineEventType, CloseReason } from '@/types';

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
    // Legacy alias
    getTransitions: (id: number) => fetchApi<TimelineEvent[]>(`/api/candidates/${id}/timeline`),
};
