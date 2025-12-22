'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { candidatesApi, Candidate, StageTransition, LifecycleStage, WorkAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StageBadge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin, GraduationCap, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const allowedTransitions: Record<LifecycleStage, LifecycleStage[]> = {
    RECRUITMENT: ['TRAINING', 'ELIMINATED'],
    TRAINING: ['MARKET_READY', 'ELIMINATED'],
    MARKET_READY: ['PLACED', 'ELIMINATED'],
    PLACED: [],
    ELIMINATED: [],
};

const workAuthLabels: Record<WorkAuth, string> = {
    CITIZEN: 'US Citizen',
    GC: 'Green Card',
    OPT: 'OPT',
    H1B: 'H1B',
    CPT: 'CPT',
    OTHER: 'Other',
};

export default function CandidateDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [transitions, setTransitions] = useState<StageTransition[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'workspace' | 'profile'>('workspace');
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        if (id) {
            Promise.all([
                candidatesApi.getById(id),
                candidatesApi.getTransitions(id),
            ])
                .then(([c, t]) => {
                    setCandidate(c);
                    setTransitions(t);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleTransition = async (toStage: LifecycleStage) => {
        if (!candidate) return;
        setTransitioning(true);
        try {
            const updated = await candidatesApi.transition(candidate.id, toStage, `Moved to ${toStage}`);
            setCandidate(updated);
            const newTransitions = await candidatesApi.getTransitions(id);
            setTransitions(newTransitions);
        } catch (error) {
            console.error('Transition failed:', error);
        } finally {
            setTransitioning(false);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    if (!candidate) {
        return <div>Candidate not found</div>;
    }

    const nextStages = allowedTransitions[candidate.lifecycleStage];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Link href="/candidates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <span className="text-sm text-muted-foreground uppercase tracking-wide">Detail</span>
            </div>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                            {candidate.name.charAt(0)}
                        </div>

                        {/* Name & Meta */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold">{candidate.name}</h1>
                                <StageBadge stage={candidate.lifecycleStage} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {candidate.batches && candidate.batches.length > 0 && (
                                    <span className="flex items-center gap-1">
                                        📚 {candidate.batches.map(b => b.name).join(', ')}
                                    </span>
                                )}
                                {candidate.recruiter && (
                                    <span className="flex items-center gap-1">
                                        👤 Sourced by {candidate.recruiter.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Current Milestone */}
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Milestone</p>
                            <p className="text-xl font-semibold text-primary">
                                {candidate.lifecycleStage === 'PLACED' ? 'Placed' :
                                    candidate.lifecycleStage === 'ELIMINATED' ? 'Terminated' :
                                        'In Pipeline'}
                            </p>
                        </div>

                        {/* Contact Icons */}
                        <div className="flex gap-2">
                            {candidate.email && (
                                <a href={`mailto:${candidate.email}`} className="p-2 border rounded-lg hover:bg-muted">
                                    <Mail className="w-5 h-5" />
                                </a>
                            )}
                            {candidate.phone && (
                                <a href={`tel:${candidate.phone}`} className="p-2 border rounded-lg hover:bg-muted">
                                    <Phone className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setActiveTab('workspace')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'workspace'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Workspace
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'profile'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Candidate Profile
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'workspace' ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Market Entry Gate */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                ⚙️ Market Entry Gate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-xs",
                                    candidate.resumeReady ? "bg-emerald-500" : "bg-muted")}>
                                    {candidate.resumeReady && <Check className="w-3 h-3" />}
                                </div>
                                <span className={candidate.resumeReady ? "" : "text-muted-foreground"}>Resume Finalized</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs">
                                        <Clock className="w-3 h-3" />
                                    </div>
                                    <span className="text-muted-foreground">Completion Rate</span>
                                </div>
                                <span className="text-sm font-medium">{candidate.completionRate || 0}%</span>
                            </div>

                            {nextStages.length > 0 && (
                                <div className="pt-3 border-t space-y-2">
                                    {nextStages.map(stage => (
                                        <Button
                                            key={stage}
                                            className="w-full justify-between"
                                            variant={stage === 'ELIMINATED' ? 'destructive' : 'outline'}
                                            onClick={() => handleTransition(stage)}
                                            disabled={transitioning}
                                        >
                                            Move to {stage.replace('_', ' ')}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Compliance Card */}
                    <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                        <CardContent className="p-6">
                            <p className="text-xs uppercase tracking-wide opacity-80 mb-2">Compliance</p>
                            <p className="text-5xl font-bold">{candidate.completionRate || 0}%</p>
                        </CardContent>
                    </Card>

                    {/* Career Timeline */}
                    <Card className="md:col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                🕐 Career Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transitions.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No transitions yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {transitions.slice(0, 5).map((t, i) => (
                                        <div key={t.id} className="flex gap-3 relative">
                                            {i < transitions.length - 1 && (
                                                <div className="absolute left-[9px] top-6 w-0.5 h-8 bg-border" />
                                            )}
                                            <div className={cn("w-5 h-5 rounded-full shrink-0 mt-0.5",
                                                t.toStage === 'PLACED' ? 'bg-emerald-500' :
                                                    t.toStage === 'ELIMINATED' ? 'bg-red-500' : 'bg-primary'
                                            )} />
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(t.changedAt).toLocaleDateString()}
                                                </p>
                                                <p className="font-medium text-sm">{t.toStage.replace('_', ' ')}</p>
                                                <p className="text-xs text-muted-foreground">{t.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Profile Tab */
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{candidate.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="font-medium">{candidate.phone || '-'}</p>
                                </div>
                            </div>
                            {candidate.wechatId && (
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">💬</span>
                                    <div>
                                        <p className="text-xs text-muted-foreground">WeChat</p>
                                        <p className="font-medium">{candidate.wechatName || candidate.wechatId}</p>
                                    </div>
                                </div>
                            )}
                            {candidate.discordName && (
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">🎮</span>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Discord</p>
                                        <p className="font-medium">{candidate.discordName}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Background</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="font-medium">
                                        {[candidate.city, candidate.state].filter(Boolean).join(', ') || '-'}
                                        {candidate.relocation && <span className="text-xs text-muted-foreground ml-2">(Open to relocation)</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">🛂</span>
                                <div>
                                    <p className="text-xs text-muted-foreground">Work Authorization</p>
                                    <p className="font-medium">
                                        {candidate.workAuth ? workAuthLabels[candidate.workAuth] : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Education</p>
                                    <p className="font-medium">{candidate.education || '-'}</p>
                                </div>
                            </div>
                            {candidate.techTags && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.techTags.split(',').map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {candidate.notes && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{candidate.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
