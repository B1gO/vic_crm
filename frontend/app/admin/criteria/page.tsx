'use client';

import { useEffect, useState } from 'react';
import { mockCriteriaApi } from '@/lib/api';
import type { MockCriteria } from '@/types';
import { Plus, Pencil, Trash2, Save, X, Settings, Filter } from 'lucide-react';

const ROLES = ['Java', 'React'];
const STAGES = [
    { id: 'Screening', label: 'Screening (初筛)' },
    { id: 'TechMock', label: 'Tech Theory (八股)' },
    { id: 'RealMock', label: 'Interview Sim (实战)' },
];

export default function AdminCriteriaPage() {
    const [criteria, setCriteria] = useState<MockCriteria[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStage, setFilterStage] = useState<string>('all');

    // Edit/Create state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        role: 'Java',
        stage: 'Screening',
        name: '',
        description: '',
        displayOrder: 1,
        active: true,
    });

    useEffect(() => {
        loadCriteria();
    }, []);

    async function loadCriteria() {
        try {
            const data = await mockCriteriaApi.getAll();
            setCriteria(data);
        } catch (error) {
            console.error('Failed to load criteria:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredCriteria = criteria.filter(c => {
        if (filterRole !== 'all' && c.role !== filterRole) return false;
        if (filterStage !== 'all' && c.stage !== filterStage) return false;
        return true;
    });

    const groupedCriteria = filteredCriteria.reduce((acc, c) => {
        const key = `${c.role}-${c.stage}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {} as Record<string, MockCriteria[]>);

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }
        try {
            await mockCriteriaApi.create(formData);
            setShowCreateForm(false);
            setFormData({ role: 'Java', stage: 'Screening', name: '', description: '', displayOrder: 1, active: true });
            loadCriteria();
        } catch (error) {
            console.error('Failed to create criteria:', error);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await mockCriteriaApi.update(id, formData);
            setEditingId(null);
            loadCriteria();
        } catch (error) {
            console.error('Failed to update criteria:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this criteria?')) return;
        try {
            await mockCriteriaApi.delete(id);
            loadCriteria();
        } catch (error) {
            console.error('Failed to delete criteria:', error);
        }
    };

    const startEdit = (c: MockCriteria) => {
        setEditingId(c.id);
        setFormData({
            role: c.role,
            stage: c.stage,
            name: c.name,
            description: c.description || '',
            displayOrder: c.displayOrder,
            active: c.active,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">Mock Interview Criteria</h1>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Criteria
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                    </div>
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm"
                    >
                        <option value="all">All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select
                        value={filterStage}
                        onChange={e => setFilterStage(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm"
                    >
                        <option value="all">All Stages</option>
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </div>

                {/* Create Form Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg">
                            <h2 className="text-lg font-bold mb-4">Add New Criteria</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Stage</label>
                                        <select
                                            value={formData.stage}
                                            onChange={e => setFormData({ ...formData, stage: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        >
                                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="e.g. JVM Internals"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        rows={2}
                                        placeholder="What should be evaluated for this criteria..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Display Order</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.displayOrder}
                                            onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm font-medium">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Create
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 border border-border rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Criteria Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Stage</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCriteria.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No criteria found. Create one to get started!
                                    </td>
                                </tr>
                            ) : (
                                filteredCriteria.map(c => (
                                    <tr key={c.id} className="hover:bg-muted/30">
                                        {editingId === c.id ? (
                                            <>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={formData.role}
                                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                        className="px-2 py-1 border border-border rounded bg-background text-sm"
                                                    >
                                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={formData.stage}
                                                        onChange={e => setFormData({ ...formData, stage: e.target.value })}
                                                        className="px-2 py-1 border border-border rounded bg-background text-sm"
                                                    >
                                                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={formData.displayOrder}
                                                        onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                                                        className="w-12 px-2 py-1 border border-border rounded bg-background text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-2 py-1 border border-border rounded bg-background text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={formData.description}
                                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full px-2 py-1 border border-border rounded bg-background text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <label className="flex items-center gap-1 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.active}
                                                            onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                                            className="w-4 h-4 rounded"
                                                        />
                                                    </label>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <button
                                                            onClick={() => handleUpdate(c.id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 text-muted-foreground hover:bg-muted rounded"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.role === 'Java' ? 'bg-orange-50 text-orange-700' : 'bg-cyan-50 text-cyan-700'
                                                        }`}>
                                                        {c.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.stage === 'Screening' ? 'bg-gray-100 text-gray-700' :
                                                            c.stage === 'TechMock' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {c.stage}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">{c.displayOrder}</td>
                                                <td className="px-4 py-3 font-medium">{c.name}</td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{c.description}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                        {c.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <button
                                                            onClick={() => startEdit(c)}
                                                            className="p-1.5 text-muted-foreground hover:bg-muted rounded"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(c.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredCriteria.length} of {criteria.length} criteria
                </div>
            </div>
        </div>
    );
}
