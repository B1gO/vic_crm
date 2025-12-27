'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    ChevronRight, ChevronDown, Plus, Check, XCircle, Clock,
    Calendar, MessageSquare, Link2, Unlink
} from 'lucide-react';
import type {
    OpportunitySummary,
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
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
    PASS: { label: 'Pass', color: 'bg-green-100 text-green-700', icon: <Check className="h-3 w-3" /> },
    FAIL: { label: 'Fail', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
};

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
    INTERVIEWING: { label: 'Interviewing', color: 'bg-purple-100 text-purple-700' },
    OFFERED: { label: 'Offered', color: 'bg-amber-100 text-amber-700' },
    PLACED: { label: 'Placed', color: 'bg-green-100 text-green-700' },
};

interface ExpandableOpportunityRowProps {
    opportunity: OpportunitySummary;
    vendorEngagementId: number;
    defaultExpanded?: boolean;
    onUpdate?: () => void;
}

// Extended PipelineStep with children for tree rendering
interface StepNode extends PipelineStep {
    children: StepNode[];
}

export function ExpandableOpportunityRow({
    opportunity,
    vendorEngagementId,
    defaultExpanded = true,
    onUpdate,
}: ExpandableOpportunityRowProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [steps, setSteps] = useState<PipelineStep[]>([]);
    const [attemptLinks, setAttemptLinks] = useState<OpportunityAttemptLink[]>([]);
    const [availableAttempts, setAvailableAttempts] = useState<AssessmentAttempt[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddStep, setShowAddStep] = useState<{ parentId: number | null } | null>(null);
    const [showAttachAttempt, setShowAttachAttempt] = useState(false);

    const loadDetails = useCallback(async () => {
        if (!expanded) return;
        setLoading(true);
        try {
            const [stepsData, linksData, attemptsData] = await Promise.all([
                opportunitiesApi.getSteps(opportunity.id),
                opportunitiesApi.getAttemptLinks(opportunity.id),
                vendorEngagementsApi.getAttempts(vendorEngagementId),
            ]);
            setSteps(stepsData);
            setAttemptLinks(linksData);
            setAvailableAttempts(attemptsData);
        } catch (error) {
            console.error('Failed to load opportunity details:', error);
        } finally {
            setLoading(false);
        }
    }, [opportunity.id, vendorEngagementId, expanded]);

    useEffect(() => {
        if (expanded) {
            loadDetails();
        }
    }, [expanded, loadDetails]);

    // Auto-collapse when terminal state is detected after loading
    useEffect(() => {
        if (steps.length > 0) {
            const latestStep = steps[steps.length - 1];
            const terminalStepTypes = ['PLACED', 'REJECTED', 'WITHDRAWN'];
            const isTerminal =
                latestStep.result === 'FAIL' ||
                terminalStepTypes.includes(latestStep.type);

            if (isTerminal && expanded) {
                setExpanded(false);
            }
        }
    }, [steps]); // Only run when steps change

    // Build tree structure
    const buildTree = (steps: PipelineStep[]): StepNode[] => {
        const map = new Map<number, StepNode>();
        const roots: StepNode[] = [];
        steps.forEach(step => map.set(step.id, { ...step, children: [] }));
        steps.forEach(step => {
            const node = map.get(step.id)!;
            if (step.parentStep?.id) {
                const parent = map.get(step.parentStep.id);
                parent ? parent.children.push(node) : roots.push(node);
            } else {
                roots.push(node);
            }
        });
        const sortNodes = (nodes: StepNode[]) => {
            nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            nodes.forEach(n => sortNodes(n.children));
        };
        sortNodes(roots);
        return roots;
    };

    const handleAddStep = async (parentId: number | null, type: StepType, round?: number) => {
        try {
            await opportunitiesApi.createStep(opportunity.id, { parentStepId: parentId, type, round });
            setShowAddStep(null);
            loadDetails();
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
                happenedAt: result !== 'PENDING' ? new Date().toISOString().slice(0, 19) : undefined,
                feedback,
            });
            loadDetails();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to update step:', error);
        }
    };

    const handleAttachAttempt = async (attemptId: number) => {
        try {
            await opportunitiesApi.attachAttempt(opportunity.id, attemptId);
            setShowAttachAttempt(false);
            loadDetails();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to attach attempt:', error);
        }
    };

    const handleDetachAttempt = async (attemptId: number) => {
        try {
            await opportunitiesApi.detachAttempt(opportunity.id, attemptId);
            loadDetails();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to detach attempt:', error);
        }
    };

    const linkedAttemptIds = new Set(attemptLinks.map(l => l.attempt.id));
    const unlinkedAttempts = availableAttempts.filter(a => !linkedAttemptIds.has(a.id));
    const stepTree = buildTree(steps);

    // Calculate actual latest step from loaded data (steps are sorted by createdAt)
    const actualLatestStep = steps.length > 0 ? steps[steps.length - 1] : null;
    // Use loaded data if available, otherwise fall back to summary
    const displayStep = actualLatestStep || opportunity.latestStep;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Header Row - Always Visible */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    {expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                        <span className="font-medium text-sm">{opportunity.clientName}</span>
                        <span className="text-muted-foreground text-sm ml-2">{opportunity.positionTitle}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Show latest step as primary status - use actual loaded data */}
                    {displayStep ? (
                        <>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STEP_TYPE_CONFIG[displayStep.type]?.color || 'bg-gray-100 text-gray-600'}`}>
                                {STEP_TYPE_CONFIG[displayStep.type]?.label || displayStep.type}
                                {displayStep.round ? ` R${displayStep.round}` : ''}
                            </span>
                            {/* Only show result for interviews */}
                            {displayStep.type === 'CLIENT_INTERVIEW' && (
                                <span className={`px-1.5 py-0.5 rounded text-xs ${RESULT_CONFIG[displayStep.result]?.color || ''}`}>
                                    {displayStep.result}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[opportunity.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                            {opportunity.status}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {formatDate(opportunity.submittedAt)}
                    </span>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <>
                            {/* Attached Assessments */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Link2 className="h-3 w-3" /> Attached Assessments
                                    </span>
                                    {unlinkedAttempts.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); setShowAttachAttempt(true); }}
                                            className="h-6 text-xs"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Attach
                                        </Button>
                                    )}
                                </div>
                                {showAttachAttempt && (
                                    <div className="mb-2 p-2 bg-muted rounded border border-border">
                                        <div className="space-y-1">
                                            {unlinkedAttempts.map(attempt => (
                                                <button
                                                    key={attempt.id}
                                                    onClick={() => handleAttachAttempt(attempt.id)}
                                                    className="w-full text-left p-2 bg-card rounded border border-border hover:bg-muted text-xs"
                                                >
                                                    {attempt.attemptType}
                                                    {attempt.track && <span className="ml-1 px-1 bg-muted rounded">{attempt.track}</span>}
                                                    <span className={`ml-1 px-1 rounded ${RESULT_CONFIG[attempt.result].color}`}>{attempt.result}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setShowAttachAttempt(false)} className="mt-1 h-6 text-xs">
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                                {attemptLinks.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {attemptLinks.map(link => (
                                            <span key={link.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
                                                {link.attempt.attemptType}
                                                {link.attempt.track && <span className="text-muted-foreground">({link.attempt.track})</span>}
                                                <span className={`px-1 rounded ${RESULT_CONFIG[link.attempt.result].color}`}>{link.attempt.result}</span>
                                                <button onClick={() => handleDetachAttempt(link.attempt.id)} className="hover:text-red-500">
                                                    <Unlink className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">None</span>
                                )}
                            </div>

                            {/* Pipeline Steps */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Pipeline Steps
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); setShowAddStep({ parentId: null }); }}
                                        className="h-6 text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Step
                                    </Button>
                                </div>

                                {showAddStep?.parentId === null && (
                                    <AddStepFormInline
                                        onAdd={(type, round) => handleAddStep(null, type, round)}
                                        onCancel={() => setShowAddStep(null)}
                                    />
                                )}

                                {stepTree.length > 0 ? (
                                    <div className="space-y-1">
                                        {stepTree.map(node => (
                                            <StepNodeInline
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
                                    <span className="text-xs text-muted-foreground italic">No steps yet</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact step node for inline display
function StepNodeInline({
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
    const [showResultButtons, setShowResultButtons] = useState(false);
    const config = STEP_TYPE_CONFIG[node.type];
    const resultConfig = RESULT_CONFIG[node.result];

    return (
        <div className="relative">
            {depth > 0 && (
                <div className="absolute left-0 top-0 bottom-0 border-l border-border" style={{ marginLeft: `${depth * 16 - 8}px` }} />
            )}
            <div
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 transition-colors group"
                style={{ marginLeft: `${depth * 16}px` }}
            >
                <span className="text-sm">{config?.icon}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${config?.color}`}>
                    {config?.label || node.type}
                </span>
                {node.round && <span className="text-xs text-muted-foreground">R{node.round}</span>}
                {/* Only interviews have pass/fail results, other steps are final states */}
                {node.type === 'CLIENT_INTERVIEW' && (
                    <span className={`px-1.5 py-0.5 rounded text-xs flex items-center gap-0.5 ${resultConfig.color}`}>
                        {resultConfig.icon} {resultConfig.label}
                    </span>
                )}
                {node.feedback && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1" title={node.feedback}>
                        <MessageSquare className="h-3 w-3" />
                    </span>
                )}
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Only interviews have pass/fail outcome */}
                    {node.type === 'CLIENT_INTERVIEW' && node.result === 'PENDING' && !showResultButtons && (
                        <Button variant="ghost" size="sm" onClick={() => setShowResultButtons(true)} className="h-5 px-1 text-xs">
                            Update
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddChild(node.id)}
                        className="h-5 px-1 text-xs text-muted-foreground"
                    >
                        + Next
                    </Button>
                </div>
            </div>

            {showResultButtons && (
                <div className="flex items-center gap-1 ml-8 mb-1" style={{ marginLeft: `${depth * 16 + 32}px` }}>
                    <Button size="sm" variant="outline" onClick={() => { onUpdateResult(node.id, 'PASS'); setShowResultButtons(false); }} className="h-5 px-2 text-xs text-green-600 border-green-300">
                        <Check className="h-3 w-3 mr-1" /> Pass
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { onUpdateResult(node.id, 'FAIL'); setShowResultButtons(false); }} className="h-5 px-2 text-xs text-red-600 border-red-300">
                        <XCircle className="h-3 w-3 mr-1" /> Fail
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowResultButtons(false)} className="h-5 px-1 text-xs">×</Button>
                </div>
            )}

            {showAddStep?.parentId === node.id && (
                <div style={{ marginLeft: `${(depth + 1) * 16}px` }}>
                    <AddStepFormInline
                        onAdd={(type, round) => onAddStep(node.id, type, round)}
                        onCancel={onCancelAdd}
                    />
                </div>
            )}

            {node.children.length > 0 && node.children.map(child => (
                <StepNodeInline
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
    );
}

// Compact add step form
function AddStepFormInline({
    onAdd,
    onCancel,
}: {
    onAdd: (type: StepType, round?: number) => void;
    onCancel: () => void;
}) {
    const [type, setType] = useState<StepType>('CLIENT_INTERVIEW');
    const [round, setRound] = useState<number | undefined>();

    const stepTypes: StepType[] = ['CLIENT_INTERVIEW', 'OFFER', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'PLACED', 'REJECTED', 'WITHDRAWN'];

    return (
        <div className="flex items-center gap-2 p-2 bg-muted rounded border border-border mb-1">
            <select
                value={type}
                onChange={(e) => setType(e.target.value as StepType)}
                className="px-2 py-1 border border-border rounded text-xs bg-background"
            >
                {stepTypes.map(t => (
                    <option key={t} value={t}>{STEP_TYPE_CONFIG[t]?.icon} {STEP_TYPE_CONFIG[t]?.label}</option>
                ))}
            </select>
            {type === 'CLIENT_INTERVIEW' && (
                <input
                    type="number"
                    value={round || ''}
                    onChange={(e) => setRound(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Round"
                    className="w-16 px-2 py-1 border border-border rounded text-xs bg-background"
                    min={1}
                />
            )}
            <Button size="sm" onClick={() => onAdd(type, round)} className="h-6 px-2 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={onCancel} className="h-6 px-1 text-xs">×</Button>
        </div>
    );
}
