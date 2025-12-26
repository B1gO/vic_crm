'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowRight, Check, Clock, ChevronRight,
    AlertCircle, Zap, XCircle, Pause, RefreshCw,
    Calendar, BookOpen, FileText, Star, Users, Plus, X, Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Candidate, CandidateStage, CandidateSubStatus, TimelineEvent, Batch,
    candidatesApi, batchesApi
} from '@/lib/api';

// Stage definitions with flow order and descriptions
const MAIN_STAGES: { stage: CandidateStage; label: string; icon: React.ReactNode; description: string }[] = [
    { stage: 'SOURCING', label: 'Sourcing', icon: <Users className="w-4 h-4" />, description: 'Initial screening & batch assignment' },
    { stage: 'TRAINING', label: 'Training', icon: <BookOpen className="w-4 h-4" />, description: 'Active training period' },
    { stage: 'RESUME', label: 'Resume', icon: <FileText className="w-4 h-4" />, description: 'Resume preparation' },
    { stage: 'MOCKING', label: 'Mocking', icon: <Star className="w-4 h-4" />, description: 'Mock interviews' },
    { stage: 'MARKETING', label: 'Marketing', icon: <Zap className="w-4 h-4" />, description: 'Client submissions' },
    { stage: 'OFFERED', label: 'Offered', icon: <FileText className="w-4 h-4" />, description: 'Offer received' },
    { stage: 'PLACED', label: 'Placed', icon: <Check className="w-4 h-4" />, description: 'Started work' },
];

