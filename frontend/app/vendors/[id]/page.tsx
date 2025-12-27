'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { vendorsApi, Vendor, VendorContact } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Mail, Phone, Building, UserCircle, X, Linkedin, FileText } from 'lucide-react';

export default function VendorDetailPage() {
    const params = useParams();
    const vendorId = Number(params.id);

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedContactProfile, setSelectedContactProfile] = useState<VendorContact | null>(null);

    useEffect(() => {
        if (vendorId) {
            loadData();
        }
    }, [vendorId]);

    const loadData = async () => {
        try {
            const vendorData = await vendorsApi.getById(vendorId);
            setVendor(vendorData);
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
        </div>
    );
}
