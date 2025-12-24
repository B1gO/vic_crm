'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mocksApi, mockCriteriaApi } from '@/lib/api';
import type { Mock, MockCriteria } from '@/types';
import { Star, ChevronLeft, Save, Clock, User, ClipboardCheck, Layers, MessageSquare, ListTodo } from 'lucide-react';

const STAGES = [
    { id: 'Screening', label: 'Screening (初筛)', color: 'gray' },
    { id: 'TechMock', label: 'Tech Theory (八股)', color: 'purple' },
    { id: 'RealMock', label: 'Interview Sim (实战)', color: 'blue' },
];

const DECISIONS = ['Strong Hire', 'Hire', 'Weak Hire', 'No Hire'];

export default function MockFeedbackPage() {
    const params = useParams();
    const router = useRouter();
    const mockId = parseInt(params.id as string);

    const [mock, setMock] = useState<Mock | null>(null);
    const [criteria, setCriteria] = useState<MockCriteria[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        role: 'Java',
        stage: 'Screening',
        ratings: {} as Record<number, number>, // criteriaId -> score (1-5)
        strengths: '',
        weaknesses: '',
        actionItems: '',
        summary: '',
        decision: '',
    });

    // Load mock and criteria
    useEffect(() => {
        async function loadData() {
            try {
                const mockData = await mocksApi.getById(mockId);
                setMock(mockData);

                // Pre-fill form with existing data
                const role = mockData.role || 'Java';
                const stage = mockData.stage || 'Screening';
                setFormData(prev => ({
                    ...prev,
                    role,
                    stage,
                    strengths: mockData.strengths || '',
                    weaknesses: mockData.weaknesses || '',
                    actionItems: mockData.actionItems || '',
                    summary: mockData.summary || '',
                    decision: mockData.decision || '',
                }));

                // Load existing ratings
                if (mockData.criteriaRatings) {
                    const existingRatings: Record<number, number> = {};
                    mockData.criteriaRatings.forEach(r => {
                        existingRatings[r.criteria.id] = r.score;
                    });
                    setFormData(prev => ({ ...prev, ratings: existingRatings }));
                }

                // Load criteria for role+stage
                const criteriaData = await mockCriteriaApi.getByRoleAndStage(role, stage);
                setCriteria(criteriaData);
            } catch (error) {
                console.error('Failed to load mock:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [mockId]);

    // Reload criteria when role/stage changes
    useEffect(() => {
        async function loadCriteria() {
            try {
                const criteriaData = await mockCriteriaApi.getByRoleAndStage(formData.role, formData.stage);
                setCriteria(criteriaData);
                // Clear ratings when criteria changes
                setFormData(prev => ({ ...prev, ratings: {} }));
            } catch (error) {
                console.error('Failed to load criteria:', error);
            }
        }
        if (!loading && mock) {
            loadCriteria();
        }
    }, [formData.role, formData.stage, loading, mock]);

    const handleRating = (criteriaId: number, score: number) => {
        setFormData(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [criteriaId]: score }
        }));
    };

    const calculateOverallScore = () => {
        const scores = Object.values(formData.ratings);
        if (scores.length === 0) return 0;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return Math.round((avg / 5) * 100); // Convert 1-5 scale to 0-100
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.decision) {
            alert('Please select a final decision');
            return;
        }

        setSaving(true);
        try {
            await mocksApi.update(mockId, {
                role: formData.role,
                stage: formData.stage,
                score: calculateOverallScore(),
                decision: formData.decision,
                strengths: formData.strengths,
                weaknesses: formData.weaknesses,
                actionItems: formData.actionItems,
                summary: formData.summary,
                completed: true,
            } as Partial<Mock>);

            // TODO: Save individual criteria ratings to backend
            // This would require a separate endpoint for bulk rating save

            router.push(`/candidates/${mock?.candidate?.id}`);
        } catch (error) {
            console.error('Failed to save feedback:', error);
            alert('Failed to save feedback');
        } finally {
            setSaving(false);
        }
    };

    const getDecisionStyle = (d: string, isSelected: boolean) => {
        if (!isSelected) return 'border-border bg-background text-muted-foreground hover:bg-muted';
        switch (d) {
            case 'Strong Hire': return 'bg-green-600 text-white border-green-600 shadow-lg';
            case 'Hire': return 'bg-emerald-500 text-white border-emerald-500 shadow-lg';
            case 'Weak Hire': return 'bg-yellow-500 text-white border-yellow-500 shadow-lg';
            case 'No Hire': return 'bg-red-500 text-white border-red-500 shadow-lg';
            default: return 'border-border bg-muted';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!mock) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Mock not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Candidate
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !formData.decision}
                            className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Complete Feedback'}
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Candidate Profile Section */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Candidate Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                                Candidate Name
                            </label>
                            <div className="px-3 py-2 bg-muted rounded-lg text-foreground font-medium">
                                {mock.candidate?.name || 'Unknown'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                                Evaluator
                            </label>
                            <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                                {mock.evaluator?.name || 'Unknown'} ({mock.evaluator?.role})
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-4">
                        {/* Role Toggle */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                                Role (Tech Stack)
                            </label>
                            <div className="flex p-1 bg-muted rounded-lg">
                                {['Java', 'React'].map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, role }))}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.role === role
                                                ? 'bg-background text-primary shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Scheduled Date */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                                Scheduled At
                            </label>
                            <div className="px-3 py-2 bg-muted rounded-lg text-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {mock.scheduledAt ? new Date(mock.scheduledAt).toLocaleString() : 'Not scheduled'}
                            </div>
                        </div>
                    </div>

                    {/* Stage Selector */}
                    <div className="mt-4">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                            Interview Stage
                        </label>
                        <div className="flex gap-2">
                            {STAGES.map(stage => (
                                <button
                                    key={stage.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, stage: stage.id }))}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-bold transition-all ${formData.stage === stage.id
                                            ? `border-${stage.color}-500 bg-${stage.color}-50 text-${stage.color}-700`
                                            : 'border-border text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {stage.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Criteria Ratings */}
                <section className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-muted/50 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            {STAGES.find(s => s.id === formData.stage)?.label} Criteria
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 bg-background border border-border rounded text-muted-foreground">
                            {criteria.length} items
                        </span>
                    </div>

                    <div className="divide-y divide-border">
                        {criteria.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No criteria configured for {formData.role} - {formData.stage}
                            </div>
                        ) : (
                            criteria.map(item => (
                                <div key={item.id} className="p-6 hover:bg-muted/30 transition-colors">
                                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full self-start md:self-center">
                                            {[1, 2, 3, 4, 5].map(score => (
                                                <button
                                                    key={score}
                                                    type="button"
                                                    onClick={() => handleRating(item.id, score)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${(formData.ratings[item.id] || 0) >= score
                                                            ? 'bg-amber-50 text-amber-500 ring-1 ring-amber-200 shadow-sm scale-110'
                                                            : 'text-muted-foreground hover:bg-muted'
                                                        }`}
                                                >
                                                    <Star className={`h-4 w-4 ${(formData.ratings[item.id] || 0) >= score ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Written Feedback */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-semibold text-green-700 uppercase mb-1 block">
                                Pros / Strengths
                            </label>
                            <textarea
                                value={formData.strengths}
                                onChange={e => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                                placeholder="Key areas where the candidate excelled..."
                                className="w-full min-h-[120px] rounded-lg border border-green-200 bg-green-50/30 p-3 text-sm focus:border-green-500 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-red-700 uppercase mb-1 block">
                                Cons / Weaknesses
                            </label>
                            <textarea
                                value={formData.weaknesses}
                                onChange={e => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
                                placeholder="Areas lacking or red flags observed..."
                                className="w-full min-h-[120px] rounded-lg border border-red-200 bg-red-50/30 p-3 text-sm focus:border-red-500 focus:ring-red-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Action Items (hidden for Screening) */}
                    {formData.stage !== 'Screening' && (
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-indigo-700 uppercase mb-1 flex items-center gap-1">
                                <ListTodo className="h-3 w-3" />
                                Action Items / Focus Areas
                            </label>
                            <textarea
                                value={formData.actionItems}
                                onChange={e => setFormData(prev => ({ ...prev, actionItems: e.target.value }))}
                                placeholder="Specific topics the candidate needs to improve on or verify in next rounds..."
                                className="w-full min-h-[80px] rounded-lg border border-indigo-200 bg-indigo-50/30 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                            Final Summary
                        </label>
                        <textarea
                            value={formData.summary}
                            onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                            placeholder="Overall justification for the hiring decision..."
                            className="w-full min-h-[80px] rounded-lg border border-border p-3 text-sm focus:border-primary focus:ring-primary focus:outline-none"
                        />
                    </div>
                </section>

                {/* Decision */}
                <section className="bg-card rounded-xl border border-border p-6 mb-10">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        Final Recommendation
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {DECISIONS.map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, decision: d }))}
                                className={`py-3 px-2 rounded-lg text-sm font-bold border transition-all ${getDecisionStyle(d, formData.decision === d)}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </section>
            </form>
        </div>
    );
}
