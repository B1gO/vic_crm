'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorsApi, clientsApi, usersApi, Vendor, Client, User } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Trash2, Edit, Mail, Phone, Building, UserCircle } from 'lucide-react';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        notes: '',
        clientIds: [] as number[],
        recruiterIds: [] as number[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vendorsData, clientsData, usersData] = await Promise.all([
                vendorsApi.getAll(),
                clientsApi.getAll(),
                usersApi.getAll()
            ]);
            setVendors(vendorsData);
            setClients(clientsData);
            setUsers(usersData);
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
                companyName: formData.companyName,
                contactName: formData.contactName,
                email: formData.email,
                phone: formData.phone,
                notes: formData.notes,
                clients: formData.clientIds.map(id => ({ id })),
                recruiters: formData.recruiterIds.map(id => ({ id }))
            };
            if (editingId) {
                await vendorsApi.update(editingId, payload as unknown as Partial<Vendor>);
            } else {
                await vendorsApi.create(payload as unknown as Partial<Vendor>);
            }
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save vendor:', error);
        }
    };

    const resetForm = () => {
        setFormData({ companyName: '', contactName: '', email: '', phone: '', notes: '', clientIds: [], recruiterIds: [] });
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (vendor: Vendor) => {
        setFormData({
            companyName: vendor.companyName,
            contactName: vendor.contactName || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            notes: vendor.notes || '',
            clientIds: vendor.clients?.map(c => c.id) || [],
            recruiterIds: vendor.recruiters?.map(r => r.id) || []
        });
        setEditingId(vendor.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this vendor?')) return;
        try {
            await vendorsApi.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete vendor:', error);
        }
    };

    const toggleClient = (clientId: number) => {
        setFormData(prev => ({
            ...prev,
            clientIds: prev.clientIds.includes(clientId)
                ? prev.clientIds.filter(id => id !== clientId)
                : [...prev.clientIds, clientId]
        }));
    };

    const toggleRecruiter = (userId: number) => {
        setFormData(prev => ({
            ...prev,
            recruiterIds: prev.recruiterIds.includes(userId)
                ? prev.recruiterIds.filter(id => id !== userId)
                : [...prev.recruiterIds, userId]
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
                    <p className="text-muted-foreground mt-1">Manage vendor companies</p>
                </div>
                <Button onClick={() => {
                    if (showForm && !editingId) {
                        setShowForm(false);
                    } else {
                        resetForm();
                        setShowForm(true);
                    }
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Vendor' : 'New Vendor'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Vendor Company Inc."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Contact Name</label>
                                    <input
                                        type="text"
                                        value={formData.contactName}
                                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="contact@vendor.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Recruiters</label>
                                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[60px]">
                                    {users.length === 0 ? (
                                        <span className="text-sm text-muted-foreground">No users available</span>
                                    ) : (
                                        users.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => toggleRecruiter(user.id)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${formData.recruiterIds.includes(user.id)
                                                        ? 'bg-purple-500 text-white'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    }`}
                                            >
                                                <UserCircle className="w-3 h-3 mr-1" />
                                                {user.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Associated Clients</label>
                                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[60px]">
                                    {clients.length === 0 ? (
                                        <span className="text-sm text-muted-foreground">No clients available</span>
                                    ) : (
                                        clients.map(client => (
                                            <button
                                                key={client.id}
                                                type="button"
                                                onClick={() => toggleClient(client.id)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${formData.clientIds.includes(client.id)
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    }`}
                                            >
                                                <Building className="w-3 h-3 mr-1" />
                                                {client.companyName}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    rows={2}
                                    placeholder="Additional notes..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : vendors.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No vendors yet. Add your first vendor!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vendors.map(vendor => (
                        <Card key={vendor.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <Link href={`/vendors/${vendor.id}`} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </Link>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vendor)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vendor.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <Link href={`/vendors/${vendor.id}`} className="block">
                                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">{vendor.companyName}</h3>
                                </Link>
                                {vendor.contactName && (
                                    <p className="text-sm text-muted-foreground mb-2">{vendor.contactName}</p>
                                )}
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {vendor.email && (
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-3 h-3" />
                                            {vendor.email}
                                        </p>
                                    )}
                                    {vendor.phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-3 h-3" />
                                            {vendor.phone}
                                        </p>
                                    )}
                                </div>
                                {vendor.recruiters && vendor.recruiters.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Recruiters:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {vendor.recruiters.map(recruiter => (
                                                <span key={recruiter.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-600">
                                                    {recruiter.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {vendor.clients && vendor.clients.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Clients:</p>
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
                    ))}
                </div>
            )}
        </div>
    );
}
