'use client';

import { useEffect, useState, useMemo } from 'react';
import { candidatesApi, usersApi, batchesApi, Candidate, User, Batch, LifecycleStage, WorkAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CandidateTable } from '@/components/CandidateTable';
import { Plus, Search } from 'lucide-react';

const stageLabels: Record<LifecycleStage, string> = {
    RECRUITMENT: 'Recruitment',
    TRAINING: 'Training',
    MARKET_READY: 'Marketing',
    PLACED: 'Placed',
    ELIMINATED: 'Terminated',
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
        batchId: '',
        wechatId: '',
        discordName: '',
        linkedinUrl: '',
        marketingLinkedinUrl: '',
        education: ''
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
                batch: formData.batchId ? { id: Number(formData.batchId) } as Batch : undefined,
                wechatId: formData.wechatId || undefined,
                discordName: formData.discordName || undefined,
                linkedinUrl: formData.linkedinUrl || undefined,
                marketingLinkedinUrl: formData.marketingLinkedinUrl || undefined,
                education: formData.education || undefined
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
                workAuth: '',
                recruiterId: users.length > 0 ? String(users[0].id) : '',
                batchId: '',
                wechatId: '',
                discordName: '',
                linkedinUrl: '',
                marketingLinkedinUrl: '',
                education: ''
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
                            {/* Row 1: Basic Info */}
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
                            {/* Row 2: Social & Contact */}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">WeChat ID</label>
                                    <input
                                        type="text"
                                        value={formData.wechatId}
                                        onChange={e => setFormData({ ...formData, wechatId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="wechat_id"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Discord</label>
                                    <input
                                        type="text"
                                        value={formData.discordName}
                                        onChange={e => setFormData({ ...formData, discordName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="user#1234"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={formData.linkedinUrl}
                                        onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Marketing LinkedIn</label>
                                    <input
                                        type="url"
                                        value={formData.marketingLinkedinUrl}
                                        onChange={e => setFormData({ ...formData, marketingLinkedinUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                            {/* Row 3: Education & Assignment */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Education</label>
                                    <input
                                        type="text"
                                        value={formData.education}
                                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="MS Computer Science - Georgia Tech"
                                    />
                                </div>
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
                            </div>
                            {/* Row 4: Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button type="submit">Create</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
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
                    ) : (
                        <CandidateTable
                            candidates={filteredCandidates}
                            emptyMessage={search ? 'No candidates match your search' : 'No candidates yet'}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
