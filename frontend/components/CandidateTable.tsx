'use client';

import Link from 'next/link';
import { Candidate, WorkAuth } from '@/lib/api';
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
                    <th className="p-4">Stage</th>
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
                            <StageBadge stage={candidate.lifecycleStage} />
                        </td>
                        <td className="p-4 text-muted-foreground">
                            {[candidate.city, candidate.state].filter(Boolean).join(', ') || '-'}
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
