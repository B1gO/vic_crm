'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorsApi, clientsApi, Vendor, Client, VendorContact } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Trash2, Edit, Mail, Phone, Building, UserCircle, X, Linkedin } from 'lucide-react';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    notes: string;
}

const emptyContact: ContactFormData = { name: '', email: '', phone: '', linkedinUrl: '', notes: '' };

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showContactForm, setShowContactForm] = useState(false);
    const [editingContactIdx, setEditingContactIdx] = useState<number | null>(null);
    const [contactFormData, setContactFormData] = useState<ContactFormData>(emptyContact);
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        notes: '',
        clientIds: [] as number[],
        contacts: [] as VendorContact[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vendorsData, clientsData] = await Promise.all([
                vendorsApi.getAll(),
                clientsApi.getAll()
            ]);
            setVendors(vendorsData);
            setClients(clientsData);
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
                contacts: formData.contacts
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
        setFormData({ companyName: '', contactName: '', email: '', phone: '', notes: '', clientIds: [], contacts: [] });
        setShowForm(false);
        setEditingId(null);
        setShowContactForm(false);
        setEditingContactIdx(null);
        setContactFormData(emptyContact);
    };

    const handleEdit = (vendor: Vendor) => {
        setFormData({
            companyName: vendor.companyName,
            contactName: vendor.contactName || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            notes: vendor.notes || '',
            clientIds: vendor.clients?.map(c => c.id) || [],
            contacts: vendor.contacts || []
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

    const openAddContact = () => {
        setContactFormData(emptyContact);
        setEditingContactIdx(null);
        setShowContactForm(true);
    };

    const openEditContact = (idx: number) => {
        const contact = formData.contacts[idx];
        setContactFormData({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            linkedinUrl: contact.linkedinUrl || '',
            notes: contact.notes || ''
        });
        setEditingContactIdx(idx);
        setShowContactForm(true);
    };

    const saveContact = () => {
        if (!contactFormData.name.trim()) return;
        const newContact: VendorContact = {
            name: contactFormData.name.trim(),
            email: contactFormData.email.trim() || null,
            phone: contactFormData.phone.trim() || null,
            linkedinUrl: contactFormData.linkedinUrl.trim() || null,
            notes: contactFormData.notes.trim() || null
        };
        if (editingContactIdx !== null) {
            setFormData(prev => ({
                ...prev,
                contacts: prev.contacts.map((c, i) => i === editingContactIdx ? newContact : c)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                contacts: [...prev.contacts, newContact]
            }));
        }
        setShowContactForm(false);
        setContactFormData(emptyContact);
        setEditingContactIdx(null);
    };

    const removeContact = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== idx)
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
                                    <label className="text-sm font-medium mb-1 block">Primary Contact</label>
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

                            {/* Contacts Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Contacts</label>
                                    <Button type="button" variant="outline" size="sm" onClick={openAddContact}>
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Contact
                                    </Button>
                                </div>
                                {formData.contacts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">
                                        No contacts added yet
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.contacts.map((contact, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <UserCircle className="w-8 h-8 text-purple-500" />
                                                    <div>
                                                        <p className="font-medium">{contact.name}</p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>}
                                                            {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>}
                                                            {contact.linkedinUrl && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" />LinkedIn</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => openEditContact(idx)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeContact(idx)}>
                                                        <X className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Contact Form Modal */}
                            {showContactForm && (
                                <div className="p-4 border border-primary/50 rounded-lg bg-primary/5 space-y-3">
                                    <h4 className="font-medium">{editingContactIdx !== null ? 'Edit Contact' : 'New Contact'}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">Name *</label>
                                            <input
                                                type="text"
                                                value={contactFormData.name}
                                                onChange={e => setContactFormData({ ...contactFormData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                                placeholder="Contact name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">Email</label>
                                            <input
                                                type="email"
                                                value={contactFormData.email}
                                                onChange={e => setContactFormData({ ...contactFormData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                                placeholder="contact@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">Phone</label>
                                            <input
                                                type="tel"
                                                value={contactFormData.phone}
                                                onChange={e => setContactFormData({ ...contactFormData, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">LinkedIn URL</label>
                                            <input
                                                type="url"
                                                value={contactFormData.linkedinUrl}
                                                onChange={e => setContactFormData({ ...contactFormData, linkedinUrl: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Notes</label>
                                        <textarea
                                            value={contactFormData.notes}
                                            onChange={e => setContactFormData({ ...contactFormData, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                            rows={2}
                                            placeholder="Notes about this contact..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={saveContact}>
                                            {editingContactIdx !== null ? 'Update' : 'Add'} Contact
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setShowContactForm(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

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
                                {vendor.contacts && vendor.contacts.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Contacts ({vendor.contacts.length}):</p>
                                        <div className="flex flex-wrap gap-1">
                                            {vendor.contacts.map((contact, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-600">
                                                    {contact.name}
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
