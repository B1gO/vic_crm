'use client';

import { useEffect, useState } from 'react';
import { interviewsApi, vendorsApi, clientsApi, candidatesApi, InterviewExperience, Vendor, Client, Candidate } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Trash2, Edit, ExternalLink, Search } from 'lucide-react';

const TECH_CATEGORIES = ['Java', 'React', 'Python', 'AWS', 'SQL', 'System Design', 'Behavioral', 'Other'];

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<InterviewExperience[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        techCategory: 'Java',
        clientId: '',
        vendorId: '',
        candidateId: '',
        techTags: '',
        recordingUrl: '',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [interviewsData, vendorsData, clientsData, candidatesData] = await Promise.all([
                interviewsApi.getAll(),
                vendorsApi.getAll(),
                clientsApi.getAll(),
                candidatesApi.getAll(),
            ]);
            setInterviews(interviewsData);
            setVendors(vendorsData);
            setClients(clientsData);
            setCandidates(candidatesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                techCategory: formData.techCategory,
                client: formData.clientId ? { id: Number(formData.clientId) } : null,
                vendor: formData.vendorId ? { id: Number(formData.vendorId) } : null,
                candidate: formData.candidateId ? { id: Number(formData.candidateId) } : null,
                techTags: formData.techTags,
                recordingUrl: formData.recordingUrl,
                notes: formData.notes,
            };

            if (editingId) {
                await interviewsApi.update(editingId, payload as Partial<InterviewExperience>);
            } else {
                await interviewsApi.create(payload as Partial<InterviewExperience>);
            }
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save interview:', error);
        }
    };

    const resetForm = () => {
        setFormData({ techCategory: 'Java', clientId: '', vendorId: '', candidateId: '', techTags: '', recordingUrl: '', notes: '' });
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (interview: InterviewExperience) => {
        setFormData({
            techCategory: interview.techCategory,
            clientId: interview.client?.id?.toString() || '',
            vendorId: interview.vendor?.id?.toString() || '',
            candidateId: interview.candidate?.id?.toString() || '',
            techTags: interview.techTags || '',
            recordingUrl: interview.recordingUrl || '',
            notes: interview.notes || '',
        });
        setEditingId(interview.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this interview experience?')) return;
        try {
            await interviewsApi.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete interview:', error);
        }
    };

    const filteredInterviews = interviews.filter(interview => {
        const matchesCategory = !selectedCategory || interview.techCategory === selectedCategory;
        const matchesSearch = !searchTerm ||
            interview.techTags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Experiences</h1>
                    <p className="text-muted-foreground mt-1">面经管理 - Manage interview questions and recordings</p>
                </div>
                <Button onClick={() => {
                    if (showForm && !editingId) {
                        setShowForm(false);
                    } else {
                        setFormData({ techCategory: 'Java', clientId: '', vendorId: '', candidateId: '', techTags: '', recordingUrl: '', notes: '' });
                        setEditingId(null);
                        setShowForm(true);
                    }
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Interview
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="flex gap-2">
                    <Button
                        variant={selectedCategory === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('')}
                    >
                        All
                    </Button>
                    {TECH_CATEGORIES.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Interview' : 'New Interview Experience'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Tech Category *</label>
                                    <select
                                        required
                                        value={formData.techCategory}
                                        onChange={e => setFormData({ ...formData, techCategory: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {TECH_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Client</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Vendor</label>
                                    <select
                                        value={formData.vendorId}
                                        onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select...</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Candidate</label>
                                    <select
                                        value={formData.candidateId}
                                        onChange={e => setFormData({ ...formData, candidateId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select...</option>
                                        {candidates.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Tech Tags</label>
                                    <input
                                        type="text"
                                        value={formData.techTags}
                                        onChange={e => setFormData({ ...formData, techTags: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Spring Boot, JPA, Redis..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Recording URL</label>
                                    <input
                                        type="url"
                                        value={formData.recordingUrl}
                                        onChange={e => setFormData({ ...formData, recordingUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Notes / Questions</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    rows={4}
                                    placeholder="Interview questions and experience..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : filteredInterviews.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        {searchTerm || selectedCategory ? 'No interviews match your filter' : 'No interview experiences yet. Add your first one!'}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredInterviews.map(interview => (
                        <Card key={interview.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-purple-500/10">
                                            <BookOpen className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                                                    {interview.techCategory}
                                                </span>
                                                {interview.client && (
                                                    <span className="text-sm text-muted-foreground">
                                                        @ {interview.client.companyName}
                                                    </span>
                                                )}
                                                {interview.vendor && (
                                                    <span className="text-sm text-muted-foreground">
                                                        via {interview.vendor.companyName}
                                                    </span>
                                                )}
                                            </div>
                                            {interview.candidate && (
                                                <p className="text-sm mb-2">
                                                    Interviewed: <span className="font-medium">{interview.candidate.name}</span>
                                                </p>
                                            )}
                                            {interview.techTags && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {interview.techTags.split(',').map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {interview.notes && (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {interview.recordingUrl && (
                                            <a href={interview.recordingUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    Recording
                                                </Button>
                                            </a>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(interview)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(interview.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
