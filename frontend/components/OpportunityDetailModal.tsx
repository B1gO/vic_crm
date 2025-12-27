'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    X, ChevronRight, ChevronDown, Plus, Check, XCircle, Clock,
    Calendar, MessageSquare, Link2, Unlink
} from 'lucide-react';
import type {
    Opportunity,
    PipelineStep,
    OpportunityAttemptLink,
    AssessmentAttempt,
    StepType,
    StepState,
    StepResult,
} from '@/types';
import { opportunitiesApi, pipelineStepsApi, vendorEngagementsApi } from '@/lib/api';

// Step type configuration
const STEP_TYPE_CONFIG: Record<StepType, { label: string; icon: string; color: string }> = {
    OA: { label: 'OA', icon: '📝', color: 'bg-blue-100 text-blue-700' },
    VENDOR_SCREENING: { label: 'Vendor Screening', icon: '🔍', color: 'bg-indigo-100 text-indigo-700' },
    CLIENT_INTERVIEW: { label: 'Client Interview', icon: '💼', color: 'bg-purple-100 text-purple-700' },
    OFFER: { label: 'Offer', icon: '📄', color: 'bg-amber-100 text-amber-700' },
    OFFER_ACCEPTED: { label: 'Offer Accepted', icon: '✅', color: 'bg-green-100 text-green-700' },
    OFFER_DECLINED: { label: 'Offer Declined', icon: '❌', color: 'bg-red-100 text-red-700' },
    PLACED: { label: 'Placed', icon: '🏆', color: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Rejected', icon: '🚫', color: 'bg-red-100 text-red-700' },
    WITHDRAWN: { label: 'Withdrawn', icon: '🚶', color: 'bg-gray-100 text-gray-600' },
};

// Result configuration
const RESULT_CONFIG: Record<StepResult, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" /> },
    PASS: { label: 'Pass', color: 'bg-green-100 text-green-700', icon: <Check className="h-4 w-4" /> },
    FAIL: { label: 'Fail', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
};

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
    INTERVIEWING: { label: 'Interviewing', color: 'bg-purple-100 text-purple-700' },
    OFFERED: { label: 'Offered', color: 'bg-amber-100 text-amber-700' },
    PLACED: { label: 'Placed', color: 'bg-green-100 text-green-700' },
};

interface OpportunityDetailModalProps {
    opportunityId: number;
    onClose: () => void;
    onUpdate?: () => void;
}

// Extended PipelineStep with children for tree rendering
interface StepNode extends PipelineStep {
    children: StepNode[];
}

