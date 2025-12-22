'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { batchesApi, BatchDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

export default function BatchDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const [batch, setBatch] = useState<BatchDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            batchesApi.getDetail(id)
                .then(setBatch)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    if (!batch) {
        return <div>Batch not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/batches">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <span className="text-sm text-muted-foreground uppercase tracking-wide">Back to Cohorts</span>
            </div>

            {/* Batch Info Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white">
                            <Users className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{batch.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                {batch.trainer && (
                                    <span className="flex items-center gap-1">
                                        👤 {batch.trainer.name}
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${batch.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {batch.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase">Total Candidates</p>
                            <p className="text-2xl font-bold">{batch.totalCandidates}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sourcing Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        📊 Sourcing Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {batch.recruiterStats.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                            No candidates assigned to this batch yet
                        </div>
                    ) : (
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
                                {batch.recruiterStats.map(stat => (
                                    <tr key={stat.recruiterId} className="border-b border-border last:border-0">
                                        <td className="p-4 font-medium">{stat.recruiterName}</td>
                                        <td className="p-4 text-center">{stat.sourced}</td>
                                        <td className="p-4 text-center text-primary font-medium">{stat.ready}</td>
                                        <td className="p-4 text-center text-emerald-600 font-medium">{stat.placed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Batch Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        📅 Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Start Date</p>
                            <p className="font-medium">{batch.startDate || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">End Date</p>
                            <p className="font-medium">{batch.endDate || '-'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
