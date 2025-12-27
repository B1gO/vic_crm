'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { vendorsApi, submissionsApi, Vendor, Submission, VendorContact } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Mail, Phone, Users, TrendingUp, CheckCircle, XCircle, Clock, Building, UserCircle, X, Linkedin, FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
    VENDOR_SCREENING: 'bg-yellow-500/10 text-yellow-600',
    CLIENT_ROUND: 'bg-blue-500/10 text-blue-600',
    OFFERED: 'bg-green-500/10 text-green-600',
    PLACED: 'bg-emerald-500/10 text-emerald-600',
    REJECTED: 'bg-red-500/10 text-red-600',
};

const statusLabels: Record<string, string> = {
    VENDOR_SCREENING: 'Vendor Screening',
    CLIENT_ROUND: 'Client Round',
    OFFERED: 'Offered',
    PLACED: 'Placed',
    REJECTED: 'Rejected',
};

interface ContactStats {
    contact: string;
    total: number;
    placed: number;
    offered: number;
    rejected: number;
    inProgress: number;
    successRate: number;
}

interface ClientStats {
    client: string;
    total: number;
    placed: number;
    offered: number;
    rejected: number;
    inProgress: number;
    successRate: number;
}

export default function VendorDetailPage() {
    const params = useParams();
    const vendorId = Number(params.id);

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContactProfile, setSelectedContactProfile] = useState<VendorContact | null>(null);

    useEffect(() => {
        if (vendorId) {
            loadData();
        }
    }, [vendorId]);

    const loadData = async () => {
        try {
            const [vendorData, submissionsData] = await Promise.all([
                vendorsApi.getById(vendorId),
                submissionsApi.getByVendor(vendorId)
            ]);
            setVendor(vendorData);
            setSubmissions(submissionsData);
        } catch (error) {
            console.error('Failed to load vendor:', error);
        } finally {
            setLoading(false);
        }
    };

    const openContactProfile = (contactName: string) => {
        const contact = vendor?.contacts?.find(c => c.name === contactName);
        if (contact) {
            setSelectedContactProfile(contact);
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

    // Calculate overall metrics
    const totalSubmissions = submissions.length;
    const placedCount = submissions.filter(s => s.status === 'PLACED').length;
    const offeredCount = submissions.filter(s => s.status === 'OFFERED').length;
    const rejectedCount = submissions.filter(s => s.status === 'REJECTED').length;
    const inProgressCount = submissions.filter(s => ['VENDOR_SCREENING', 'CLIENT_ROUND'].includes(s.status)).length;
    const successRate = totalSubmissions > 0 ? Math.round(((placedCount + offeredCount) / totalSubmissions) * 100) : 0;

    // Calculate per-contact stats
    const contactStatsMap = new Map<string, ContactStats>();
    submissions.forEach(sub => {
        if (sub.vendorContact) {
            const contact = sub.vendorContact;
            if (!contactStatsMap.has(contact)) {
                contactStatsMap.set(contact, {
                    contact,
                    total: 0,
                    placed: 0,
                    offered: 0,
                    rejected: 0,
                    inProgress: 0,
                    successRate: 0
                });
            }
            const stats = contactStatsMap.get(contact)!;
            stats.total++;
            if (sub.status === 'PLACED') stats.placed++;
            if (sub.status === 'OFFERED') stats.offered++;
            if (sub.status === 'REJECTED') stats.rejected++;
            if (['VENDOR_SCREENING', 'CLIENT_ROUND'].includes(sub.status)) stats.inProgress++;
        }
    });
    contactStatsMap.forEach(stats => {
        stats.successRate = stats.total > 0 ? Math.round(((stats.placed + stats.offered) / stats.total) * 100) : 0;
    });
    const contactStats = Array.from(contactStatsMap.values()).sort((a, b) => b.total - a.total);

    // Calculate per-client stats based on vendor's associated clients
    const clientStats: ClientStats[] = (vendor?.clients || []).map(client => ({
        client: client.companyName,
        total: 0,
        placed: 0,
        offered: 0,
        rejected: 0,
        inProgress: 0,
        successRate: 0
    }));

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

            {/* Contact Info & Total Stats */}
            <div className="grid gap-4 md:grid-cols-4">
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

                {/* Total Stats Cards */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalSubmissions}</p>
                                <p className="text-xs text-muted-foreground">Total Submissions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{placedCount}</p>
                                <p className="text-xs text-muted-foreground">Placed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{successRate}%</p>
                                <p className="text-xs text-muted-foreground">Success Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown - Total */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="text-xl font-bold">{inProgressCount}</p>
                            <p className="text-xs text-muted-foreground">In Progress</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-xl font-bold">{offeredCount}</p>
                            <p className="text-xs text-muted-foreground">Offered</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-xl font-bold">{placedCount}</p>
                            <p className="text-xs text-muted-foreground">Placed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-xl font-bold">{rejectedCount}</p>
                            <p className="text-xs text-muted-foreground">Rejected</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown by Contact */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5" />
                        Breakdown by Contact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {contactStats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No contact data available</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">In Progress</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Offered</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Placed</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Rejected</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactStats.map(stats => (
                                        <tr key={stats.contact} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => openContactProfile(stats.contact)}
                                                    className="flex items-center gap-2 hover:text-primary transition-colors"
                                                >
                                                    <UserCircle className="w-4 h-4 text-purple-500" />
                                                    <span className="font-medium">{stats.contact}</span>
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold">{stats.total}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-600">
                                                    {stats.inProgress}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-600">
                                                    {stats.offered}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600">
                                                    {stats.placed}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-600">
                                                    {stats.rejected}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`font-semibold ${stats.successRate >= 50 ? 'text-emerald-600' : stats.successRate >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {stats.successRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Breakdown by Client */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Breakdown by Client
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {clientStats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No client data available</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">In Progress</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Offered</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Placed</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Rejected</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientStats.map(stats => (
                                        <tr key={stats.client} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">{stats.client}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold">{stats.total}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-600">
                                                    {stats.inProgress}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-600">
                                                    {stats.offered}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600">
                                                    {stats.placed}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-600">
                                                    {stats.rejected}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`font-semibold ${stats.successRate >= 50 ? 'text-emerald-600' : stats.successRate >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {stats.successRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submissions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Submission History</CardTitle>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No submissions yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                <Link href={`/candidates/${sub.candidate.id}`} className="font-medium hover:text-primary">
                                                    {sub.candidate.name}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {sub.vendorContact ? (
                                                    <button
                                                        onClick={() => openContactProfile(sub.vendorContact!)}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors"
                                                    >
                                                        <UserCircle className="w-3 h-3" />
                                                        {sub.vendorContact}
                                                    </button>
                                                ) : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[sub.status] || 'bg-muted'}`}>
                                                    {statusLabels[sub.status] || sub.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(sub.submittedAt).toLocaleDateString()}
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
