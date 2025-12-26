'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { candidatesApi, Candidate, CandidateStage } from '@/lib/api';
import { Users, UserCheck, GraduationCap, Briefcase, XCircle, BadgeCheck, PauseCircle, LogOut, Layers, FileText } from 'lucide-react';

const stageConfig: Record<CandidateStage, { label: string; icon: React.ElementType; color: string }> = {
    SOURCING: { label: 'Sourcing', icon: Users, color: 'text-blue-600 bg-blue-100' },
    TRAINING: { label: 'Training', icon: GraduationCap, color: 'text-amber-600 bg-amber-100' },
    RESUME: { label: 'Resume', icon: FileText, color: 'text-sky-600 bg-sky-100' },
    MOCKING: { label: 'Mocking', icon: Layers, color: 'text-violet-600 bg-violet-100' },
    MARKETING: { label: 'Marketing', icon: UserCheck, color: 'text-emerald-600 bg-emerald-100' },
    OFFERED: { label: 'Offered', icon: BadgeCheck, color: 'text-lime-600 bg-lime-100' },
    PLACED: { label: 'Placed', icon: Briefcase, color: 'text-indigo-600 bg-indigo-100' },
    ELIMINATED: { label: 'Eliminated', icon: XCircle, color: 'text-red-600 bg-red-100' },
    WITHDRAWN: { label: 'Withdrawn', icon: LogOut, color: 'text-rose-600 bg-rose-100' },
    ON_HOLD: { label: 'On Hold', icon: PauseCircle, color: 'text-gray-600 bg-gray-100' },
};

export default function DashboardPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        candidatesApi.getAll()
            .then(setCandidates)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const countByStage = (stage: CandidateStage) =>
        candidates.filter(c => c.stage === stage).length;

    const stages: CandidateStage[] = ['SOURCING', 'TRAINING', 'RESUME', 'MOCKING', 'MARKETING', 'OFFERED', 'PLACED', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of candidate pipeline</p>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-20" /></CardHeader>
                            <CardContent><div className="h-8 bg-muted rounded w-12" /></CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {stages.map(stage => {
                        const config = stageConfig[stage];
                        const Icon = config.icon;
                        const count = countByStage(stage);

                        return (
                            <Card key={stage} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {config.label}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${config.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{count}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {count === 1 ? 'candidate' : 'candidates'}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Candidates</span>
                                <span className="font-semibold">{candidates.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Active Pipeline</span>
                                <span className="font-semibold">
                                    {candidates.filter(c => !['PLACED', 'ELIMINATED', 'WITHDRAWN'].includes(c.stage)).length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Success Rate</span>
                                <span className="font-semibold text-emerald-600">
                                    {candidates.length > 0
                                        ? Math.round((countByStage('PLACED') / candidates.length) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {candidates.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No candidates yet. Add your first candidate!</p>
                        ) : (
                            <div className="space-y-3">
                                {candidates.slice(0, 5).map(candidate => (
                                    <div key={candidate.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-sm">{candidate.name}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${stageConfig[candidate.stage].color}`}>
                                            {stageConfig[candidate.stage].label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
