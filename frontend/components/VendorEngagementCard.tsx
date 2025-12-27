'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown, ChevronUp, Plus, Check, XCircle } from 'lucide-react';
import type {
    CandidateEngagementResponse,
    AssessmentAttemptSummary,
    OpportunitySummary,
    Position,
    AssessmentType,
    StepState,
    StepResult,
} from '@/types';
import { vendorEngagementsApi, positionsApi, assessmentAttemptsApi } from '@/lib/api';
import { ExpandableOpportunityRow } from './ExpandableOpportunityRow';

// Track badge colors
const TRACK_COLORS: Record<string, string> = {
    backend: 'bg-blue-100 text-blue-700',
    fullstack: 'bg-purple-100 text-purple-700',
    frontend: 'bg-green-100 text-green-700',
    qa: 'bg-orange-100 text-orange-700',
    devops: 'bg-cyan-100 text-cyan-700',
    unknown: 'bg-gray-100 text-gray-600',
};

// Result colors
const RESULT_COLORS: Record<StepResult, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PASS: 'bg-green-100 text-green-700',
    FAIL: 'bg-red-100 text-red-700',
};

// State colors
const STATE_COLORS: Record<StepState, string> = {
    PLANNED: 'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
};

// Assessment type labels
const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
    OA: 'OA',
    VENDOR_SCREENING: 'Screening',
};

interface VendorEngagementCardProps {
    engagement: CandidateEngagementResponse;
    onUpdate?: () => void;
    onOpenOpportunity?: (opportunityId: number) => void;
}

