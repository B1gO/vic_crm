'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { candidatesApi, usersApi, batchesApi, Candidate, User, Batch, LifecycleStage, WorkAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StageBadge } from '@/components/ui/badge';
import { Plus, Search, ChevronRight } from 'lucide-react';

const stageLabels: Record<LifecycleStage, string> = {
    RECRUITMENT: 'Recruitment',
    TRAINING: 'Training',
    MARKET_READY: 'Marketing',
    PLACED: 'Placed',
    ELIMINATED: 'Terminated',
};

const workAuthLabels: Record<WorkAuth, string> = {
    CITIZEN: 'Citizen',
    GC: 'GC',
    OPT: 'OPT',
    H1B: 'H1B',
    CPT: 'CPT',
    OTHER: 'Other',
};

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        workAuth: '' as WorkAuth | '',
        recruiterId: '',
        batchId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [candidatesData, usersData, batchesData] = await Promise.all([
                candidatesApi.getAll(),
                usersApi.getAll(),
                batchesApi.getAll()
            ]);
            setCandidates(candidatesData);
            setUsers(usersData);
            setBatches(batchesData);
            // Default recruiter to first user (simulating current user)
            if (usersData.length > 0 && !formData.recruiterId) {
                setFormData(prev => ({ ...prev, recruiterId: String(usersData[0].id) }));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCandidates = () => {
        candidatesApi.getAll()
            .then(setCandidates)
            .catch(console.error);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await candidatesApi.create({
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                city: formData.city || undefined,
                lifecycleStage: 'RECRUITMENT',
                workAuth: formData.workAuth || undefined,
                recruiter: formData.recruiterId ? { id: Number(formData.recruiterId) } as User : undefined,
                batch: formData.batchId ? { id: Number(formData.batchId) } as Batch : undefined
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
                workAuth: '',
                recruiterId: users.length > 0 ? String(users[0].id) : '',
                batchId: ''
            });
            setShowForm(false);
            loadCandidates();
        } catch (error) {
            console.error('Failed to create candidate:', error);
        }
    };

    const filteredCandidates = useMemo(() => {
        if (!search.trim()) return candidates;
        const searchLower = search.toLowerCase();
        return candidates.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.city?.toLowerCase().includes(searchLower)
        );
    }, [candidates, search]);

    // Filter users to only show recruiters (RECRUITER role)
    const recruiters = useMemo(() =>
        users.filter(u => u.role === 'RECRUITER' || u.role === 'ADMIN' || u.role === 'MANAGER'),
        [users]
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">Candidates</h1>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Candidate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="Atlanta, GA"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Visa</label>
                                    <select
                                        value={formData.workAuth}
                                        onChange={e => setFormData({ ...formData, workAuth: e.target.value as WorkAuth })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                    >
                                        <option value="">Select...</option>
                                        <option value="CITIZEN">Citizen</option>
                                        <option value="GC">GC</option>
                                        <option value="OPT">OPT</option>
                                        <option value="H1B">H1B</option>
                                        <option value="CPT">CPT</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Recruiter</label>
                                    <select
                                        value={formData.recruiterId}
                                        onChange={e => setFormData({ ...formData, recruiterId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                    >
                                        <option value="">Select...</option>
                                        {recruiters.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Batch</label>
                                    <select
                                        value={formData.batchId}
                                        onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                    >
                                        <option value="">Select...</option>
                                        {batches.map(batch => (
                                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 flex items-end gap-2">
                                    <Button type="submit">Create</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg">Engineer Pipeline</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {search ? 'No candidates match your search' : 'No candidates yet'}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted/30">
                                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Stage</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Visa</th>
                                    <th className="p-4 w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.map(candidate => (
                                    <tr key={candidate.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <Link href={`/candidates/${candidate.id}`} className="font-medium hover:text-primary transition-colors">
                                                {candidate.name}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <StageBadge stage={candidate.lifecycleStage} />
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {[candidate.city, candidate.state].filter(Boolean).join(', ') || '-'}
                                        </td>
                                        <td className="p-4">
                                            {candidate.workAuth ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-white">
                                                    {workAuthLabels[candidate.workAuth]}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/candidates/${candidate.id}`}>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
