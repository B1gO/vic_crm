'use client';

import { useEffect, useState, useMemo } from 'react';
import { candidatesApi, usersApi, batchesApi, Candidate, User, Batch, WorkAuth } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CandidateTable } from '@/components/CandidateTable';
import { Plus, Search } from 'lucide-react';

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
        state: '',
        workAuth: '' as WorkAuth | '',
        recruiterId: '',
        batchId: '',
        wechatId: '',
        wechatName: '',
        discordName: '',
        linkedinUrl: '',
        marketingLinkedinUrl: '',
        school: '',
        major: '',
        relocation: false,
        notes: ''
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
                state: formData.state || undefined,
                stage: 'SOURCING',
                subStatus: 'SOURCED',
                workAuth: formData.workAuth || undefined,
                recruiter: formData.recruiterId ? { id: Number(formData.recruiterId) } as User : undefined,
                batch: formData.batchId ? { id: Number(formData.batchId) } as Batch : undefined,
                wechatId: formData.wechatId || undefined,
                wechatName: formData.wechatName || undefined,
                discordName: formData.discordName || undefined,
                linkedinUrl: formData.linkedinUrl || undefined,
                marketingLinkedinUrl: formData.marketingLinkedinUrl || undefined,
                school: formData.school || undefined,
                major: formData.major || undefined,
                relocation: formData.relocation,
                notes: formData.notes || undefined
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
                state: '',
                workAuth: '',
                recruiterId: users.length > 0 ? String(users[0].id) : '',
                batchId: '',
                wechatId: '',
                wechatName: '',
                discordName: '',
                linkedinUrl: '',
                marketingLinkedinUrl: '',
                school: '',
                major: '',
                relocation: false,
                notes: ''
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
                                    <label className="text-sm font-medium mb-1 block">Work Auth</label>
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
                                    <label className="text-sm font-medium mb-1 block">WeChat Name</label>
                                    <input
                                        type="text"
                                        value={formData.wechatName}
                                        onChange={e => setFormData({ ...formData, wechatName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="微信名"
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
                                    <label className="text-sm font-medium mb-1 block">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="+1 (123) 456-7890"
                                    />
                                </div>
                            </div>
                            {/* Row 3: LinkedIn & Education */}
                            <div className="grid grid-cols-4 gap-4">
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
                                <div>
                                    <label className="text-sm font-medium mb-1 block">School</label>
                                    <input
                                        type="text"
                                        value={formData.school}
                                        onChange={e => setFormData({ ...formData, school: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="Georgia Tech"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Major</label>
                                    <input
                                        type="text"
                                        value={formData.major}
                                        onChange={e => setFormData({ ...formData, major: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        placeholder="MS Computer Science"
                                    />
                                </div>
                            </div>
                            {/* Row 4: Assignment */}
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
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.relocation}
                                            onChange={e => setFormData({ ...formData, relocation: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm font-medium">Open to Relocation</span>
                                    </label>
                                </div>
                            </div>
                            {/* Row 5: Notes */}
                            <div>
                                <label className="text-sm font-medium mb-1 block">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[80px]"
                                    placeholder="e.g. 实力很强，可以 relocation 但 prefer 湾区"
                                />
                            </div>
                            {/* Row 6: Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button type="submit">Create</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Candidates List */}
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
