'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { batchesApi, candidatesApi, Batch, Candidate } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StageBadge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, ChevronRight } from 'lucide-react';

export default function BatchDetailPage() {
    const params = useParams();
    const batchId = Number(params.id);
    const [batch, setBatch] = useState<Batch | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [batchId]);

    const loadData = async () => {
        try {
            const [batchData, allCandidates] = await Promise.all([
                batchesApi.getById(batchId),
                candidatesApi.getAll()
            ]);
            setBatch(batchData);
            // Filter candidates by this batch
            const batchCandidates = allCandidates.filter(c => c.batch?.id === batchId);
            setCandidates(batchCandidates);
        } catch (error) {
            console.error('Failed to load batch:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    if (!batch) {
        return <div className="text-muted-foreground">Batch not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/batches" className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{batch.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'} - {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {candidates.length} candidates
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{candidates.length}</div>
                        <div className="text-sm text-muted-foreground">Total Candidates</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                            {candidates.filter(c => c.lifecycleStage === 'TRAINING').length}
                        </div>
                        <div className="text-sm text-muted-foreground">In Training</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                            {candidates.filter(c => c.lifecycleStage === 'MARKET_READY').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Market Ready</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {candidates.filter(c => c.lifecycleStage === 'PLACED').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Placed</div>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates List */}
            <Card>
                <CardHeader>
                    <CardTitle>Candidates in Batch</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {candidates.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No candidates assigned to this batch yet
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted/30">
                                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Stage</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Recruiter</th>
                                    <th className="p-4 w-16"></th>
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
                                        <td className="p-4 text-muted-foreground">
                                            {candidate.recruiter?.name || '-'}
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