export function VendorEngagementCard({
    engagement,
    onUpdate,
    onOpenOpportunity,
}: VendorEngagementCardProps) {
    const [expanded, setExpanded] = useState(true);
    const [showAddAttempt, setShowAddAttempt] = useState(false);
    const [showAddOpportunity, setShowAddOpportunity] = useState(false);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Attempt Form State
    const [attemptType, setAttemptType] = useState<AssessmentType>('OA');
    const [track, setTrack] = useState('');

    // Add Opportunity Form State
    const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
    const [selectedAttemptIds, setSelectedAttemptIds] = useState<number[]>([]);
    const [vendorPositions, setVendorPositions] = useState<Position[]>([]);

    const loadPositions = async () => {
        try {
            // Only load positions from this vendor
            const vendorPos = await positionsApi.getByVendor(engagement.vendor.id);
            setVendorPositions(vendorPos);
            setPositions(vendorPos);
        } catch (error) {
            console.error('Failed to load positions:', error);
        }
    };

    const handleAddAttemptClick = () => {
        setShowAddAttempt(true);
    };

    const handleAddOpportunityClick = async () => {
        await loadPositions();
        setShowAddOpportunity(true);
    };

    const handleCreateAttempt = async () => {
        if (!attemptType) return;
        setLoading(true);
        try {
            await vendorEngagementsApi.createAttempt(engagement.id, {
                attemptType,
                track: track || undefined,
                state: 'PLANNED',
            });
            setShowAddAttempt(false);
            setAttemptType('OA');
            setTrack('');
            onUpdate?.();
        } catch (error) {
            console.error('Failed to create attempt:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOpportunity = async () => {
        if (!selectedPositionId) return;
        setLoading(true);
        try {
            await vendorEngagementsApi.createOpportunity(engagement.id, {
                positionId: selectedPositionId,
                attachAttemptIds: selectedAttemptIds.length > 0 ? selectedAttemptIds : undefined,
            });
            setShowAddOpportunity(false);
            setSelectedPositionId(null);
            setSelectedAttemptIds([]);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to create opportunity:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttemptSelection = (attemptId: number) => {
        setSelectedAttemptIds(prev =>
            prev.includes(attemptId)
                ? prev.filter(id => id !== attemptId)
                : [...prev, attemptId]
        );
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    const getTrackColor = (trackName: string | null) => {
        if (!trackName) return TRACK_COLORS.unknown;
        return TRACK_COLORS[trackName.toLowerCase()] || TRACK_COLORS.unknown;
    };

    return (
        <Card className="mb-4 overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader
                className="cursor-pointer bg-muted/50 py-3 px-4"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-lg shadow-sm border border-border">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                {engagement.vendor.companyName}
                            </CardTitle>
                            {engagement.vendor.contactName && (
                                <p className="text-sm text-muted-foreground">
                                    {engagement.vendor.contactName}
                                    {engagement.vendor.email && ` • ${engagement.vendor.email}`}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${engagement.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {engagement.status}
                        </span>
                        {expanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="p-4 space-y-6">
                    {/* Vendor Assessments Panel */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">
                                Assessments
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({engagement.attempts.length})
                                </span>
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddAttemptClick}
                                className="gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>

                        {showAddAttempt && (
                            <div className="mb-3 p-3 bg-muted rounded-lg border border-border">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={attemptType}
                                            onChange={(e) => setAttemptType(e.target.value as AssessmentType)}
                                            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                                        >
                                            <option value="OA">OA</option>
                                            <option value="VENDOR_SCREENING">Vendor Screening</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Track
                                        </label>
                                        <input
                                            type="text"
                                            value={track}
                                            onChange={(e) => setTrack(e.target.value)}
                                            placeholder="backend, fullstack..."
                                            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleCreateAttempt}
                                        disabled={loading}
                                    >
                                        Create
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddAttempt(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {engagement.attempts.length > 0 ? (
                            <div className="space-y-2">
                                {engagement.attempts.map((attempt) => (
                                    <AttemptRow key={attempt.id} attempt={attempt} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No assessments yet</p>
                        )}
                    </div>

                    {/* Opportunities Panel */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">
                                Opportunities
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({engagement.opportunities.length})
                                </span>
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddOpportunityClick}
                                className="gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Submit
                            </Button>
                        </div>

                        {showAddOpportunity && (
                            <div className="mb-3 p-3 bg-muted rounded-lg border border-border">
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">
                                        Position *
                                    </label>
                                    <select
                                        value={selectedPositionId || ''}
                                        onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value="">Select position...</option>
                                        {vendorPositions.length > 0 ? (
                                            vendorPositions.map((pos) => (
                                                <option key={pos.id} value={pos.id}>
                                                    {pos.client?.companyName} - {pos.title} {pos.track ? `(${pos.track})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No positions from this vendor</option>
                                        )}
                                    </select>
                                </div>

                                {engagement.attempts.length > 0 && (
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Attach Assessments (optional)
                                        </label>
                                        <div className="space-y-1">
                                            {engagement.attempts.map((attempt) => (
                                                <label
                                                    key={attempt.id}
                                                    className="flex items-center gap-2 p-2 bg-background rounded border border-border cursor-pointer hover:bg-muted"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAttemptIds.includes(attempt.id)}
                                                        onChange={() => toggleAttemptSelection(attempt.id)}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">
                                                        {ASSESSMENT_TYPE_LABELS[attempt.attemptType]}
                                                        {attempt.track && (
                                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${getTrackColor(attempt.track)}`}>
                                                                {attempt.track}
                                                            </span>
                                                        )}
                                                        <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${RESULT_COLORS[attempt.result]}`}>
                                                            {attempt.result}
                                                        </span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleCreateOpportunity}
                                        disabled={loading || !selectedPositionId}
                                    >
                                        Create Opportunity
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddOpportunity(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {engagement.opportunities.length > 0 ? (
                            <div className="space-y-3">
                                {engagement.opportunities.map((opp) => {
                                    // Smart default: only expand if actively interviewing
                                    // Terminal states (PLACED) or stale data should default to collapsed
                                    // - INTERVIEWING: actively in process, expand
                                    // - OFFERED: pending decision, expand
                                    // - ACTIVE: just submitted, no interviews yet, expand
                                    // - PLACED: terminal, collapse
                                    // Note: We can't reliably detect FAIL/REJECTED from stale latestStep
                                    // so we use status-based logic for the default
                                    const shouldExpand =
                                        opp.status === 'INTERVIEWING' ||
                                        opp.status === 'OFFERED';
                                    return (
                                        <ExpandableOpportunityRow
                                            key={opp.id}
                                            opportunity={opp}
                                            vendorEngagementId={engagement.id}
                                            defaultExpanded={shouldExpand}
                                            onUpdate={onUpdate}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No opportunities yet</p>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );

    function AttemptRow({ attempt }: { attempt: AssessmentAttemptSummary }) {
        const [showUpdateForm, setShowUpdateForm] = useState(false);
        const [updating, setUpdating] = useState(false);

        const handleUpdate = async (result: StepResult) => {
            setUpdating(true);
            try {
                await assessmentAttemptsApi.update(attempt.id, {
                    result,
                    state: 'COMPLETED',
                    happenedAt: new Date().toISOString().slice(0, 19), // Remove 'Z' for LocalDateTime
                });
                setShowUpdateForm(false);
                onUpdate?.();
            } catch (error) {
                console.error('Failed to update attempt:', error);
            } finally {
                setUpdating(false);
            }
        };

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                            {ASSESSMENT_TYPE_LABELS[attempt.attemptType]}
                        </span>
                        {attempt.track && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTrackColor(attempt.track)}`}>
                                {attempt.track}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATE_COLORS[attempt.state]}`}>
                            {attempt.state}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${RESULT_COLORS[attempt.result]}`}>
                            {attempt.result}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDate(attempt.happenedAt)}
                        </span>
                        {attempt.result === 'PENDING' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowUpdateForm(!showUpdateForm)}
                                className="text-xs h-6 px-2"
                            >
                                Update
                            </Button>
                        )}
                    </div>
                </div>
                {showUpdateForm && (
                    <div className="ml-4 p-2 bg-muted rounded-lg border border-border flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdate('PASS')}
                            disabled={updating}
                            className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                        >
                            <Check className="h-4 w-4" />
                            Pass
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdate('FAIL')}
                            disabled={updating}
                            className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                            <XCircle className="h-4 w-4" />
                            Fail
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowUpdateForm(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    function OpportunityRow({
        opportunity,
        onClick,
    }: {
        opportunity: OpportunitySummary;
        onClick: () => void;
    }) {
        const STATUS_COLORS: Record<string, string> = {
            ACTIVE: 'bg-blue-100 text-blue-700',
            INTERVIEWING: 'bg-purple-100 text-purple-700',
            OFFERED: 'bg-amber-100 text-amber-700',
            PLACED: 'bg-green-100 text-green-700',
        };

        return (
            <div
                onClick={onClick}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted hover:border-muted-foreground/30 transition-colors"
            >
                <div>
                    <div className="font-medium text-sm">
                        {opportunity.clientName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {opportunity.positionTitle}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[opportunity.status] || 'bg-gray-100 text-gray-600'}`}>
                        {opportunity.status}
                    </span>
                    {opportunity.latestStep && (
                        <span className="text-xs text-muted-foreground">
                            {opportunity.latestStep.type}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {formatDate(opportunity.submittedAt)}
                    </span>
                </div>
            </div>
        );
    }
}
