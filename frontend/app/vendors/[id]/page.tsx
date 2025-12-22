'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { vendorsApi, submissionsApi, Vendor, Submission } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Mail, Phone, Users, TrendingUp, CheckCircle, XCircle, Clock, Building } from 'lucide-react';

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

export default function VendorDetailPage() {
    const params = useParams();
    const vendorId = Number(params.id);

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Calculate metrics
    const totalSubmissions = submissions.length;
    const placedCount = submissions.filter(s => s.status === 'PLACED').length;
    const offeredCount = submissions.filter(s => s.status === 'OFFERED').length;
    const rejectedCount = submissions.filter(s => s.status === 'REJECTED').length;
    const inProgressCount = submissions.filter(s => ['VENDOR_SCREENING', 'CLIENT_ROUND'].includes(s.status)).length;
    const successRate = totalSubmissions > 0 ? Math.round(((placedCount + offeredCount) / totalSubmissions) * 100) : 0;

    return (
        <div className="space-y-6">
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

            {/* Contact Info & Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                {/* Contact Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
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
                        {vendor.notes && (
                            <div className="pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm">{vendor.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Cards */}
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

            {/* Status Breakdown */}
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
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Position</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Round</th>
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
                                            <td className="py-3 px-4 text-sm">{sub.positionTitle}</td>
                                            <td className="py-3 px-4 text-sm">{sub.client?.companyName || '-'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[sub.status] || 'bg-muted'}`}>
                                                    {statusLabels[sub.status] || sub.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{sub.currentRound}</td>
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