const TERMINAL_STAGES: { stage: CandidateStage; label: string; icon: React.ReactNode; color: string }[] = [
    { stage: 'ON_HOLD', label: 'On Hold', icon: <Pause className="w-4 h-4" />, color: 'bg-amber-500' },
    { stage: 'ELIMINATED', label: 'Eliminated', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500' },
    { stage: 'WITHDRAWN', label: 'Withdrawn', icon: <X className="w-4 h-4" />, color: 'bg-gray-500' },
];

// Sub-status workflow definitions
const SUBSTATUS_WORKFLOWS: Record<CandidateStage, {
    subStatus: CandidateSubStatus;
    label: string;
    description?: string;
    requiresBatch?: boolean;
    requiresMock?: boolean;  // Indicates this status is managed via Mock system
    mockNote?: string;       // Guidance text for mock-managed statuses
    canRetry?: boolean;      // Indicates this is a failed state that can be retried
    retryNote?: string;      // Guidance text for retrying
    triggersNext?: boolean;
}[]> = {
    SOURCING: [
        { subStatus: 'SOURCED', label: 'Sourced', description: 'Candidate created in system' },
        { subStatus: 'CONTACTED', label: 'Contacted', description: 'Initial contact made' },
        { subStatus: 'SCREENING_SCHEDULED', label: 'Screening Scheduled', description: 'Screening mock scheduled', requiresMock: true, mockNote: 'Schedule via Mocks section' },
        { subStatus: 'SCREENING_PASSED', label: 'Screening Passed', description: 'Ready for training path', requiresMock: true, mockNote: 'Complete mock feedback to update' },
        { subStatus: 'TRAINING_CONTRACT_SENT', label: 'Contract Sent', description: 'Training contract sent' },
        { subStatus: 'TRAINING_CONTRACT_SIGNED', label: 'Contract Signed', description: 'Contract signed' },
        { subStatus: 'BATCH_ASSIGNED', label: 'Batch Assigned', description: 'Assigned to batch', requiresBatch: true, triggersNext: true },
        { subStatus: 'SCREENING_FAILED', label: 'Screening Failed', description: 'Did not pass screening', requiresMock: true, canRetry: true, retryNote: 'Schedule another Screening mock to retry' },
        { subStatus: 'DIRECT_MARKETING_READY', label: 'Direct Marketing', description: 'Ready for direct → Marketing', triggersNext: true },
    ],
    TRAINING: [
        { subStatus: 'IN_TRAINING', label: 'In Training', description: 'Currently in training batch' },
    ],
    RESUME: [
        { subStatus: 'RESUME_PREPARING', label: 'Preparing', description: 'Resume in preparation' },
        { subStatus: 'RESUME_READY', label: 'Ready', description: 'Resume ready', triggersNext: true },
    ],
    MOCKING: [
        { subStatus: 'MOCK_THEORY_READY', label: 'Theory Ready', description: 'Ready for theory mock' },
        { subStatus: 'MOCK_THEORY_SCHEDULED', label: 'Theory Scheduled', description: 'Theory mock scheduled', requiresMock: true, mockNote: 'Schedule via Mocks section' },
        { subStatus: 'MOCK_THEORY_PASSED', label: 'Theory Passed', description: 'Passed theory mock', requiresMock: true, mockNote: 'Complete mock feedback to update' },
        { subStatus: 'MOCK_THEORY_FAILED', label: 'Theory Failed', description: 'Failed theory mock', requiresMock: true, canRetry: true, retryNote: 'Schedule another Theory mock to retry' },
        { subStatus: 'MOCK_REAL_SCHEDULED', label: 'Real Scheduled', description: 'Real mock scheduled', requiresMock: true, mockNote: 'Schedule via Mocks section' },
        { subStatus: 'MOCK_REAL_PASSED', label: 'Real Passed', description: 'Passed real mock → Marketing', requiresMock: true, mockNote: 'Complete mock feedback to update', triggersNext: true },
        { subStatus: 'MOCK_REAL_FAILED', label: 'Real Failed', description: 'Failed real mock', requiresMock: true, canRetry: true, retryNote: 'Schedule another Real mock to retry' },
    ],
    MARKETING: [],
    OFFERED: [
        { subStatus: 'OFFER_PENDING', label: 'Pending', description: 'Offer pending decision' },
        { subStatus: 'OFFER_ACCEPTED', label: 'Accepted', description: 'Offer accepted', triggersNext: true },
        { subStatus: 'OFFER_DECLINED', label: 'Declined', description: 'Offer declined' },
    ],
    PLACED: [
        { subStatus: 'PLACED_CONFIRMED', label: 'Confirmed', description: 'Placement confirmed' },
    ],
    ON_HOLD: [
        { subStatus: 'WAITING_DOCS', label: 'Waiting Docs', description: 'Waiting for documents' },
        { subStatus: 'PERSONAL_PAUSE', label: 'Personal Pause', description: 'Personal reasons' },
        { subStatus: 'VISA_ISSUE', label: 'Visa Issue', description: 'Visa-related hold' },
        { subStatus: 'OTHER', label: 'Other', description: 'Other reasons' },
    ],
    ELIMINATED: [
        { subStatus: 'CLOSED', label: 'Closed', description: 'Case closed' },
    ],
    WITHDRAWN: [
        { subStatus: 'SELF_WITHDRAWN', label: 'Self Withdrawn', description: 'Candidate withdrew' },
    ],
};

// Determine sub-status order index for comparison
const getSubStatusIndex = (stage: CandidateStage, subStatus: CandidateSubStatus): number => {
    const workflow = SUBSTATUS_WORKFLOWS[stage] || [];
    return workflow.findIndex(s => s.subStatus === subStatus);
};

// Get next recommended actions
const getNextActions = (stage: CandidateStage, subStatus: CandidateSubStatus): { action: string; label: string; targetSubStatus?: CandidateSubStatus; targetStage?: CandidateStage; isRetry?: boolean }[] => {
    const actions: { action: string; label: string; targetSubStatus?: CandidateSubStatus; targetStage?: CandidateStage; isRetry?: boolean }[] = [];

    const workflow = SUBSTATUS_WORKFLOWS[stage] || [];
    const currentIndex = getSubStatusIndex(stage, subStatus);
    const currentSub = workflow.find(s => s.subStatus === subStatus);

    // Check if current status is a failed state that can be retried
    if (currentSub?.canRetry) {
        actions.push({
            action: 'retry',
            label: currentSub.retryNote || 'Schedule another mock to retry',
            isRetry: true
        });
    }

    // Suggest next sub-status (only if not in failed state)
    if (!currentSub?.canRetry && currentIndex >= 0 && currentIndex < workflow.length - 1) {
        const nextSub = workflow[currentIndex + 1];
        if (nextSub && !['SCREENING_FAILED', 'MOCK_THEORY_FAILED', 'MOCK_REAL_FAILED', 'OFFER_DECLINED'].includes(nextSub.subStatus)) {
            actions.push({
                action: 'substatus',
                label: `→ ${nextSub.label}`,
                targetSubStatus: nextSub.subStatus
            });
        }
    }

    // Stage-specific next stage suggestions
    if (stage === 'SOURCING' && subStatus === 'BATCH_ASSIGNED') {
        actions.push({ action: 'info', label: 'Batch start will move to Training' });
    }
    if (stage === 'SOURCING' && subStatus === 'DIRECT_MARKETING_READY') {
        actions.push({ action: 'stage', label: '→ Marketing', targetStage: 'MARKETING' });
    }
    if (stage === 'MOCKING' && subStatus === 'MOCK_REAL_PASSED') {
        actions.push({ action: 'stage', label: '→ Marketing', targetStage: 'MARKETING' });
    }
    if (stage === 'RESUME' && subStatus === 'RESUME_READY') {
        actions.push({ action: 'stage', label: '→ Mocking', targetStage: 'MOCKING' });
    }
    if (stage === 'OFFERED' && subStatus === 'OFFER_ACCEPTED') {
        actions.push({ action: 'stage', label: '→ Placed', targetStage: 'PLACED' });
    }

    return actions;
};

interface StageProgressCardProps {
    candidate: Candidate;
    timeline: TimelineEvent[];
    onUpdate: (updated: Candidate, newTimeline: TimelineEvent[]) => void;
    onTransition: (toStage: CandidateStage) => Promise<void>;
    transitioning?: boolean;
    error?: string | null;
    onClearError?: () => void;
}

// Timeline Section Component with expand/collapse
function TimelineSection({ timeline }: { timeline: TimelineEvent[] }) {
    const [expanded, setExpanded] = useState(false);
    const displayCount = expanded ? timeline.length : 5;
    const hasMore = timeline.length > 5;

    return (
        <div className="px-4 py-4 border-t bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Activity ({timeline.length})
                    </span>
                </div>
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs h-6 px-2"
                    >
                        {expanded ? 'Show Less' : `Show All (${timeline.length})`}
                        <ChevronRight className={cn("w-3 h-3 ml-1 transition-transform", expanded && "rotate-90")} />
                    </Button>
                )}
            </div>
            {timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events yet</p>
            ) : (
                <div className={cn("space-y-2", expanded && "max-h-80 overflow-y-auto pr-2")}>
                    {timeline.slice(0, displayCount).map((event) => (
                        <div key={event.id} className="flex items-start gap-2">
                            <div
                                className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white",
                                    event.eventType === 'STAGE_CHANGED' || event.eventType === 'STAGE_CHANGE' ? 'bg-primary' :
                                        event.eventType === 'SUBSTATUS_CHANGED' ? 'bg-sky-500' :
                                            event.eventType === 'CANDIDATE_CREATED' ? 'bg-slate-500' :
                                                event.eventType === 'BATCH' ? 'bg-purple-500' :
                                                    event.eventType === 'MOCK' ? 'bg-violet-500' :
                                                        'bg-slate-400'
                                )}
                            >
                                {(event.eventType === 'STAGE_CHANGED' || event.eventType === 'STAGE_CHANGE') && <ArrowRight className="w-3 h-3" />}
                                {event.eventType === 'SUBSTATUS_CHANGED' && <Pencil className="w-3 h-3" />}
                                {event.eventType === 'CANDIDATE_CREATED' && <Plus className="w-3 h-3" />}
                                {event.eventType === 'BATCH' && <BookOpen className="w-3 h-3" />}
                                {event.eventType === 'MOCK' && <Star className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{event.title}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {new Date(event.eventDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function StageProgressCard({
    candidate,
    timeline,
    onUpdate,
    onTransition,
    transitioning = false,
    error = null,
    onClearError,
}: StageProgressCardProps) {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [updating, setUpdating] = useState(false);
    const [showBatchDropdown, setShowBatchDropdown] = useState(false);

    useEffect(() => {
        batchesApi.getAll().then(setBatches).catch(console.error);
    }, []);

    useEffect(() => {
        if (candidate.batch) {
            setSelectedBatch(String(candidate.batch.id));
        }
    }, [candidate.batch]);

    const currentStageIndex = MAIN_STAGES.findIndex(s => s.stage === candidate.stage);
    const isTerminalStage = TERMINAL_STAGES.some(s => s.stage === candidate.stage);
    const currentSubStatusIndex = getSubStatusIndex(candidate.stage, candidate.subStatus);
    const subStatusWorkflow = SUBSTATUS_WORKFLOWS[candidate.stage] || [];
    const nextActions = getNextActions(candidate.stage, candidate.subStatus);

    const handleSubStatusUpdate = async (subStatus: CandidateSubStatus, batchId?: number) => {
        if (updating) return;
        setUpdating(true);
        try {
            if (batchId && subStatus === 'BATCH_ASSIGNED') {
                // First assign batch, then update substatus
                const updates = {
                    ...candidate,
                    batch: { id: batchId } as Batch,
                };
                await candidatesApi.update(candidate.id, updates);
            }
            const updated = await candidatesApi.updateSubStatus(candidate.id, {
                subStatus,
                reason: `Updated to ${subStatus}`,
            });
            const newTimeline = await candidatesApi.getTimeline(candidate.id);
            onUpdate(updated, newTimeline);
            setShowBatchDropdown(false);
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleQuickAction = async (action: { action: string; targetSubStatus?: CandidateSubStatus; targetStage?: CandidateStage }) => {
        if (action.action === 'substatus' && action.targetSubStatus) {
            await handleSubStatusUpdate(action.targetSubStatus);
        } else if (action.action === 'stage' && action.targetStage) {
            await onTransition(action.targetStage);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Candidate Journey
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Error Display */}
                {error && (
                    <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </span>
                        {onClearError && (
                            <button onClick={onClearError} className="text-red-600 hover:text-red-800">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Stage Progress Timeline (Horizontal Stepper) */}
                <div className="px-4 py-5 border-b overflow-x-auto">
                    <div className="flex items-center min-w-max">
                        {MAIN_STAGES.map((stageInfo, index) => {
                            const isPast = !isTerminalStage && index < currentStageIndex;
                            const isCurrent = stageInfo.stage === candidate.stage;
                            const isFuture = !isTerminalStage && index > currentStageIndex;
                            const isTerminal = TERMINAL_STAGES.some(t => t.stage === candidate.stage);

                            return (
                                <div key={stageInfo.stage} className="flex items-center">
                                    {/* Stage Circle */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                                isPast && "bg-green-500 text-white shadow-md",
                                                isCurrent && !isTerminal && "bg-primary text-white shadow-lg ring-4 ring-primary/20 scale-110",
                                                isFuture && "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500",
                                                isTerminal && isCurrent && "bg-gray-500 text-white"
                                            )}
                                        >
                                            {isPast ? <Check className="w-5 h-5" /> : stageInfo.icon}
                                        </div>
                                        <span
                                            className={cn(
                                                "mt-2 text-xs font-medium whitespace-nowrap",
                                                isPast && "text-green-600 dark:text-green-400",
                                                isCurrent && "text-primary font-semibold",
                                                isFuture && "text-gray-400 dark:text-gray-500"
                                            )}
                                        >
                                            {stageInfo.label}
                                        </span>
                                    </div>

                                    {/* Connector Line */}
                                    {index < MAIN_STAGES.length - 1 && (
                                        <div
                                            className={cn(
                                                "w-12 h-1 mx-2 rounded transition-all duration-300",
                                                isPast ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                            )}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Terminal Stage Indicator */}
                    {isTerminalStage && (
                        <div className="mt-4 flex items-center justify-center">
                            {TERMINAL_STAGES.filter(t => t.stage === candidate.stage).map(t => (
                                <div key={t.stage} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-white", t.color)}>
                                    {t.icon}
                                    <span className="font-medium">{t.label}</span>
                                    {candidate.lastActiveStage && (
                                        <span className="text-xs opacity-80 ml-2">(from {candidate.lastActiveStage})</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sub-status Workflow (Vertical Steps within current stage) */}
                {subStatusWorkflow.length > 0 && !isTerminalStage && (
                    <div className="px-4 py-4 border-b">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {candidate.stage} Progress
                            </span>
                            <span className="text-xs text-muted-foreground">
                                ({currentSubStatusIndex + 1} of {subStatusWorkflow.length})
                            </span>
                        </div>
                        <div className="space-y-2">
                            {subStatusWorkflow.map((sub, index) => {
                                const isPast = index < currentSubStatusIndex;
                                const isCurrent = sub.subStatus === candidate.subStatus;
                                const isFuture = index > currentSubStatusIndex;
                                const isFailState = ['SCREENING_FAILED', 'MOCK_THEORY_FAILED', 'MOCK_REAL_FAILED', 'OFFER_DECLINED'].includes(sub.subStatus);
                                const requiresBatch = sub.requiresBatch && isFuture && index === currentSubStatusIndex + 1;

                                return (
                                    <div
                                        key={sub.subStatus}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                                            isPast && "bg-green-50 dark:bg-green-900/20",
                                            isCurrent && "bg-primary/10 border-2 border-primary shadow-sm",
                                            isFuture && !isFailState && "bg-gray-50 dark:bg-gray-800/50",
                                            isFailState && isFuture && "bg-red-50/50 dark:bg-red-900/10",
                                            isFailState && isCurrent && "bg-red-100 border-2 border-red-400"
                                        )}
                                    >
                                        {/* Status Circle */}
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                                isPast && "bg-green-500 text-white",
                                                isCurrent && !isFailState && "bg-primary text-white",
                                                isCurrent && isFailState && "bg-red-500 text-white",
                                                isFuture && !isFailState && "bg-gray-300 dark:bg-gray-600",
                                                isFailState && isFuture && "bg-red-200 dark:bg-red-800"
                                            )}
                                        >
                                            {isPast ? (
                                                <Check className="w-3 h-3" />
                                            ) : isCurrent ? (
                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            ) : (
                                                <span className="text-xs">{index + 1}</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "font-medium text-sm",
                                                        isPast && "text-green-700 dark:text-green-300",
                                                        isCurrent && "text-primary",
                                                        isFuture && "text-gray-500",
                                                        isFailState && isCurrent && "text-red-700"
                                                    )}
                                                >
                                                    {sub.label}
                                                </span>
                                                {sub.triggersNext && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                                        NEXT STAGE
                                                    </span>
                                                )}
                                            </div>
                                            {sub.description && (
                                                <p className={cn(
                                                    "text-xs mt-0.5",
                                                    isPast ? "text-green-600/80 dark:text-green-400/80" : "text-muted-foreground"
                                                )}>
                                                    {sub.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Button for next step */}
                                        {!isPast && !isCurrent && index === currentSubStatusIndex + 1 && !isFailState && (
                                            <div className="shrink-0">
                                                {sub.requiresMock ? (
                                                    /* Mock-managed status: show guidance instead of action button */
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                                        <span className="text-[10px] text-amber-700 dark:text-amber-300 whitespace-nowrap">
                                                            {sub.mockNote || 'Use Mocks section'}
                                                        </span>
                                                    </div>
                                                ) : sub.requiresBatch ? (
                                                    <div className="relative">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setShowBatchDropdown(!showBatchDropdown)}
                                                            disabled={updating}
                                                            className="text-xs"
                                                        >
                                                            {showBatchDropdown ? 'Cancel' : 'Assign Batch'}
                                                        </Button>
                                                        {showBatchDropdown && (
                                                            <div className="absolute right-0 top-full mt-2 w-64 bg-background border rounded-lg shadow-lg z-10 p-3">
                                                                <label className="text-xs font-medium mb-2 block">Select Batch:</label>
                                                                <select
                                                                    value={selectedBatch}
                                                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                                                                >
                                                                    <option value="">Choose batch...</option>
                                                                    {batches.map(b => (
                                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                                    ))}
                                                                </select>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSubStatusUpdate('BATCH_ASSIGNED', Number(selectedBatch))}
                                                                    disabled={!selectedBatch || updating}
                                                                    className="w-full"
                                                                >
                                                                    {updating ? 'Assigning...' : 'Confirm Assignment'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSubStatusUpdate(sub.subStatus)}
                                                        disabled={updating}
                                                        className="text-xs text-primary hover:bg-primary/10"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Next Actions Panel */}
                {!isTerminalStage && nextActions.length > 0 && (
                    <div className={cn(
                        "px-4 py-4",
                        nextActions.some(a => a.action === 'retry')
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                    )}>
                        <div className="flex items-center gap-2 mb-3">
                            {nextActions.some(a => a.action === 'retry') ? (
                                <>
                                    <RefreshCw className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                                        Recovery Action
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                                        Recommended Next Step
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {nextActions.map((action, i) => (
                                action.action === 'retry' ? (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-800/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                                        <RefreshCw className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                        <span className="text-sm text-amber-800 dark:text-amber-200">{action.label}</span>
                                    </div>
                                ) : (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={action.action === 'stage' ? 'default' : 'outline'}
                                        onClick={() => action.action !== 'info' && handleQuickAction(action)}
                                        disabled={transitioning || updating || action.action === 'info'}
                                        className={cn(
                                            action.action === 'info' && "cursor-default opacity-80"
                                        )}
                                    >
                                        {action.label}
                                        {action.action !== 'info' && <ChevronRight className="w-3 h-3 ml-1" />}
                                    </Button>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Stage Transition Actions */}
                {!isTerminalStage && (
                    <div className="px-4 py-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Other Actions
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onTransition('ON_HOLD')}
                                disabled={transitioning}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                            >
                                <Pause className="w-3 h-3 mr-1" />
                                Put On Hold
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onTransition('WITHDRAWN')}
                                disabled={transitioning}
                                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Withdraw
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onTransition('ELIMINATED')}
                                disabled={transitioning}
                            >
                                <XCircle className="w-3 h-3 mr-1" />
                                Eliminate
                            </Button>
                        </div>
                    </div>
                )}

                {/* Resume from Terminal State */}
                {isTerminalStage && candidate.lastActiveStage && (
                    <div className="px-4 py-4 border-t bg-slate-50 dark:bg-slate-800/50">
                        <Button
                            onClick={() => onTransition(candidate.lastActiveStage!)}
                            disabled={transitioning}
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Resume to {candidate.lastActiveStage}
                        </Button>
                    </div>
                )}

                {/* Timeline Activity (expandable) */}
                <TimelineSection timeline={timeline} />
            </CardContent>
        </Card>
    );
}
