'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Check, Clock, ChevronRight, X, Plus,
    Building2, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Submission, SubmissionStatus, SubmissionStep, StepType, StepResult, Position, submissionsApi, positionsApi } from '@/lib/api';
import Link from 'next/link';

// Status display configuration
const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bgColor: string }> = {
    ACTIVE: { label: 'Active', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    OFFERED: { label: 'Offered', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    PLACED: { label: 'Placed', color: 'text-green-600', bgColor: 'bg-green-100' },
    REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
    WITHDRAWN: { label: 'Withdrawn', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const STEP_TYPE_CONFIG: Record<StepType, { label: string; icon: string }> = {
    OA: { label: 'OA', icon: '📝' },
    VENDOR_SCREENING: { label: 'Vendor Screening', icon: '🔍' },
    CLIENT_INTERVIEW: { label: 'Interview', icon: '💼' },
    OFFER: { label: 'Offer', icon: '🎉' },
    OFFER_ACCEPTED: { label: 'Offer Accepted', icon: '✅' },
    OFFER_DECLINED: { label: 'Offer Declined', icon: '❌' },
    PLACED: { label: 'Placed', icon: '🏆' },
    REJECTED: { label: 'Rejected', icon: '🚫' },
    WITHDRAWN: { label: 'Withdrawn', icon: '🚶' },
};

interface SubmissionPipelineCardProps {
    submission: Submission;
    onUpdate?: (submission: Submission) => void;
}

export function SubmissionPipelineCard({ submission, onUpdate }: SubmissionPipelineCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [steps, setSteps] = useState<SubmissionStep[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddStep, setShowAddStep] = useState<{ show: boolean; parentId: number | null }>({ show: false, parentId: null });

    const statusConfig = STATUS_CONFIG[submission.status];

    const loadData = async () => {
        if (steps.length > 0) return;
        setLoading(true);
        try {
            const [stepsData, positionsData] = await Promise.all([
                submissionsApi.getSteps(submission.id),
                positionsApi.getAll()
            ]);
            setSteps(stepsData);
            setPositions(positionsData);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = () => {
        if (!expanded) loadData();
        setExpanded(!expanded);
    };

    const handleAddStep = async (parentId: number | null, type: StepType, positionId?: number, round?: number, scheduledAt?: string) => {
        try {
            const newStep = await submissionsApi.addStep(submission.id, {
                parentStepId: parentId,
                type,
                positionId,
                round,
                scheduledAt
            });
            setSteps(prev => [...prev, newStep]);
            setShowAddStep({ show: false, parentId: null });
        } catch (err) {
            console.error('Failed to add step:', err);
        }
    };

    const handleUpdateResult = async (stepId: number, result: StepResult, feedback?: string, score?: string) => {
        try {
            const updated = await submissionsApi.updateStepResult(stepId, { result, feedback, score });
            setSteps(prev => prev.map(s => s.id === updated.id ? updated : s));
        } catch (err) {
            console.error('Failed to update result:', err);
        }
    };

    const handleUpdateStatus = async (status: SubmissionStatus) => {
        try {
            const updated = await submissionsApi.updateStatus(submission.id, { status });
            onUpdate?.(updated);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    // Build tree structure from flat list
    const buildTree = (steps: SubmissionStep[]): (SubmissionStep & { children: SubmissionStep[] })[] => {
        const map = new Map<number, SubmissionStep & { children: SubmissionStep[] }>();
        const roots: (SubmissionStep & { children: SubmissionStep[] })[] = [];

        steps.forEach(step => {
            map.set(step.id, { ...step, children: [] });
        });

        steps.forEach(step => {
            const node = map.get(step.id)!;
            if (step.parentStep) {
                const parent = map.get(step.parentStep.id);
                if (parent) {
                    parent.children.push(node);
                } else {
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    const stepTree = buildTree(steps);
    const latestStep = steps.length > 0 ? steps[steps.length - 1] : null;

    return (
        <Card className={cn(
            "transition-all",
            submission.status === 'REJECTED' && "border-red-200 bg-red-50/30",
            submission.status === 'PLACED' && "border-green-200 bg-green-50/30"
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
                                <Link href={`/vendors/${submission.vendor.id}`} className="hover:text-primary">
                                    {submission.vendor.companyName}
                                </Link>
                            </CardTitle>
                            {latestStep && (
                                <p className="text-sm text-muted-foreground">
                                    Latest: {STEP_TYPE_CONFIG[latestStep.type]?.label || latestStep.type}
                                    {latestStep.round && ` R${latestStep.round}`}
                                    {latestStep.result !== 'PENDING' && ` - ${latestStep.result}`}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusConfig.bgColor, statusConfig.color)}>
                            {statusConfig.label}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleExpand}>
                            <ChevronRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Expanded Content */}
            {expanded && (
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground py-4">
                            <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                            Loading...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Step Tree */}
                            <div className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium">Pipeline Steps</h4>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowAddStep({ show: true, parentId: null })}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Step
                                    </Button>
                                </div>

                                {stepTree.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No steps yet. Add the first step to start tracking.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {stepTree.map(step => (
                                            <StepNode
                                                key={step.id}
                                                step={step}
                                                onAddChild={(parentId) => setShowAddStep({ show: true, parentId })}
                                                onUpdateResult={handleUpdateResult}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Update */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <select
                                    value={submission.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value as SubmissionStatus)}
                                    className="px-2 py-1 border rounded text-sm"
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Add Step Modal */}
                    {showAddStep.show && (
                        <AddStepModal
                            parentId={showAddStep.parentId}
                            positions={positions}
                            onAdd={handleAddStep}
                            onClose={() => setShowAddStep({ show: false, parentId: null })}
                        />
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Step Node Component (recursive)
function StepNode({
    step,
    onAddChild,
    onUpdateResult,
    depth = 0
}: {
    step: SubmissionStep & { children: SubmissionStep[] };
    onAddChild: (parentId: number) => void;
    onUpdateResult: (stepId: number, result: StepResult, feedback?: string, score?: string) => void;
    depth?: number;
}) {
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState('');
    const config = STEP_TYPE_CONFIG[step.type] || { label: step.type, icon: '📋' };

    const handleResult = (result: StepResult) => {
        if (result !== 'PENDING') {
            setShowFeedback(true);
        }
    };

    const submitResult = (result: StepResult) => {
        onUpdateResult(step.id, result, feedback, score);
        setShowFeedback(false);
        setFeedback('');
        setScore('');
    };

    return (
        <div style={{ marginLeft: depth * 20 }}>
            <div className={cn(
                "flex items-center gap-2 p-2 rounded border",
                step.result === 'PASS' && "bg-green-50 border-green-200",
                step.result === 'FAIL' && "bg-red-50 border-red-200",
                step.result === 'PENDING' && "bg-gray-50 border-gray-200"
            )}>
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1">
                    <span className="font-medium text-sm">{config.label}</span>
                    {step.round && <span className="text-xs text-muted-foreground ml-1">R{step.round}</span>}
                    {step.position && (
                        <span className="text-xs text-muted-foreground ml-2">
                            @ {step.position.title} ({step.position.client?.companyName})
                        </span>
                    )}
                    {step.scheduledAt && (
                        <span className="text-xs text-muted-foreground ml-2">
                            📅 {new Date(step.scheduledAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {step.result === 'PENDING' ? (
                    <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-xs text-green-600" onClick={() => handleResult('PASS')}>
                            <Check className="w-3 h-3 mr-1" /> Pass
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-xs text-red-600" onClick={() => handleResult('FAIL')}>
                            <X className="w-3 h-3 mr-1" /> Fail
                        </Button>
                    </div>
                ) : (
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded",
                        step.result === 'PASS' ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                    )}>
                        {step.result}
                    </span>
                )}

                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onAddChild(step.id)}>
                    <Plus className="w-3 h-3" />
                </Button>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="mt-2 p-2 border rounded bg-white">
                    <input
                        type="text"
                        placeholder="Score (optional)"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm mb-2"
                    />
                    <textarea
                        placeholder="Feedback (optional)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                        <Button size="sm" className="h-6 text-xs" onClick={() => submitResult('PASS')}>Save Pass</Button>
                        <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => submitResult('FAIL')}>Save Fail</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowFeedback(false)}>Cancel</Button>
                    </div>
                </div>
            )}

            {/* Show feedback if exists */}
            {step.feedback && (
                <p className="text-xs text-muted-foreground ml-8 mt-1">💬 {step.feedback}</p>
            )}

            {/* Children */}
            {step.children.map(child => (
                <StepNode
                    key={child.id}
                    step={child as SubmissionStep & { children: SubmissionStep[] }}
                    onAddChild={onAddChild}
                    onUpdateResult={onUpdateResult}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}

// Add Step Modal
function AddStepModal({
    parentId,
    positions,
    onAdd,
    onClose
}: {
    parentId: number | null;
    positions: Position[];
    onAdd: (parentId: number | null, type: StepType, positionId?: number, round?: number, scheduledAt?: string) => void;
    onClose: () => void;
}) {
    const [type, setType] = useState<StepType>('CLIENT_INTERVIEW');
    const [positionId, setPositionId] = useState<number | undefined>();
    const [round, setRound] = useState<number | undefined>(1);
    const [scheduledAt, setScheduledAt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(parentId, type, positionId, round, scheduledAt || undefined);
    };

    const showPositionField = ['CLIENT_INTERVIEW', 'OFFER'].includes(type);
    const showRoundField = type === 'CLIENT_INTERVIEW';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">
                    {parentId ? 'Add Next Step' : 'Add First Step'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Step Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as StepType)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="OA">OA (Online Assessment)</option>
                            <option value="VENDOR_SCREENING">Vendor Screening</option>
                            <option value="CLIENT_INTERVIEW">Client Interview</option>
                            <option value="OFFER">Offer</option>
                        </select>
                    </div>

                    {showPositionField && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">Position</label>
                            <select
                                value={positionId || ''}
                                onChange={e => setPositionId(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Select position...</option>
                                {positions.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} @ {p.client?.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showRoundField && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">Round</label>
                            <input
                                type="number"
                                min={1}
                                value={round || ''}
                                onChange={e => setRound(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium mb-1 block">Scheduled Date (optional)</label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={e => setScheduledAt(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Add Step</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
