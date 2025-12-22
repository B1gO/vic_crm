'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { batchesApi, candidatesApi, Batch, Candidate } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateTable } from '@/components/CandidateTable';
import { ArrowLeft, Calendar, Users, BarChart3, Search } from 'lucide-react';

export default function BatchDetailPage() {
    const params = useParams();
    const batchId = Number(params.id);
    const [batch, setBatch] = useState<Batch | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

            {/* Sourcing Performance */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="uppercase tracking-wide">Sourcing Performance</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {(() => {
                        // Group candidates by recruiter
                        const recruiterStats = candidates.reduce((acc, c) => {
                            const recruiterName = c.recruiter?.name || 'Unassigned';
                            if (!acc[recruiterName]) {
                                acc[recruiterName] = { sourced: 0, ready: 0, placed: 0 };
                            }
                            acc[recruiterName].sourced++;
                            if (c.lifecycleStage === 'MARKET_READY') acc[recruiterName].ready++;
                            if (c.lifecycleStage === 'PLACED') acc[recruiterName].placed++;
                            return acc;
                        }, {} as Record<string, { sourced: number; ready: number; placed: number }>);

                        const recruiterNames = Object.keys(recruiterStats);
                        if (recruiterNames.length === 0) {
                            return <div className="p-8 text-center text-muted-foreground">No sourcing data available</div>;
                        }

                        return (
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/30">
                                    <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        <th className="p-4">Recruiter</th>
                                        <th className="p-4 text-center">Sourced</th>
                                        <th className="p-4 text-center">Ready</th>
                                        <th className="p-4 text-center">Placed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recruiterNames.map(name => (
                                        <tr key={name} className="border-b border-border last:border-0">
                                            <td className="p-4 font-medium">{name}</td>
                                            <td className="p-4 text-center">{recruiterStats[name].sourced}</td>
                                            <td className="p-4 text-center font-semibold text-blue-600">{recruiterStats[name].ready}</td>
                                            <td className="p-4 text-center font-semibold text-green-600">{recruiterStats[name].placed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* Candidates List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg">Candidates in Batch</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <CandidateTable
                        candidates={candidates.filter(c =>
                            c.name.toLowerCase().includes(search.toLowerCase()) ||
                            c.city?.toLowerCase().includes(search.toLowerCase()) ||
                            c.email?.toLowerCase().includes(search.toLowerCase())
                        )}
                        emptyMessage={search ? 'No candidates match your search' : 'No candidates assigned to this batch yet'}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
