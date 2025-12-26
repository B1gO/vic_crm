'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Check, Clock, ChevronRight, X, FileText,
    Building2, User, Calendar, MessageSquare,
    CheckCircle2, XCircle, Play, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Submission, SubmissionStatus, SubmissionEvent, submissionsApi } from '@/lib/api';
import Link from 'next/link';

// Status display configuration
const STATUS_CONFIG: Record<SubmissionStatus, {
    label: string;
    color: string;
    bgColor: string;
    stage: 'submitted' | 'oa' | 'vendorScreening' | 'interview' | 'offer' | 'final';
}> = {
    SUBMITTED: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100', stage: 'submitted' },
    OA_SCHEDULED: { label: 'OA Scheduled', color: 'text-amber-600', bgColor: 'bg-amber-100', stage: 'oa' },
    OA_PASSED: { label: 'OA Passed', color: 'text-green-600', bgColor: 'bg-green-100', stage: 'oa' },
    OA_FAILED: { label: 'OA Failed', color: 'text-red-600', bgColor: 'bg-red-100', stage: 'oa' },
    VENDOR_SCREENING_SCHEDULED: { label: 'VS Scheduled', color: 'text-amber-600', bgColor: 'bg-amber-100', stage: 'vendorScreening' },
    VENDOR_SCREENING_PASSED: { label: 'VS Passed', color: 'text-green-600', bgColor: 'bg-green-100', stage: 'vendorScreening' },
    VENDOR_SCREENING_FAILED: { label: 'VS Failed', color: 'text-red-600', bgColor: 'bg-red-100', stage: 'vendorScreening' },
    CLIENT_INTERVIEW: { label: 'Client Interview', color: 'text-purple-600', bgColor: 'bg-purple-100', stage: 'interview' },
    OFFERED: { label: 'Offered', color: 'text-emerald-600', bgColor: 'bg-emerald-100', stage: 'offer' },
    OFFER_ACCEPTED: { label: 'Offer Accepted', color: 'text-green-600', bgColor: 'bg-green-100', stage: 'offer' },
    OFFER_DECLINED: { label: 'Offer Declined', color: 'text-orange-600', bgColor: 'bg-orange-100', stage: 'offer' },
    PLACED: { label: 'Placed', color: 'text-emerald-700', bgColor: 'bg-emerald-100', stage: 'final' },
    REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100', stage: 'final' },
    WITHDRAWN: { label: 'Withdrawn', color: 'text-gray-600', bgColor: 'bg-gray-100', stage: 'final' },
};

// Pipeline stages
const PIPELINE_STAGES = [
    { key: 'submitted', label: 'Submitted', icon: FileText },
    { key: 'oa', label: 'OA', icon: FileText, optional: true },
    { key: 'vendorScreening', label: 'Vendor Screen', icon: Building2, optional: true },
    { key: 'interview', label: 'Client Interview', icon: User },
    { key: 'offer', label: 'Offer', icon: CheckCircle2 },
];

interface SubmissionPipelineCardProps {
    submission: Submission;
    onUpdate?: (submission: Submission) => void;
    expanded?: boolean;
}

