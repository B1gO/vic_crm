'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { candidatesApi, submissionsApi, vendorsApi, clientsApi, usersApi, mocksApi, documentsApi, batchesApi, Candidate, TimelineEvent, CandidateStage, CandidateSubStatus, CloseReason, OfferType, WorkAuth, Submission, Vendor, Client, User, Mock, CandidateDocument, DocumentType, Batch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StageBadge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin, GraduationCap, Check, Clock, FileText, Users, BookOpen, X, Plus, Building2, Send, Star, MessageSquare, Upload, Download, Trash2, File, Pencil } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
    VENDOR_SCREENING: 'bg-yellow-500/10 text-yellow-600',
    CLIENT_ROUND: 'bg-blue-500/10 text-blue-600',
    OFFERED: 'bg-green-500/10 text-green-600',
    PLACED: 'bg-emerald-500/10 text-emerald-600',
    REJECTED: 'bg-red-500/10 text-red-600',
};

const statusLabels: Record<string, string> = {
    VENDOR_SCREENING: 'Vendor Screening',
    CLIENT_ROUND: 'Client Round',
    OFFERED: 'Offered',
    PLACED: 'Placed',
    REJECTED: 'Rejected',
};

const allowedTransitions: Record<CandidateStage, CandidateStage[]> = {
    SOURCING: ['TRAINING', 'MARKETING', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'],
    TRAINING: ['RESUME', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'],
    RESUME: ['MOCKING', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'],
    MOCKING: ['MARKETING', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'],
    MARKETING: ['OFFERED', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'],
    OFFERED: ['PLACED', 'MARKETING', 'ELIMINATED', 'WITHDRAWN', 'ON_HOLD'],
    PLACED: ['MARKETING', 'ELIMINATED', 'WITHDRAWN'],
    ELIMINATED: ['SOURCING', 'TRAINING', 'RESUME', 'MOCKING', 'MARKETING', 'OFFERED'],
    WITHDRAWN: ['SOURCING', 'TRAINING', 'RESUME', 'MOCKING', 'MARKETING', 'OFFERED'],
    ON_HOLD: ['SOURCING', 'TRAINING', 'RESUME', 'MOCKING', 'MARKETING', 'OFFERED'],
};

const stageOrder: CandidateStage[] = [
    'SOURCING',
    'TRAINING',
    'RESUME',
    'MOCKING',
    'MARKETING',
    'OFFERED',
    'PLACED',
    'ON_HOLD',
    'ELIMINATED',
    'WITHDRAWN',
];

const subStatusOptionsByStage: Record<CandidateStage, CandidateSubStatus[]> = {
    SOURCING: [
        'SOURCED',
        'CONTACTED',
        'SCREENING_SCHEDULED',
        'SCREENING_PASSED',
        'SCREENING_FAILED',
        'TRAINING_CONTRACT_SENT',
        'TRAINING_CONTRACT_SIGNED',
        'BATCH_ASSIGNED',
        'DIRECT_MARKETING_READY',
    ],
    TRAINING: ['IN_TRAINING'],
    RESUME: ['RESUME_PREPARING', 'RESUME_READY'],
    MOCKING: [
        'MOCK_THEORY_READY',
        'MOCK_THEORY_SCHEDULED',
        'MOCK_THEORY_PASSED',
        'MOCK_THEORY_FAILED',
        'MOCK_REAL_SCHEDULED',
        'MOCK_REAL_PASSED',
        'MOCK_REAL_FAILED',
    ],
    MARKETING: [],
    OFFERED: ['OFFER_PENDING', 'OFFER_ACCEPTED', 'OFFER_DECLINED'],
    ON_HOLD: ['WAITING_DOCS', 'PERSONAL_PAUSE', 'VISA_ISSUE', 'OTHER'],
    PLACED: ['PLACED_CONFIRMED'],
    ELIMINATED: ['CLOSED'],
    WITHDRAWN: ['SELF_WITHDRAWN'],
};

const workAuthLabels: Record<WorkAuth, string> = {
    CITIZEN: 'US Citizen',
    GC: 'Green Card',
    OPT: 'OPT',
    H1B: 'H1B',
    CPT: 'CPT',
    OTHER: 'Other',
};

const closeReasonOptions: CloseReason[] = [
    'RETURNED_HOME',
    'FOUND_FULLTIME',
    'OTHER_OPPORTUNITY',
    'NO_HOMEWORK',
    'BEHAVIOR_ISSUE',
    'NO_RESPONSE'
];

const offerTypeOptions: OfferType[] = ['W2', 'C2C'];

export default function CandidateDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'workspace' | 'profile' | 'submissions' | 'mocks' | 'documents'>('workspace');
    const [transitioning, setTransitioning] = useState(false);
    const [transitionError, setTransitionError] = useState<string | null>(null);
    const [mocks, setMocks] = useState<Mock[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [showMockForm, setShowMockForm] = useState(false);
    const [mockFormData, setMockFormData] = useState({ evaluatorId: '', scheduledAt: '', score: '', feedback: '', role: 'Java', stage: 'Screening' });
    const [editingMockId, setEditingMockId] = useState<number | null>(null);
    const [documents, setDocuments] = useState<CandidateDocument[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({ documentType: 'RESUME' as DocumentType, notes: '', file: null as File | null });
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedStage, setSelectedStage] = useState<CandidateStage | null>(null);
    const [selectedSubStatus, setSelectedSubStatus] = useState<CandidateSubStatus | ''>('');
    const [subStatusReason, setSubStatusReason] = useState('');
    const [subStatusUpdating, setSubStatusUpdating] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submitFormData, setSubmitFormData] = useState({
        vendorId: '',
        clientId: '',
        vendorContact: '',
        positionTitle: '',
        screeningType: 'INTERVIEW' as 'OA' | 'INTERVIEW' | 'DIRECT',
        notes: ''
    });

    useEffect(() => {
        if (id) {
            Promise.all([
                candidatesApi.getById(id),
                candidatesApi.getTimeline(id),
                submissionsApi.getByCandidate(id),
                vendorsApi.getAll(),
                clientsApi.getAll(),
                mocksApi.getByCandidate(id),
                usersApi.getAll(),
                documentsApi.getByCandidate(id),
                batchesApi.getAll(),
            ])
                .then(([c, t, s, v, cl, m, u, d, b]) => {
                    setCandidate(c);
                    setTimeline(t);
                    setSubmissions(s);
                    setVendors(v);
                    setClients(cl);
                    setMocks(m);
                    setUsers(u);
                    setDocuments(d);
                    setBatches(b);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    useEffect(() => {
        if (candidate) {
            setSelectedStage(candidate.stage);
            setSelectedSubStatus(candidate.subStatus);
        }
    }, [candidate]);

    const handleSubmitToVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidate) return;
        try {
            await submissionsApi.create({
                candidate: { id: candidate.id } as Candidate,
                vendor: { id: Number(submitFormData.vendorId) } as Vendor,
                client: submitFormData.clientId ? { id: Number(submitFormData.clientId) } as Client : undefined,
                vendorContact: submitFormData.vendorContact || null,
                positionTitle: submitFormData.positionTitle,
                screeningType: submitFormData.screeningType,
                notes: submitFormData.notes,
            });
            const newSubmissions = await submissionsApi.getByCandidate(id);
            setSubmissions(newSubmissions);
            setShowSubmitForm(false);
            setSubmitFormData({ vendorId: '', clientId: '', vendorContact: '', positionTitle: '', screeningType: 'INTERVIEW', notes: '' });
        } catch (error) {
            console.error('Failed to create submission:', error);
        }
    };

    const promptValue = (message: string) => {
        const value = window.prompt(message);
        return value && value.trim() ? value.trim() : null;
    };

    const promptDate = (message: string) => {
        const value = promptValue(message);
        return value ? `${value}T00:00:00` : null;
    };

    const requireReason = (message: string) => {
        const value = promptValue(message);
        return value || null;
    };

    const requireCloseReason = () => {
        const value = promptValue(`Close reason (${closeReasonOptions.join(', ')}):`);
        if (!value) return null;
        const normalized = value.toUpperCase().replace(/\s+/g, '_');
        if (!closeReasonOptions.includes(normalized as CloseReason)) {
            alert('Invalid closeReason. Use one of the listed values.');
            return null;
        }
        return normalized as CloseReason;
    };

    const requireOfferType = () => {
        const value = promptValue(`Offer type (${offerTypeOptions.join(', ')}):`);
        if (!value) return null;
        const normalized = value.toUpperCase().replace(/\s+/g, '');
        if (!offerTypeOptions.includes(normalized as OfferType)) {
            alert('Invalid offerType. Use W2 or C2C.');
            return null;
        }
        return normalized as OfferType;
    };

    const handleTransition = async (toStage: CandidateStage) => {
        if (!candidate) return;
        setTransitionError(null);
        const payload: {
            toStage: CandidateStage;
            reason?: string;
            closeReason?: CloseReason;
            withdrawReason?: string;
            holdReason?: string;
            nextFollowUpAt?: string;
            reactivateReason?: string;
            offerType?: OfferType;
            startDate?: string;
        } = { toStage, reason: `Moved to ${toStage}` };

        if (toStage === 'ELIMINATED') {
            const closeReason = requireCloseReason();
            if (!closeReason) return;
            payload.closeReason = closeReason;
        }

        if (toStage === 'WITHDRAWN') {
            const withdrawReason = promptValue('Withdraw reason:');
            if (!withdrawReason) return;
            payload.withdrawReason = withdrawReason;
        }

        if (toStage === 'ON_HOLD') {
            const holdReason = promptValue('Hold reason:');
            const nextFollowUpAt = promptDate('Next follow-up date (YYYY-MM-DD):');
            if (!holdReason || !nextFollowUpAt) return;
            payload.holdReason = holdReason;
            payload.nextFollowUpAt = nextFollowUpAt;
        }

        if (toStage === 'PLACED') {
            const startDate = promptValue('Start date (YYYY-MM-DD):');
            if (!startDate) return;
            payload.startDate = startDate;
        }

        if (toStage === 'OFFERED') {
            const offerType = requireOfferType();
            if (!offerType) return;
            payload.offerType = offerType;
        }

        if ((candidate.stage === 'ELIMINATED' || candidate.stage === 'WITHDRAWN')
            && ['SOURCING', 'TRAINING', 'RESUME', 'MOCKING', 'MARKETING', 'OFFERED'].includes(toStage)) {
            const reactivateReason = promptValue('Reactivate reason:');
            if (!reactivateReason) return;
            payload.reactivateReason = reactivateReason;
        }

        if (candidate.stage === 'ON_HOLD'
            && candidate.lastActiveStage
            && toStage !== candidate.lastActiveStage) {
            const reason = requireReason('Reason for jumping stages:');
            if (!reason) return;
            payload.reason = reason;
        }

        if (candidate.stage === 'OFFERED' && toStage === 'MARKETING') {
            const reason = requireReason('Reason to return to marketing:');
            if (!reason) return;
            payload.reason = reason;
        }

        if (candidate.stage === 'PLACED' && toStage === 'MARKETING') {
            const reason = requireReason('Reason to return to marketing:');
            if (!reason) return;
            payload.reason = reason;
        }

        setTransitioning(true);
        try {
            const updated = await candidatesApi.transition(candidate.id, payload);
            setCandidate(updated);
            const newTimeline = await candidatesApi.getTimeline(id);
            setTimeline(newTimeline);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Transition failed';
            setTransitionError(message);
        } finally {
            setTransitioning(false);
        }
    };

    const handleSubStatusUpdate = async () => {
        if (!candidate || !selectedSubStatus || selectedStage !== candidate.stage) return;
        setTransitionError(null);
        setSubStatusUpdating(true);
        try {
            const updated = await candidatesApi.updateSubStatus(candidate.id, {
                subStatus: selectedSubStatus,
                reason: subStatusReason || undefined,
            });
            setCandidate(updated);
            const newTimeline = await candidatesApi.getTimeline(id);
            setTimeline(newTimeline);
            setSubStatusReason('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Sub-status update failed';
            setTransitionError(message);
        } finally {
            setSubStatusUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    if (!candidate) {
        return <div>Candidate not found</div>;
    }

    const nextStages = allowedTransitions[candidate.stage];
    const activeStage = selectedStage ?? candidate.stage;
    const activeSubStatusOptions = subStatusOptionsByStage[activeStage] || [];
    const isCurrentStageSelected = activeStage === candidate.stage;

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
                                <StageBadge stage={candidate.stage} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {candidate.batch && (
                                    <span className="flex items-center gap-1">
                                        📚 {candidate.batch.name}
                                    </span>
                                )}
                                {candidate.recruiter && (
                                    <span className="flex items-center gap-1">
                                        👤 Sourced by {candidate.recruiter.name}
                                    </span>
                                )}
                            </div>
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
                    onClick={() => setActiveTab('submissions')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'submissions'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Submissions {submissions.length > 0 && `(${submissions.length})`}
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
                <button
                    onClick={() => setActiveTab('mocks')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'mocks'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Mocks {mocks.length > 0 && `(${mocks.length})`}
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'documents'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Documents {documents.length > 0 && `(${documents.length})`}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'workspace' ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Market Entry Gate */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                ⚙️ Market Entry Gate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {transitionError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    <div className="flex items-center justify-between gap-3">
                                        <span>{transitionError}</span>
                                        <button
                                            type="button"
                                            onClick={() => setTransitionError(null)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="pt-3 border-t space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Stage / Sub-status
                                </label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        {stageOrder.map(stage => (
                                            <button
                                                key={stage}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStage(stage);
                                                    if (stage === candidate.stage) {
                                                        setSelectedSubStatus(candidate.subStatus);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 rounded-lg border text-sm transition",
                                                    stage === activeStage
                                                        ? "border-primary bg-primary/5 text-foreground"
                                                        : "border-border text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {stage.replace(/_/g, ' ')}
                                                {stage === candidate.stage && (
                                                    <span className="ml-2 text-[11px] text-primary">Current</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {activeSubStatusOptions.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                                                Sub-status in Marketing is driven by submissions.
                                            </div>
                                        ) : (
                                            activeSubStatusOptions.map(option => {
                                                const isSelected = isCurrentStageSelected && option === selectedSubStatus;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isCurrentStageSelected) {
                                                                setSelectedSubStatus(option);
                                                            }
                                                        }}
                                                        disabled={!isCurrentStageSelected}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 rounded-lg border text-sm transition",
                                                            isSelected
                                                                ? "border-primary bg-primary/5 text-foreground"
                                                                : "border-border text-muted-foreground",
                                                            !isCurrentStageSelected && "cursor-not-allowed opacity-60"
                                                        )}
                                                    >
                                                        {option.replace(/_/g, ' ')}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                {activeSubStatusOptions.length > 0 ? (
                                    isCurrentStageSelected ? (
                                        <>
                                            <input
                                                value={subStatusReason}
                                                onChange={e => setSubStatusReason(e.target.value)}
                                                placeholder="Reason (optional)"
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={handleSubStatusUpdate}
                                                disabled={subStatusUpdating || selectedSubStatus === candidate.subStatus}
                                            >
                                                Update Sub-status
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Select the current stage to update sub-status.
                                        </p>
                                    )
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        No editable sub-status for this stage.
                                    </p>
                                )}
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


                    {/* Career Timeline */}
                    <Card className="md:col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                🕐 Career Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {timeline.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No events yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {timeline.slice(0, 8).map((t, i) => (
                                        <div key={t.id} className="flex gap-3 relative">
                                            {i < timeline.length - 1 && (
                                                <div className="absolute left-[11px] top-8 w-0.5 h-full bg-border" />
                                            )}
                                            <div className={cn(
                                                "w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white",
                                                t.eventType === 'STAGE_CHANGED' || t.eventType === 'STAGE_CHANGE' ? 'bg-primary' :
                                                    t.eventType === 'SUBSTATUS_CHANGED' ? 'bg-sky-500' :
                                                    t.eventType === 'CANDIDATE_CREATED' ? 'bg-slate-500' :
                                                        t.eventType === 'ON_HOLD' ? 'bg-gray-500' :
                                                            t.eventType === 'ELIMINATED' || t.eventType === 'WITHDRAWN' || t.eventType === 'CLOSED' ? 'bg-red-500' :
                                                            t.eventType === 'PLACED' ? 'bg-indigo-500' :
                                                                t.eventType === 'OFFERED' ? 'bg-lime-500' :
                                                                    t.eventType === 'CONTRACT' ? 'bg-emerald-500' :
                                                                        t.eventType === 'MOCK' ? 'bg-violet-500' :
                                                                            t.eventType === 'BATCH' ? 'bg-purple-500' :
                                                                                t.eventType === 'COMMUNICATION' ? 'bg-blue-500' : 'bg-slate-400'
                                            )}>
                                                {(t.eventType === 'STAGE_CHANGED' || t.eventType === 'STAGE_CHANGE') && <ArrowRight className="w-3 h-3" />}
                                                {t.eventType === 'SUBSTATUS_CHANGED' && <Pencil className="w-3 h-3" />}
                                                {t.eventType === 'CANDIDATE_CREATED' && <Plus className="w-3 h-3" />}
                                                {t.eventType === 'ON_HOLD' && <Clock className="w-3 h-3" />}
                                                {(t.eventType === 'ELIMINATED' || t.eventType === 'WITHDRAWN' || t.eventType === 'CLOSED') && <X className="w-3 h-3" />}
                                                {t.eventType === 'OFFERED' && <FileText className="w-3 h-3" />}
                                                {t.eventType === 'PLACED' && <Check className="w-3 h-3" />}
                                                {t.eventType === 'CONTRACT' && <FileText className="w-3 h-3" />}
                                                {t.eventType === 'MOCK' && <Star className="w-3 h-3" />}
                                                {t.eventType === 'BATCH' && <BookOpen className="w-3 h-3" />}
                                                {t.eventType === 'COMMUNICATION' && <Users className="w-3 h-3" />}
                                            </div>
                                            <div className="pb-4">
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(t.eventDate).toLocaleDateString()}
                                                </p>
                                                <p className="font-medium text-sm">{t.title}</p>
                                                {t.description && (
                                                    <p className="text-xs text-muted-foreground">{t.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : activeTab === 'submissions' ? (
                /* Submissions Tab */
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Vendor Submissions</h2>
                        <Button onClick={() => setShowSubmitForm(!showSubmitForm)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Submission
                        </Button>
                    </div>

                    {showSubmitForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Submit to Vendor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmitToVendor} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Vendor *</label>
                                            <select
                                                required
                                                value={submitFormData.vendorId}
                                                onChange={e => setSubmitFormData({ ...submitFormData, vendorId: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select vendor...</option>
                                                {vendors.map(v => (
                                                    <option key={v.id} value={v.id}>{v.companyName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Client</label>
                                            <select
                                                value={submitFormData.clientId}
                                                onChange={e => setSubmitFormData({ ...submitFormData, clientId: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select client...</option>
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id}>{c.companyName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Contact</label>
                                            <select
                                                value={submitFormData.vendorContact}
                                                onChange={e => setSubmitFormData({ ...submitFormData, vendorContact: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select contact...</option>
                                                {submitFormData.vendorId && vendors.find(v => v.id === Number(submitFormData.vendorId))?.contacts?.map((c, idx) => (
                                                    <option key={idx} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Position *</label>
                                            <input
                                                type="text"
                                                required
                                                value={submitFormData.positionTitle}
                                                onChange={e => setSubmitFormData({ ...submitFormData, positionTitle: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Java Developer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Screening Type</label>
                                            <select
                                                value={submitFormData.screeningType}
                                                onChange={e => setSubmitFormData({ ...submitFormData, screeningType: e.target.value as 'OA' | 'INTERVIEW' | 'DIRECT' })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="INTERVIEW">Interview</option>
                                                <option value="OA">Online Assessment</option>
                                                <option value="DIRECT">Direct</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Notes</label>
                                        <textarea
                                            value={submitFormData.notes}
                                            onChange={e => setSubmitFormData({ ...submitFormData, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            rows={2}
                                            placeholder="Any notes about this submission..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit">
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {submissions.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground">
                                No submissions yet. Submit this candidate to a vendor!
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Vendor</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Client</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Position</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Round</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map(sub => (
                                            <tr key={sub.id} className="border-b border-border hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                                        <Link href={`/vendors/${sub.vendor.id}`} className="font-medium hover:text-primary">
                                                            {sub.vendor.companyName}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{sub.client?.companyName || '-'}</td>
                                                <td className="py-3 px-4 text-sm">{sub.positionTitle}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[sub.status] || 'bg-muted'}`}>
                                                        {statusLabels[sub.status] || sub.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{sub.currentRound}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {new Date(sub.submittedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : activeTab === 'profile' ? (
                /* Profile Tab */
                <div className="space-y-6">
                    {/* Edit Button */}
                    <div className="flex justify-end">
                        <Button
                            variant={showEditProfile ? "outline" : "default"}
                            onClick={() => setShowEditProfile(!showEditProfile)}
                        >
                            {showEditProfile ? (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </>
                            )}
                        </Button>
                    </div>

                    {showEditProfile ? (
                        /* Edit Form */
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    try {
                                        const batchId = formData.get('batchId');
                                        const updated = await candidatesApi.update(candidate.id, {
                                            ...candidate,
                                            name: formData.get('name') as string,
                                            email: formData.get('email') as string || undefined,
                                            phone: formData.get('phone') as string || undefined,
                                            wechatId: formData.get('wechatId') as string || undefined,
                                            wechatName: formData.get('wechatName') as string || undefined,
                                            discordName: formData.get('discordName') as string || undefined,
                                            city: formData.get('city') as string || undefined,
                                            state: formData.get('state') as string || undefined,
                                            workAuth: (formData.get('workAuth') as WorkAuth) || undefined,
                                            school: formData.get('school') as string || undefined,
                                            major: formData.get('major') as string || undefined,
                                            relocation: formData.get('relocation') === 'on',
                                            notes: formData.get('notes') as string || undefined,
                                            linkedinUrl: formData.get('linkedinUrl') as string || undefined,
                                            marketingLinkedinUrl: formData.get('marketingLinkedinUrl') as string || undefined,
                                            batch: batchId ? { id: Number(batchId) } as Batch : null,
                                        });
                                        setCandidate(updated);
                                        setShowEditProfile(false);
                                    } catch (error) {
                                        console.error('Failed to update:', error);
                                    }
                                }} className="space-y-4">
                                    {/* Row 1 */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Name *</label>
                                            <input name="name" defaultValue={candidate.name} required className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Email</label>
                                            <input name="email" type="email" defaultValue={candidate.email || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Phone</label>
                                            <input name="phone" defaultValue={candidate.phone || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Work Auth</label>
                                            <select name="workAuth" defaultValue={candidate.workAuth || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                                                <option value="">Select...</option>
                                                <option value="CITIZEN">US Citizen</option>
                                                <option value="GC">Green Card</option>
                                                <option value="OPT">OPT</option>
                                                <option value="H1B">H1B</option>
                                                <option value="CPT">CPT</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Row 2 */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">WeChat ID</label>
                                            <input name="wechatId" defaultValue={candidate.wechatId || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">WeChat Name</label>
                                            <input name="wechatName" defaultValue={candidate.wechatName || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Discord</label>
                                            <input name="discordName" defaultValue={candidate.discordName || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">City</label>
                                            <input name="city" defaultValue={candidate.city || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                    </div>
                                    {/* Row 3 */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">State</label>
                                            <input name="state" defaultValue={candidate.state || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">School</label>
                                            <input name="school" defaultValue={candidate.school || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Major</label>
                                            <input name="major" defaultValue={candidate.major || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Batch</label>
                                            <select name="batchId" defaultValue={candidate.batch?.id || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                                                <option value="">None</option>
                                                {batches.map(batch => (
                                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Row 4 - Relocation */}
                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input name="relocation" type="checkbox" defaultChecked={candidate.relocation || false} className="w-4 h-4 rounded" />
                                            <span className="text-sm font-medium">Open to Relocation</span>
                                        </label>
                                    </div>
                                    {/* Row 4 - LinkedIn */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">LinkedIn</label>
                                            <input name="linkedinUrl" type="url" defaultValue={candidate.linkedinUrl || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="linkedin.com/in/..." />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Marketing LinkedIn</label>
                                            <input name="marketingLinkedinUrl" type="url" defaultValue={candidate.marketingLinkedinUrl || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="linkedin.com/in/..." />
                                        </div>
                                    </div>
                                    {/* Notes */}
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Notes</label>
                                        <textarea name="notes" defaultValue={candidate.notes || ''} className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[100px]" placeholder="e.g. 实力很强，可以 relocation 但 prefer 湾区" />
                                    </div>
                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button type="submit">Save Changes</Button>
                                        <Button type="button" variant="outline" onClick={() => setShowEditProfile(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Read-only View */
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
                                    {(candidate.wechatId || candidate.wechatName) && (
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
                                            <p className="font-medium">
                                                {candidate.school || candidate.major
                                                    ? `${candidate.major || ''} ${candidate.school ? '@ ' + candidate.school : ''}`.trim()
                                                    : '-'}
                                            </p>
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
            ) : activeTab === 'mocks' ? (
                <div className="space-y-6">
                    {/* Assign Mock Form */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Mock Interviews
                            </CardTitle>
                            <Button onClick={() => { setShowMockForm(!showMockForm); setEditingMockId(null); setMockFormData({ evaluatorId: '', scheduledAt: '', score: '', feedback: '', role: 'Java', stage: 'Screening' }); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Assign Mock
                            </Button>
                        </CardHeader>
                        {showMockForm && (
                            <CardContent>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!candidate) return;
                                    try {
                                        if (!mockFormData.evaluatorId) {
                                            alert('Please select an evaluator');
                                            return;
                                        }
                                        const scheduledAtValue = mockFormData.scheduledAt && mockFormData.scheduledAt.trim()
                                            ? new Date(mockFormData.scheduledAt).toISOString()
                                            : null;
                                        const payload = {
                                            candidate: { id: candidate.id },
                                            evaluator: { id: Number(mockFormData.evaluatorId) },
                                            scheduledAt: scheduledAtValue,
                                            role: mockFormData.role,
                                            stage: mockFormData.stage,
                                            score: mockFormData.score ? Number(mockFormData.score) : null,
                                            feedback: mockFormData.feedback || null,
                                        };
                                        if (editingMockId) {
                                            await mocksApi.update(editingMockId, payload as Partial<Mock>);
                                        } else {
                                            await mocksApi.create(payload as Partial<Mock>);
                                        }
                                        setShowMockForm(false);
                                        setMockFormData({ evaluatorId: '', scheduledAt: '', score: '', feedback: '', role: 'Java', stage: 'Screening' });
                                        setEditingMockId(null);
                                        const updatedMocks = await mocksApi.getByCandidate(id);
                                        setMocks(updatedMocks);
                                    } catch (err) {
                                        console.error('Failed to save mock:', err);
                                    }
                                }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Evaluator *</label>
                                            <select
                                                required
                                                value={mockFormData.evaluatorId}
                                                onChange={e => setMockFormData({ ...mockFormData, evaluatorId: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select evaluator...</option>
                                                {users.filter(u => u.role === 'TRAINER' || u.role === 'SUPPORTER').map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Scheduled At</label>
                                            <input
                                                type="datetime-local"
                                                value={mockFormData.scheduledAt}
                                                onChange={e => setMockFormData({ ...mockFormData, scheduledAt: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Role (Tech Stack) *</label>
                                            <div className="flex p-1 bg-muted rounded-lg">
                                                {['Java', 'React'].map(role => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => setMockFormData({ ...mockFormData, role })}
                                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mockFormData.role === role
                                                            ? 'bg-background text-primary shadow-sm'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Interview Stage *</label>
                                            <select
                                                required
                                                value={mockFormData.stage}
                                                onChange={e => setMockFormData({ ...mockFormData, stage: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="Screening">Screening (初筛)</option>
                                                <option value="TechMock">Tech Theory (八股)</option>
                                                <option value="RealMock">Interview Sim (实战)</option>
                                            </select>
                                        </div>
                                    </div>
                                    {editingMockId && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Score (0-100)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={mockFormData.score}
                                                    onChange={e => setMockFormData({ ...mockFormData, score: e.target.value })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="75"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {editingMockId && (
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Feedback</label>
                                            <textarea
                                                value={mockFormData.feedback}
                                                onChange={e => setMockFormData({ ...mockFormData, feedback: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                rows={3}
                                                placeholder="Feedback for the candidate..."
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button type="submit">{editingMockId ? 'Update' : 'Assign'}</Button>
                                        <Button type="button" variant="outline" onClick={() => { setShowMockForm(false); setEditingMockId(null); }}>Cancel</Button>
                                    </div>
                                </form>
                            </CardContent>
                        )}
                    </Card>

                    {/* Mocks List */}
                    {mocks.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground">
                                No mock interviews yet. Assign one above!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {mocks.map(mock => (
                                <Card key={mock.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-white font-medium">
                                                    {mock.evaluator?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{mock.evaluator?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground">{mock.evaluator?.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {mock.score !== null && (
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-full text-sm font-semibold",
                                                        mock.score >= 80 ? "bg-emerald-500/10 text-emerald-600" :
                                                            mock.score >= 60 ? "bg-yellow-500/10 text-yellow-600" :
                                                                "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {mock.score}/100
                                                    </div>
                                                )}
                                                {mock.decision && (
                                                    <div className={cn(
                                                        "px-2 py-1 rounded text-xs font-bold border",
                                                        mock.decision === 'Strong Hire' ? "bg-green-50 text-green-700 border-green-200" :
                                                            mock.decision === 'Hire' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                                mock.decision === 'Weak Hire' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                                    mock.decision === 'No Hire' ? "bg-red-50 text-red-700 border-red-200" :
                                                                        "bg-muted text-muted-foreground border-border"
                                                    )}>
                                                        {mock.decision}
                                                    </div>
                                                )}
                                                <Link href={`/mock-feedback/${mock.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        {mock.completed ? 'View/Edit' : 'Add Feedback'}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            {mock.stage && (
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2",
                                                    mock.stage === 'Screening' ? "bg-gray-100 text-gray-700" :
                                                        mock.stage === 'TechMock' ? "bg-purple-100 text-purple-700" :
                                                            "bg-blue-100 text-blue-700"
                                                )}>
                                                    {mock.stage === 'Screening' ? 'Screening (初筛)' :
                                                        mock.stage === 'TechMock' ? 'Tech Theory (八股)' :
                                                            'Interview Sim (实战)'}
                                                </span>
                                            )}
                                            {mock.role && (
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold",
                                                    mock.role === 'Java' ? "bg-orange-50 text-orange-700 border border-orange-100" :
                                                        "bg-cyan-50 text-cyan-700 border border-cyan-100"
                                                )}>
                                                    {mock.role}
                                                </span>
                                            )}
                                            {mock.scheduledAt && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    Scheduled: {new Date(mock.scheduledAt).toLocaleString()}
                                                </p>
                                            )}
                                            {mock.summary && (
                                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        Summary
                                                    </p>
                                                    <p className="text-sm">{mock.summary}</p>
                                                </div>
                                            )}
                                            {mock.actionItems && (
                                                <div className="mt-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                                                    <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mb-1">
                                                        Action Items
                                                    </p>
                                                    <p className="text-sm text-slate-700">{mock.actionItems}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'documents' ? (
                <div className="space-y-4">
                    {/* Upload Modal */}
                    {showUploadModal && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm">Upload Document</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!uploadForm.file) return;
                                    try {
                                        const newDoc = await documentsApi.upload(id, uploadForm.file, uploadForm.documentType, uploadForm.notes);
                                        setDocuments([newDoc, ...documents]);
                                        setShowUploadModal(false);
                                        setUploadForm({ documentType: 'RESUME', notes: '', file: null });
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Document Type</label>
                                        <select
                                            value={uploadForm.documentType}
                                            onChange={e => setUploadForm({ ...uploadForm, documentType: e.target.value as DocumentType })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        >
                                            <option value="RESUME">Resume</option>
                                            <option value="CONTRACT">Contract</option>
                                            <option value="DL">Driver License</option>
                                            <option value="OPT_EAD">OPT/EAD</option>
                                            <option value="GC">Green Card</option>
                                            <option value="PASSPORT">Passport</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">File</label>
                                        <input
                                            type="file"
                                            onChange={e => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
                                        <input
                                            type="text"
                                            value={uploadForm.notes}
                                            onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                            placeholder="e.g. Latest version for submission"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={!uploadForm.file}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Documents List */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm">📄 Documents</CardTitle>
                            <Button size="sm" onClick={() => setShowUploadModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {documents.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-8">No documents uploaded yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {documents.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <File className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">{doc.originalFileName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {doc.documentType.replace('_', ' ')} • {(doc.fileSize / 1024).toFixed(1)}KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={documentsApi.download(id, doc.id)} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                                                </a>
                                                <Button variant="ghost" size="sm" onClick={async () => {
                                                    await documentsApi.delete(id, doc.id);
                                                    setDocuments(documents.filter(d => d.id !== doc.id));
                                                }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
