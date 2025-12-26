'use client';

import Link from 'next/link';
import { Candidate, CandidateSubStatus, WorkAuth } from '@/lib/api';
import { StageBadge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

const workAuthLabels: Record<WorkAuth, string> = {
    CITIZEN: 'Citizen',
    GC: 'GC',
    OPT: 'OPT',
    H1B: 'H1B',
    CPT: 'CPT',
    OTHER: 'Other',
};

const subStatusLabels: Partial<Record<CandidateSubStatus, string>> = {
    SOURCED: 'Sourced',
    CONTACTED: 'Contacted',
    SCREENING_SCHEDULED: 'Screening',
    SCREENING_PASSED: 'Passed',
    SCREENING_FAILED: 'Failed',
    TRAINING_CONTRACT_SENT: 'Contract Sent',
    TRAINING_CONTRACT_SIGNED: 'Contract Signed',
    BATCH_ASSIGNED: 'Batch Assigned',
    DIRECT_MARKETING_READY: 'Direct Mkt',
    IN_TRAINING: 'In Training',
    RESUME_PREPARING: 'Resume Prep',
    RESUME_READY: 'Resume Ready',
    MOCK_THEORY_READY: 'Theory Ready',
    MOCK_THEORY_SCHEDULED: 'Theory Scheduled',
    MOCK_THEORY_PASSED: 'Theory Passed',
    MOCK_THEORY_FAILED: 'Theory Failed',
    MOCK_REAL_SCHEDULED: 'Real Scheduled',
    MOCK_REAL_PASSED: 'Real Passed',
    MOCK_REAL_FAILED: 'Real Failed',
    MARKETING_ACTIVE: 'Marketing',
    OFFER_PENDING: 'Offer Pending',
    OFFER_ACCEPTED: 'Offer Accepted',
    OFFER_DECLINED: 'Offer Declined',
    PLACED_CONFIRMED: 'Placed',
    CLOSED: 'Closed',
    SELF_WITHDRAWN: 'Withdrawn',
};

const subStatusColors: Partial<Record<CandidateSubStatus, string>> = {
    SOURCED: 'bg-gray-500/20 text-gray-400',
    CONTACTED: 'bg-slate-500/20 text-slate-400',
    SCREENING_SCHEDULED: 'bg-blue-500/20 text-blue-400',
    SCREENING_PASSED: 'bg-green-500/20 text-green-400',
    SCREENING_FAILED: 'bg-red-500/20 text-red-400',
    TRAINING_CONTRACT_SENT: 'bg-indigo-500/20 text-indigo-400',
    TRAINING_CONTRACT_SIGNED: 'bg-indigo-600/20 text-indigo-500',
    BATCH_ASSIGNED: 'bg-purple-500/20 text-purple-400',
    DIRECT_MARKETING_READY: 'bg-purple-500/20 text-purple-400',
    IN_TRAINING: 'bg-amber-500/20 text-amber-500',
    RESUME_PREPARING: 'bg-sky-500/20 text-sky-500',
    RESUME_READY: 'bg-emerald-500/20 text-emerald-500',
    MOCK_THEORY_READY: 'bg-violet-500/20 text-violet-500',
    MOCK_THEORY_SCHEDULED: 'bg-violet-500/20 text-violet-500',
    MOCK_THEORY_PASSED: 'bg-green-500/20 text-green-500',
    MOCK_THEORY_FAILED: 'bg-red-500/20 text-red-500',
    MOCK_REAL_SCHEDULED: 'bg-blue-500/20 text-blue-500',
    MOCK_REAL_PASSED: 'bg-emerald-500/20 text-emerald-500',
    MOCK_REAL_FAILED: 'bg-rose-500/20 text-rose-500',
    MARKETING_ACTIVE: 'bg-emerald-500/20 text-emerald-500',
    OFFER_PENDING: 'bg-lime-500/20 text-lime-500',
    OFFER_ACCEPTED: 'bg-green-600/20 text-green-600',
    OFFER_DECLINED: 'bg-rose-500/20 text-rose-500',
    PLACED_CONFIRMED: 'bg-indigo-600/20 text-indigo-600',
    CLOSED: 'bg-red-600/20 text-red-600',
    SELF_WITHDRAWN: 'bg-rose-600/20 text-rose-600',
};

interface CandidateTableProps {
    candidates: Candidate[];
    emptyMessage?: string;
}

export function CandidateTable({ candidates, emptyMessage = 'No candidates yet' }: CandidateTableProps) {
    if (candidates.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4">WeChat</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Visa</th>
                    <th className="p-4 w-16">Action</th>
                </tr>
            </thead>
            <tbody>
                {candidates.map(candidate => (
                    <tr key={candidate.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                            <Link href={`/candidates/${candidate.id}`} className="font-medium hover:text-primary transition-colors">
                                {candidate.name}
                            </Link>
                        </td>
                        <td className="p-4">
                            {candidate.subStatus && !(candidate.stage === 'MARKETING' && candidate.subStatus === 'MARKETING_ACTIVE') ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subStatusColors[candidate.subStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                                    {subStatusLabels[candidate.subStatus] || candidate.subStatus.replace(/_/g, ' ')}
                                </span>
                            ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                            )}
                        </td>
                        <td className="p-4">
                            <StageBadge stage={candidate.stage} />
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                            {candidate.batch?.name || '-'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                            {candidate.wechatName || candidate.wechatId || '-'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                            <span>
                                {[candidate.city, candidate.state].filter(Boolean).join(', ') || '-'}
                            </span>
                            {candidate.relocation && (
                                <span className="ml-2 text-xs text-green-500" title="Open to relocation">✓ Relo</span>
                            )}
                        </td>
                        <td className="p-4">
                            {candidate.workAuth ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-white">
                                    {workAuthLabels[candidate.workAuth]}
                                </span>
                            ) : '-'}
                        </td>
                        <td className="p-4">
                            <Link href={`/candidates/${candidate.id}`}>
                                <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