export function OpportunityDetailModal({
    opportunityId,
    onClose,
    onUpdate,
}: OpportunityDetailModalProps) {
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [steps, setSteps] = useState<PipelineStep[]>([]);
    const [attemptLinks, setAttemptLinks] = useState<OpportunityAttemptLink[]>([]);
    const [availableAttempts, setAvailableAttempts] = useState<AssessmentAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddStep, setShowAddStep] = useState<{ parentId: number | null } | null>(null);
    const [showAttachAttempt, setShowAttachAttempt] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [oppData, stepsData, linksData] = await Promise.all([
                opportunitiesApi.getById(opportunityId),
                opportunitiesApi.getSteps(opportunityId),
                opportunitiesApi.getAttemptLinks(opportunityId),
            ]);
            setOpportunity(oppData);
            setSteps(stepsData);
            setAttemptLinks(linksData);

            // Load available attempts from vendor engagement
            if (oppData.vendorEngagement?.id) {
                const attempts = await vendorEngagementsApi.getAttempts(oppData.vendorEngagement.id);
                setAvailableAttempts(attempts);
            }
        } catch (error) {
            console.error('Failed to load opportunity:', error);
        } finally {
            setLoading(false);
        }
    }, [opportunityId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Build tree structure from flat list
    const buildTree = (steps: PipelineStep[]): StepNode[] => {
        const map = new Map<number, StepNode>();
        const roots: StepNode[] = [];

        // Create nodes
        steps.forEach(step => {
            map.set(step.id, { ...step, children: [] });
        });

        // Build hierarchy
        steps.forEach(step => {
            const node = map.get(step.id)!;
            if (step.parentStep?.id) {
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

        // Sort by createdAt
        const sortNodes = (nodes: StepNode[]) => {
            nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            nodes.forEach(n => sortNodes(n.children));
        };
        sortNodes(roots);

        return roots;
    };

    const handleAddStep = async (parentId: number | null, type: StepType, round?: number) => {
        try {
            await opportunitiesApi.createStep(opportunityId, {
                parentStepId: parentId,
                type,
                round,
            });
            setShowAddStep(null);
            loadData();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to add step:', error);
        }
    };

    const handleUpdateResult = async (stepId: number, result: StepResult, feedback?: string) => {
        try {
            await pipelineStepsApi.update(stepId, {
                result,
                state: result === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED',
                happenedAt: result !== 'PENDING' ? new Date().toISOString() : undefined,
                feedback,
            });
            loadData();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to update step:', error);
        }
    };

    const handleAttachAttempt = async (attemptId: number) => {
        try {
            await opportunitiesApi.attachAttempt(opportunityId, attemptId);
            setShowAttachAttempt(false);
            loadData();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to attach attempt:', error);
        }
    };

    const handleDetachAttempt = async (attemptId: number) => {
        try {
            await opportunitiesApi.detachAttempt(opportunityId, attemptId);
            loadData();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to detach attempt:', error);
        }
    };

    const linkedAttemptIds = new Set(attemptLinks.map(l => l.attempt.id));
    const unlinkedAttempts = availableAttempts.filter(a => !linkedAttemptIds.has(a.id));
    const stepTree = buildTree(steps);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card rounded-lg p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </div>
            </div>
        );
    }

    if (!opportunity) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">
                                {opportunity.position.client?.companyName || 'Client'} - {opportunity.position.title}
                            </h2>
                            <p className="text-slate-300 text-sm mt-1">
                                via {opportunity.vendorEngagement.vendor.companyName}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[opportunity.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_CONFIG[opportunity.status]?.label || opportunity.status}
                            </span>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Attached Attempts Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Link2 className="h-4 w-4" />
                                Attached Assessments
                            </h3>
                            {unlinkedAttempts.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAttachAttempt(true)}
                                    className="gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Attach
                                </Button>
                            )}
                        </div>

                        {showAttachAttempt && (
                            <div className="mb-3 p-3 bg-muted rounded-lg border border-border">
                                <p className="text-sm text-muted-foreground mb-2">Select assessment to attach:</p>
                                <div className="space-y-1">
                                    {unlinkedAttempts.map(attempt => (
                                        <button
                                            key={attempt.id}
                                            onClick={() => handleAttachAttempt(attempt.id)}
                                            className="w-full text-left p-2 bg-card rounded border border-border hover:bg-muted text-sm"
                                        >
                                            {attempt.attemptType}
                                            {attempt.track && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">
                                                    {attempt.track}
                                                </span>
                                            )}
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${RESULT_CONFIG[attempt.result].color}`}>
                                                {attempt.result}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAttachAttempt(false)}
                                    className="mt-2"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}

                        {attemptLinks.length > 0 ? (
                            <div className="space-y-2">
                                {attemptLinks.map(link => (
                                    <div
                                        key={link.id}
                                        className="flex items-center justify-between p-2 bg-card rounded-lg border border-border"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">
                                                {link.attempt.attemptType}
                                            </span>
                                            {link.attempt.track && (
                                                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                                    {link.attempt.track}
                                                </span>
                                            )}
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${RESULT_CONFIG[link.attempt.result].color}`}>
                                                {link.attempt.result}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDetachAttempt(link.attempt.id)}
                                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Detach"
                                        >
                                            <Unlink className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No assessments attached</p>
                        )}
                    </div>

                    {/* Pipeline Steps Tree Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Pipeline Steps
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddStep({ parentId: null })}
                                className="gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Step
                            </Button>
                        </div>

                        {showAddStep && showAddStep.parentId === null && (
                            <AddStepForm
                                onAdd={(type, round) => handleAddStep(null, type, round)}
                                onCancel={() => setShowAddStep(null)}
                            />
                        )}

                        {stepTree.length > 0 ? (
                            <div className="space-y-2">
                                {stepTree.map(node => (
                                    <StepNodeComponent
                                        key={node.id}
                                        node={node}
                                        depth={0}
                                        onAddChild={(parentId) => setShowAddStep({ parentId })}
                                        onUpdateResult={handleUpdateResult}
                                        showAddStep={showAddStep}
                                        onAddStep={handleAddStep}
                                        onCancelAdd={() => setShowAddStep(null)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No pipeline steps yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step Node Component (recursive tree renderer)
function StepNodeComponent({
    node,
    depth,
    onAddChild,
    onUpdateResult,
    showAddStep,
    onAddStep,
    onCancelAdd,
}: {
    node: StepNode;
    depth: number;
    onAddChild: (parentId: number) => void;
    onUpdateResult: (stepId: number, result: StepResult, feedback?: string) => void;
    showAddStep: { parentId: number | null } | null;
    onAddStep: (parentId: number | null, type: StepType, round?: number) => void;
    onCancelAdd: () => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const [showResultForm, setShowResultForm] = useState(false);
    const [feedback, setFeedback] = useState('');

    const config = STEP_TYPE_CONFIG[node.type];
    const resultConfig = RESULT_CONFIG[node.result];
    const hasChildren = node.children.length > 0;

    const handleResultUpdate = (result: StepResult) => {
        onUpdateResult(node.id, result, feedback || undefined);
        setShowResultForm(false);
        setFeedback('');
    };

    return (
        <div className="relative">
            {/* Connection line for nested items */}
            {depth > 0 && (
                <div
                    className="absolute left-0 top-0 bottom-0 border-l-2 border-border"
                    style={{ marginLeft: `${depth * 24 - 12}px` }}
                />
            )}

            <div
                className="flex items-start gap-2 p-3 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow"
                style={{ marginLeft: `${depth * 24}px` }}
            >
                {/* Expand/collapse button for nodes with children */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`p-1 rounded hover:bg-muted ${hasChildren ? '' : 'opacity-0 pointer-events-none'}`}
                >
                    {expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                {/* Step info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{config?.icon}</span>
                        <span className={`px-2 py-0.5 rounded text-sm font-medium ${config?.color}`}>
                            {config?.label || node.type}
                        </span>
                        {node.round && (
                            <span className="text-xs text-muted-foreground">
                                Round {node.round}
                            </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${resultConfig.color}`}>
                            {resultConfig.icon}
                            {resultConfig.label}
                        </span>
                    </div>

                    {node.feedback && (
                        <div className="mt-2 text-sm text-muted-foreground flex items-start gap-1">
                            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            {node.feedback}
                        </div>
                    )}

                    {showResultForm && (
                        <div className="mt-3 p-2 bg-muted rounded border border-border">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Feedback (optional)"
                                className="w-full px-2 py-1 border border-border rounded text-sm mb-2 bg-background"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResultUpdate('PASS')}
                                    className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                                >
                                    <Check className="h-4 w-4" />
                                    Pass
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResultUpdate('FAIL')}
                                    className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Fail
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowResultForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {node.result === 'PENDING' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowResultForm(true)}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddChild(node.id)}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Add step form for this node's children */}
            {showAddStep && showAddStep.parentId === node.id && (
                <div style={{ marginLeft: `${(depth + 1) * 24}px` }}>
                    <AddStepForm
                        onAdd={(type, round) => onAddStep(node.id, type, round)}
                        onCancel={onCancelAdd}
                    />
                </div>
            )}

            {/* Children */}
            {expanded && hasChildren && (
                <div className="mt-2">
                    {node.children.map(child => (
                        <StepNodeComponent
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onAddChild={onAddChild}
                            onUpdateResult={onUpdateResult}
                            showAddStep={showAddStep}
                            onAddStep={onAddStep}
                            onCancelAdd={onCancelAdd}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Add Step Form Component
function AddStepForm({
    onAdd,
    onCancel,
}: {
    onAdd: (type: StepType, round?: number) => void;
    onCancel: () => void;
}) {
    const [type, setType] = useState<StepType>('CLIENT_INTERVIEW');
    const [round, setRound] = useState<number | undefined>();

    const stepTypes: StepType[] = [
        'CLIENT_INTERVIEW',
        'OFFER',
        'OFFER_ACCEPTED',
        'OFFER_DECLINED',
        'PLACED',
        'REJECTED',
        'WITHDRAWN',
    ];

    return (
        <div className="p-3 bg-muted rounded-lg border border-border mt-2 mb-2">
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Step Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as StepType)}
                        className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                    >
                        {stepTypes.map(t => (
                            <option key={t} value={t}>
                                {STEP_TYPE_CONFIG[t]?.icon} {STEP_TYPE_CONFIG[t]?.label}
                            </option>
                        ))}
                    </select>
                </div>
                {type === 'CLIENT_INTERVIEW' && (
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Round
                        </label>
                        <input
                            type="number"
                            value={round || ''}
                            onChange={(e) => setRound(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="1, 2, 3..."
                            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                            min={1}
                        />
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={() => onAdd(type, round)}
                >
                    Add Step
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
