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
    DIRECT_MARKETING_READY: 'Direct Mkt',
    IN_TRAINING: 'In Training',
    TRAINING_COMPLETED: 'Training Done',
    RESUME_READY: 'Resume Ready',
    VENDOR_OUTREACH: 'Vendor Outreach',
    SUBMITTED: 'Submitted',
    VENDOR_SCREEN: 'Vendor Screen',
    CLIENT_ROUND_1: 'Client R1',
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
    DIRECT_MARKETING_READY: 'bg-purple-500/20 text-purple-400',
    IN_TRAINING: 'bg-amber-500/20 text-amber-500',
    TRAINING_COMPLETED: 'bg-emerald-500/20 text-emerald-500',
    RESUME_READY: 'bg-emerald-500/20 text-emerald-500',
    VENDOR_OUTREACH: 'bg-cyan-500/20 text-cyan-500',
    SUBMITTED: 'bg-indigo-500/20 text-indigo-500',
    VENDOR_SCREEN: 'bg-blue-500/20 text-blue-500',
    CLIENT_ROUND_1: 'bg-sky-500/20 text-sky-500',
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
                            {candidate.subStatus && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subStatusColors[candidate.subStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                                    {subStatusLabels[candidate.subStatus] || candidate.subStatus.replace(/_/g, ' ')}
                                </span>
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
