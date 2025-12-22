'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { batchesApi, Batch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Trash2, Edit } from 'lucide-react';

export default function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = () => {
        batchesApi.getAll()
            .then(setBatches)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await batchesApi.update(editingId, formData);
            } else {
                await batchesApi.create(formData);
            }
            setFormData({ name: '', startDate: '', endDate: '' });
            setShowForm(false);
            setEditingId(null);
            loadBatches();
        } catch (error) {
            console.error('Failed to save batch:', error);
        }
    };

    const handleEdit = (batch: Batch) => {
        setFormData({
            name: batch.name,
            startDate: batch.startDate,
            endDate: batch.endDate,
        });
        setEditingId(batch.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this batch?')) return;
        try {
            await batchesApi.delete(id);
            loadBatches();
        } catch (error) {
            console.error('Failed to delete batch:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
                    <p className="text-muted-foreground mt-1">Manage training cohorts</p>
                </div>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', startDate: '', endDate: '' }); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Batch
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Batch' : 'New Batch'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Batch 2024-Q1"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                Cancel
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : batches.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No batches yet. Create your first batch!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {batches.map(batch => (
                        <Card key={batch.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <Link href={`/batches/${batch.id}`} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </Link>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <Link href={`/batches/${batch.id}`} className="block">
                                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">{batch.name}</h3>
                                </Link>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Start: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'}</p>
                                    <p>End: {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