export function SubmissionPipelineCard({ submission, onUpdate, expanded: initialExpanded = false }: SubmissionPipelineCardProps) {
    const [expanded, setExpanded] = useState(initialExpanded);
    const [events, setEvents] = useState<SubmissionEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [actionModal, setActionModal] = useState<{ type: string; show: boolean }>({ type: '', show: false });
    const [actionLoading, setActionLoading] = useState(false);

    const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.SUBMITTED;
    const currentStageKey = statusConfig.stage;

    // Determine which stages are completed, current, or future
    const getStageStatus = (stageKey: string) => {
        const stageOrder = ['submitted', 'oa', 'vendorScreening', 'interview', 'offer', 'final'];
        const currentIndex = stageOrder.indexOf(currentStageKey);
        const stageIndex = stageOrder.indexOf(stageKey);

        // Skip optional stages if not used
        if (stageKey === 'oa' && !submission.hasOa) return 'skipped';
        if (stageKey === 'vendorScreening' && !submission.hasVendorScreening) return 'skipped';

        // Check for failures
        if (submission.status.includes('FAILED')) {
            if (stageIndex === currentIndex) return 'failed';
            if (stageIndex < currentIndex) return 'completed';
            return 'pending';
        }

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'current';
        return 'pending';
    };

    const loadEvents = async () => {
        if (events.length > 0) return;
        setLoadingEvents(true);
        try {
            const data = await submissionsApi.getEvents(submission.id);
            setEvents(data);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleExpand = () => {
        if (!expanded) loadEvents();
        setExpanded(!expanded);
    };

    // Action handlers
    const handleScheduleOa = async (scheduledAt: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.scheduleOa(submission.id, { scheduledAt });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to schedule OA:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleOaResult = async (passed: boolean, score?: string, feedback?: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.recordOaResult(submission.id, { passed, score, feedback });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to record OA result:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleScheduleVendorScreening = async (scheduledAt: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.scheduleVendorScreening(submission.id, { scheduledAt });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to schedule vendor screening:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVendorScreeningResult = async (passed: boolean, feedback?: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.recordVendorScreeningResult(submission.id, { passed, feedback });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to record vendor screening result:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleScheduleInterview = async (round: number, scheduledAt: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.scheduleInterview(submission.id, { round, scheduledAt });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to schedule interview:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleInterviewResult = async (round: number, passed: boolean, feedback?: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.recordInterviewResult(submission.id, { round, passed, feedback });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to record interview result:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleOfferResponse = async (accepted: boolean, notes?: string) => {
        setActionLoading(true);
        try {
            const updated = await submissionsApi.respondToOffer(submission.id, { accepted, notes });
            onUpdate?.(updated);
            setActionModal({ type: '', show: false });
        } catch (err) {
            console.error('Failed to respond to offer:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const isFailed = submission.status.includes('FAILED') || submission.status === 'REJECTED';
    const isCompleted = submission.status === 'PLACED' || submission.status === 'OFFER_ACCEPTED';
    const isClosed = isFailed || isCompleted || submission.status === 'WITHDRAWN' || submission.status === 'OFFER_DECLINED';

    return (
        <Card className={cn(
            "transition-all",
            isFailed && "border-red-200 bg-red-50/30",
            isCompleted && "border-green-200 bg-green-50/30"
        )}>
            {/* Header */}
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", statusConfig.bgColor)}>
                            <Building2 className={cn("w-5 h-5", statusConfig.color)} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">
                                {submission.positionTitle}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                <Link href={`/vendors/${submission.vendor.id}`} className="hover:text-primary">
                                    {submission.vendor.companyName}
                                </Link>
                                {submission.client && (
                                    <> → {submission.client.companyName}</>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusConfig.bgColor, statusConfig.color)}>
                            {statusConfig.label}
                            {submission.status === 'CLIENT_INTERVIEW' && submission.currentRound > 0 && ` R${submission.currentRound}`}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleExpand}>
                            <ChevronRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Pipeline Progress */}
            <CardContent className="pt-2">
                <div className="flex items-center gap-1">
                    {PIPELINE_STAGES.map((stage, idx) => {
                        const status = getStageStatus(stage.key);
                        if (status === 'skipped') return null;

                        const Icon = stage.icon;
                        return (
                            <div key={stage.key} className="flex items-center flex-1">
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                                    status === 'completed' && "bg-green-500 text-white",
                                    status === 'current' && "bg-primary text-white ring-2 ring-primary/30",
                                    status === 'failed' && "bg-red-500 text-white",
                                    status === 'pending' && "bg-gray-200 text-gray-400"
                                )}>
                                    {status === 'completed' ? (
                                        <Check className="w-4 h-4" />
                                    ) : status === 'failed' ? (
                                        <X className="w-4 h-4" />
                                    ) : status === 'current' ? (
                                        <Clock className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>
                                {idx < PIPELINE_STAGES.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-1 mx-1",
                                        status === 'completed' ? "bg-green-500" : "bg-gray-200"
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex mt-1">
                    {PIPELINE_STAGES.map((stage) => {
                        const status = getStageStatus(stage.key);
                        if (status === 'skipped') return null;
                        return (
                            <div key={stage.key} className="flex-1 text-center">
                                <span className={cn(
                                    "text-[10px]",
                                    status === 'current' ? "font-medium text-primary" : "text-muted-foreground"
                                )}>
                                    {stage.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Expanded Content */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Quick Actions */}
                        {!isClosed && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">Next Actions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {submission.status === 'SUBMITTED' && submission.hasOa && (
                                        <ActionButton onClick={() => setActionModal({ type: 'scheduleOa', show: true })}>
                                            <Calendar className="w-3 h-3 mr-1" /> Schedule OA
                                        </ActionButton>
                                    )}
                                    {submission.status === 'SUBMITTED' && !submission.hasOa && submission.hasVendorScreening && (
                                        <ActionButton onClick={() => setActionModal({ type: 'scheduleVS', show: true })}>
                                            <Calendar className="w-3 h-3 mr-1" /> Schedule Vendor Screening
                                        </ActionButton>
                                    )}
                                    {submission.status === 'SUBMITTED' && !submission.hasOa && !submission.hasVendorScreening && (
                                        <ActionButton onClick={() => setActionModal({ type: 'scheduleInterview', show: true })}>
                                            <Calendar className="w-3 h-3 mr-1" /> Schedule Interview R1
                                        </ActionButton>
                                    )}
                                    {submission.status === 'OA_SCHEDULED' && (
                                        <>
                                            <ActionButton variant="success" onClick={() => setActionModal({ type: 'oaPass', show: true })}>
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> OA Passed
                                            </ActionButton>
                                            <ActionButton variant="danger" onClick={() => setActionModal({ type: 'oaFail', show: true })}>
                                                <XCircle className="w-3 h-3 mr-1" /> OA Failed
                                            </ActionButton>
                                        </>
                                    )}
                                    {submission.status === 'OA_PASSED' && submission.hasVendorScreening && (
                                        <ActionButton onClick={() => setActionModal({ type: 'scheduleVS', show: true })}>
                                            <Calendar className="w-3 h-3 mr-1" /> Schedule Vendor Screening
                                        </ActionButton>
                                    )}
                                    {submission.status === 'OA_PASSED' && !submission.hasVendorScreening && (
                                        <ActionButton onClick={() => setActionModal({ type: 'scheduleInterview', show: true })}>
                                            <Calendar className="w-3 h-3 mr-1" /> Schedule Interview R1
                                        </ActionButton>
                                    )}
                                    {submission.status === 'VENDOR_SCREENING_SCHEDULED' && (
                                        <>
                                            <ActionButton variant="success" onClick={() => setActionModal({ type: 'vsPass', show: true })}>
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> VS Passed
                                            </ActionButton>
                                            <ActionButton variant="danger" onClick={() => setActionModal({ type: 'vsFail', show: true })}>
                                                <XCircle className="w-3 h-3 mr-1" /> VS Failed
                                            </ActionButton>
                                        </>
                                    )}
                                    {submission.status === 'VENDOR_SCREENING_PASSED' && (
                                        <ActionButton onClick={() => setActionModal({ type: 'scheduleInterview', show: true })}>
                                            <Calendar className="w-3 h-3 mr-1" /> Schedule Interview R1
                                        </ActionButton>
                                    )}
                                    {submission.status === 'CLIENT_INTERVIEW' && (
                                        <>
                                            <ActionButton variant="success" onClick={() => setActionModal({ type: 'interviewPass', show: true })}>
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> R{submission.currentRound} Passed
                                            </ActionButton>
                                            <ActionButton variant="danger" onClick={() => setActionModal({ type: 'interviewFail', show: true })}>
                                                <XCircle className="w-3 h-3 mr-1" /> R{submission.currentRound} Failed
                                            </ActionButton>
                                        </>
                                    )}
                                    {submission.status === 'OFFERED' && (
                                        <>
                                            <ActionButton variant="success" onClick={() => setActionModal({ type: 'offerAccept', show: true })}>
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Accept Offer
                                            </ActionButton>
                                            <ActionButton variant="danger" onClick={() => setActionModal({ type: 'offerDecline', show: true })}>
                                                <XCircle className="w-3 h-3 mr-1" /> Decline Offer
                                            </ActionButton>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {submission.oaScore && (
                                <div>
                                    <span className="text-muted-foreground">OA Score:</span>
                                    <span className="ml-2 font-medium">{submission.oaScore}</span>
                                </div>
                            )}
                            {submission.currentRound > 0 && (
                                <div>
                                    <span className="text-muted-foreground">Interview Round:</span>
                                    <span className="ml-2 font-medium">{submission.currentRound}{submission.totalRounds ? `/${submission.totalRounds}` : ''}</span>
                                </div>
                            )}
                            {submission.lastFeedback && (
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Last Feedback:</span>
                                    <p className="mt-1 text-sm bg-muted/50 p-2 rounded">{submission.lastFeedback}</p>
                                </div>
                            )}
                            {submission.failReason && (
                                <div className="col-span-2">
                                    <span className="text-red-600">Fail Reason:</span>
                                    <p className="mt-1 text-sm bg-red-50 p-2 rounded text-red-700">{submission.failReason}</p>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        {loadingEvents ? (
                            <div className="text-center text-sm text-muted-foreground py-2">
                                <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                Loading timeline...
                            </div>
                        ) : events.length > 0 && (
                            <div className="border-t pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Timeline</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {events.map((event) => (
                                        <div key={event.id} className="flex items-start gap-2 text-sm">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                event.result === 'Pass' ? "bg-green-500" :
                                                    event.result === 'Fail' ? "bg-red-500" : "bg-blue-500"
                                            )} />
                                            <div className="flex-1">
                                                <p className="font-medium">{event.title}</p>
                                                {event.notes && <p className="text-xs text-muted-foreground">{event.notes}</p>}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(event.eventDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Modals */}
                {actionModal.show && (
                    <ActionModal
                        type={actionModal.type}
                        submission={submission}
                        loading={actionLoading}
                        onClose={() => setActionModal({ type: '', show: false })}
                        onScheduleOa={handleScheduleOa}
                        onOaResult={handleOaResult}
                        onScheduleVS={handleScheduleVendorScreening}
                        onVSResult={handleVendorScreeningResult}
                        onScheduleInterview={handleScheduleInterview}
                        onInterviewResult={handleInterviewResult}
                        onOfferResponse={handleOfferResponse}
                    />
                )}
            </CardContent>
        </Card>
    );
}

// Action Button component
function ActionButton({ children, onClick, variant = 'default' }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'success' | 'danger'
}) {
    return (
        <Button
            size="sm"
            variant="outline"
            onClick={onClick}
            className={cn(
                "text-xs h-7",
                variant === 'success' && "text-green-600 border-green-200 hover:bg-green-50",
                variant === 'danger' && "text-red-600 border-red-200 hover:bg-red-50"
            )}
        >
            {children}
        </Button>
    );
}

// Action Modal component
function ActionModal({
    type,
    submission,
    loading,
    onClose,
    onScheduleOa,
    onOaResult,
    onScheduleVS,
    onVSResult,
    onScheduleInterview,
    onInterviewResult,
    onOfferResponse,
}: {
    type: string;
    submission: Submission;
    loading: boolean;
    onClose: () => void;
    onScheduleOa: (scheduledAt: string) => void;
    onOaResult: (passed: boolean, score?: string, feedback?: string) => void;
    onScheduleVS: (scheduledAt: string) => void;
    onVSResult: (passed: boolean, feedback?: string) => void;
    onScheduleInterview: (round: number, scheduledAt: string) => void;
    onInterviewResult: (round: number, passed: boolean, feedback?: string) => void;
    onOfferResponse: (accepted: boolean, notes?: string) => void;
}) {
    const [scheduledAt, setScheduledAt] = useState('');
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');

    const getTitle = () => {
        switch (type) {
            case 'scheduleOa': return 'Schedule OA';
            case 'oaPass': return 'Record OA Passed';
            case 'oaFail': return 'Record OA Failed';
            case 'scheduleVS': return 'Schedule Vendor Screening';
            case 'vsPass': return 'Record VS Passed';
            case 'vsFail': return 'Record VS Failed';
            case 'scheduleInterview': return `Schedule Interview Round ${submission.currentRound + 1}`;
            case 'interviewPass': return `Record Round ${submission.currentRound} Passed`;
            case 'interviewFail': return `Record Round ${submission.currentRound} Failed`;
            case 'offerAccept': return 'Accept Offer';
            case 'offerDecline': return 'Decline Offer';
            default: return 'Action';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        switch (type) {
            case 'scheduleOa':
                onScheduleOa(scheduledAt);
                break;
            case 'oaPass':
                onOaResult(true, score, feedback);
                break;
            case 'oaFail':
                onOaResult(false, score, feedback);
                break;
            case 'scheduleVS':
                onScheduleVS(scheduledAt);
                break;
            case 'vsPass':
                onVSResult(true, feedback);
                break;
            case 'vsFail':
                onVSResult(false, feedback);
                break;
            case 'scheduleInterview':
                onScheduleInterview(submission.currentRound + 1, scheduledAt);
                break;
            case 'interviewPass':
                onInterviewResult(submission.currentRound, true, feedback);
                break;
            case 'interviewFail':
                onInterviewResult(submission.currentRound, false, feedback);
                break;
            case 'offerAccept':
                onOfferResponse(true, feedback);
                break;
            case 'offerDecline':
                onOfferResponse(false, feedback);
                break;
        }
    };

    const showScheduleInput = ['scheduleOa', 'scheduleVS', 'scheduleInterview'].includes(type);
    const showScoreInput = ['oaPass', 'oaFail'].includes(type);
    const showFeedbackInput = !showScheduleInput;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {showScheduleInput && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">Scheduled Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={scheduledAt}
                                onChange={e => setScheduledAt(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    )}
                    {showScoreInput && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">Score (optional)</label>
                            <input
                                type="text"
                                value={score}
                                onChange={e => setScore(e.target.value)}
                                placeholder="e.g., 92/100"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    )}
                    {showFeedbackInput && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">Feedback/Notes</label>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Enter feedback or notes..."
                            />
                        </div>
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
