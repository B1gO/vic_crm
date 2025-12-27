'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { vendorsApi, positionsApi, clientsApi, Vendor, VendorContact, VendorEngagementResponse, OpportunityStatus, StepType, StepResult, Position, Client } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Mail, Phone, Building, UserCircle, X, Linkedin, FileText, Users, Briefcase, Clock, CheckCircle, TrendingUp, Plus, MapPin, DollarSign } from 'lucide-react';

export default function VendorDetailPage() {
    const params = useParams();
    const vendorId = Number(params.id);

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [engagements, setEngagements] = useState<VendorEngagementResponse[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [showPositionForm, setShowPositionForm] = useState(false);
    const [positionFormLoading, setPositionFormLoading] = useState(false);
    const [positionFormData, setPositionFormData] = useState({
        title: '',
        clientId: '' as string | number,
        teamName: '',
        hiringManager: '',
        track: '',
        employmentType: 'CONTRACT',
        location: '',
        billRate: '',
        payRate: '',
        headcount: '1',
        status: 'OPEN',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [selectedContactProfile, setSelectedContactProfile] = useState<VendorContact | null>(null);

    useEffect(() => {
        if (vendorId) {
            loadData();
        }
    }, [vendorId]);

    const loadData = async () => {
        try {
            const [vendorData, engagementData, positionData, clientsData] = await Promise.all([
                vendorsApi.getById(vendorId),
                vendorsApi.getEngagements(vendorId),
                positionsApi.getByVendor(vendorId),
                clientsApi.getAll(),
            ]);
            setVendor(vendorData);
            setEngagements(engagementData);
            setPositions(positionData);
            setClients(clientsData);
        } catch (error) {
            console.error('Failed to load vendor:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    if (!vendor) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Vendor not found</p>
                <Link href="/vendors">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Vendors
                    </Button>
                </Link>
            </div>
        );
    }

    const statusLabels: Record<OpportunityStatus, string> = {
        ACTIVE: 'Active',
        INTERVIEWING: 'Interviewing',
        OFFERED: 'Offered',
        PLACED: 'Placed',
    };

    const statusColors: Record<OpportunityStatus, string> = {
        ACTIVE: 'bg-slate-500/10 text-slate-600',
        INTERVIEWING: 'bg-blue-500/10 text-blue-600',
        OFFERED: 'bg-emerald-500/10 text-emerald-600',
        PLACED: 'bg-green-600/10 text-green-700',
    };

    const stepLabels: Record<StepType, string> = {
        OA: 'OA',
        VENDOR_SCREENING: 'Vendor Screening',
        CLIENT_INTERVIEW: 'Client Interview',
        OFFER: 'Offer',
        OFFER_ACCEPTED: 'Offer Accepted',
        OFFER_DECLINED: 'Offer Declined',
        PLACED: 'Placed',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn',
    };

    const resultLabels: Record<StepResult, string> = {
        PENDING: 'Pending',
        PASS: 'Pass',
        FAIL: 'Fail',
    };

    const opportunities = engagements.flatMap(engagement =>
        engagement.opportunities.map(opportunity => ({
            ...opportunity,
            candidate: engagement.candidate,
        }))
    );

    const totalEngagements = engagements.length;
    const totalOpportunities = opportunities.length;
    const totalPositions = positions.length;
    const inProgressCount = opportunities.filter(opportunity =>
        opportunity.status === 'ACTIVE' || opportunity.status === 'INTERVIEWING'
    ).length;
    const offeredCount = opportunities.filter(opportunity => opportunity.status === 'OFFERED').length;
    const placedCount = opportunities.filter(opportunity => opportunity.status === 'PLACED').length;

    const sortedOpportunities = [...opportunities].sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
    });

    const resetPositionForm = () => {
        setPositionFormData({
            title: '',
            clientId: '',
            teamName: '',
            hiringManager: '',
            track: '',
            employmentType: 'CONTRACT',
            location: '',
            billRate: '',
            payRate: '',
            headcount: '1',
            status: 'OPEN',
            description: '',
        });
        setShowPositionForm(false);
    };

    const handleCreatePosition = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!positionFormData.title || !positionFormData.clientId) return;
        setPositionFormLoading(true);
        try {
            const payload: Record<string, unknown> = {
                title: positionFormData.title,
                client: { id: Number(positionFormData.clientId) },
                sourceVendor: { id: vendorId },
                status: positionFormData.status,
            };
            if (positionFormData.teamName) payload.teamName = positionFormData.teamName;
            if (positionFormData.hiringManager) payload.hiringManager = positionFormData.hiringManager;
            if (positionFormData.track) payload.track = positionFormData.track;
            if (positionFormData.employmentType) payload.employmentType = positionFormData.employmentType;
            if (positionFormData.location) payload.location = positionFormData.location;
            if (positionFormData.billRate) payload.billRate = Number(positionFormData.billRate);
            if (positionFormData.payRate) payload.payRate = Number(positionFormData.payRate);
            if (positionFormData.headcount) payload.headcount = Number(positionFormData.headcount);
            if (positionFormData.description) payload.description = positionFormData.description;

            await positionsApi.create(payload as Partial<Position>);
            resetPositionForm();
            const updatedPositions = await positionsApi.getByVendor(vendorId);
            setPositions(updatedPositions);
        } catch (error) {
            console.error('Failed to create position:', error);
        } finally {
            setPositionFormLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Contact Profile Modal */}
            {selectedContactProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedContactProfile(null)}>
                    <Card className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-purple-500/10">
                                    <UserCircle className="w-8 h-8 text-purple-500" />
                                </div>
                                <CardTitle>{selectedContactProfile.name}</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedContactProfile(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedContactProfile.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <a href={`mailto:${selectedContactProfile.email}`} className="text-sm hover:text-primary">
                                        {selectedContactProfile.email}
                                    </a>
                                </div>
                            )}
                            {selectedContactProfile.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{selectedContactProfile.phone}</span>
                                </div>
                            )}
                            {selectedContactProfile.linkedinUrl && (
                                <div className="flex items-center gap-3">
                                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                                    <a href={selectedContactProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary truncate">
                                        {selectedContactProfile.linkedinUrl}
                                    </a>
                                </div>
                            )}
                            {selectedContactProfile.notes && (
                                <div className="pt-3 border-t border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Notes</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{selectedContactProfile.notes}</p>
                                </div>
                            )}
                            {!selectedContactProfile.email && !selectedContactProfile.phone && !selectedContactProfile.linkedinUrl && !selectedContactProfile.notes && (
                                <p className="text-sm text-muted-foreground text-center py-4">No additional details available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/vendors">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{vendor.companyName}</h1>
                        {vendor.contactName && (
                            <p className="text-muted-foreground">{vendor.contactName}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Contact Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {vendor.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${vendor.email}`} className="text-sm hover:text-primary">{vendor.email}</a>
                            </div>
                        )}
                        {vendor.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{vendor.phone}</span>
                            </div>
                        )}
                        {vendor.contacts && vendor.contacts.length > 0 && (
                            <div className="pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                    <UserCircle className="w-3 h-3" />
                                    Contacts (click to view)
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {vendor.contacts.map((contact, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedContactProfile(contact)}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors cursor-pointer"
                                        >
                                            {contact.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {vendor.clients && vendor.clients.length > 0 && (
                            <div className="pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                    <Building className="w-3 h-3" />
                                    Associated Clients
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {vendor.clients.map(client => (
                                        <span key={client.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600">
                                            {client.companyName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Engagement Summary */}
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalEngagements}</p>
                                <p className="text-xs text-muted-foreground">Engagements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-500/10">
                                <Briefcase className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalOpportunities}</p>
                                <p className="text-xs text-muted-foreground">Opportunities</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalPositions}</p>
                                <p className="text-xs text-muted-foreground">Positions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{inProgressCount}</p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{offeredCount}</p>
                                <p className="text-xs text-muted-foreground">Offered</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{placedCount}</p>
                                <p className="text-xs text-muted-foreground">Placed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Positions Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Positions from this Vendor
                        <span className="text-sm font-normal text-muted-foreground">({positions.length})</span>
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowPositionForm(!showPositionForm)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Position
                    </Button>
                </CardHeader>
                <CardContent>
                    {showPositionForm && (
                        <form onSubmit={handleCreatePosition} className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={positionFormData.title}
                                        onChange={e => setPositionFormData({ ...positionFormData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="Senior Java Developer"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Client *</label>
                                    <select
                                        required
                                        value={positionFormData.clientId}
                                        onChange={e => setPositionFormData({ ...positionFormData, clientId: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                    >
                                        <option value="">Select client...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Track</label>
                                    <select
                                        value={positionFormData.track}
                                        onChange={e => setPositionFormData({ ...positionFormData, track: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                    >
                                        <option value="">Select...</option>
                                        <option value="backend">Backend</option>
                                        <option value="fullstack">Fullstack</option>
                                        <option value="frontend">Frontend</option>
                                        <option value="qa">QA</option>
                                        <option value="devops">DevOps</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Employment Type</label>
                                    <select
                                        value={positionFormData.employmentType}
                                        onChange={e => setPositionFormData({ ...positionFormData, employmentType: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                    >
                                        <option value="CONTRACT">Contract</option>
                                        <option value="FULLTIME">Full-time</option>
                                        <option value="C2H">Contract-to-Hire</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Team Name</label>
                                    <input
                                        type="text"
                                        value={positionFormData.teamName}
                                        onChange={e => setPositionFormData({ ...positionFormData, teamName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="Cloud Platform"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Hiring Manager</label>
                                    <input
                                        type="text"
                                        value={positionFormData.hiringManager}
                                        onChange={e => setPositionFormData({ ...positionFormData, hiringManager: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="John Smith"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Location</label>
                                    <input
                                        type="text"
                                        value={positionFormData.location}
                                        onChange={e => setPositionFormData({ ...positionFormData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="Remote / San Jose, CA"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Bill Rate</label>
                                    <input
                                        type="number"
                                        value={positionFormData.billRate}
                                        onChange={e => setPositionFormData({ ...positionFormData, billRate: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="80"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Pay Rate</label>
                                    <input
                                        type="number"
                                        value={positionFormData.payRate}
                                        onChange={e => setPositionFormData({ ...positionFormData, payRate: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="65"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Headcount</label>
                                    <input
                                        type="number"
                                        value={positionFormData.headcount}
                                        onChange={e => setPositionFormData({ ...positionFormData, headcount: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Status</label>
                                    <select
                                        value={positionFormData.status}
                                        onChange={e => setPositionFormData({ ...positionFormData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="CLOSED">Closed</option>
                                        <option value="FILLED">Filled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea
                                    value={positionFormData.description}
                                    onChange={e => setPositionFormData({ ...positionFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                    rows={2}
                                    placeholder="Job description and requirements..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" disabled={positionFormLoading}>
                                    {positionFormLoading ? 'Creating...' : 'Create Position'}
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={resetPositionForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {positions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No positions from this vendor yet</p>
                    ) : (
                        <div className="space-y-3">
                            {positions.map(position => (
                                <div key={position.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Briefcase className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{position.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Building className="w-3 h-3" />
                                                    {position.client?.companyName}
                                                </span>
                                                {position.teamName && <span>• {position.teamName}</span>}
                                                {position.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {position.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {position.track && (
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${position.track === 'backend' ? 'bg-blue-500/10 text-blue-600' :
                                                position.track === 'fullstack' ? 'bg-purple-500/10 text-purple-600' :
                                                    position.track === 'frontend' ? 'bg-green-500/10 text-green-600' :
                                                        position.track === 'qa' ? 'bg-orange-500/10 text-orange-600' :
                                                            position.track === 'devops' ? 'bg-cyan-500/10 text-cyan-600' :
                                                                'bg-gray-500/10 text-gray-600'
                                                }`}>
                                                {position.track}
                                            </span>
                                        )}
                                        {(position.billRate || position.payRate) && (
                                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <DollarSign className="w-3 h-3" />
                                                {position.billRate && <span>Bill: ${position.billRate}</span>}
                                                {position.payRate && <span>Pay: ${position.payRate}</span>}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${position.status === 'OPEN' ? 'bg-green-500/10 text-green-600' :
                                            position.status === 'ON_HOLD' ? 'bg-yellow-500/10 text-yellow-600' :
                                                position.status === 'FILLED' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    'bg-gray-500/10 text-gray-600'
                                            }`}>
                                            {position.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
                <CardHeader>
                    <CardTitle>Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedOpportunities.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No opportunities yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Position</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Latest Step</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedOpportunities.map(opportunity => (
                                        <tr key={opportunity.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/candidates/${opportunity.candidate.id}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {opportunity.candidate.name}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {opportunity.clientName}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {opportunity.positionTitle}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[opportunity.status]}`}>
                                                    {statusLabels[opportunity.status]}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {opportunity.latestStep
                                                    ? `${stepLabels[opportunity.latestStep.type]} · ${resultLabels[opportunity.latestStep.result]}`
                                                    : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {opportunity.submittedAt ? new Date(opportunity.submittedAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
