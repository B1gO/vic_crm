'use client';

import { useEffect, useState } from 'react';
import { usersApi, User } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, UserCircle } from 'lucide-react';

type Role = 'ADMIN' | 'RECRUITER' | 'TRAINER' | 'MANAGER';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'RECRUITER' as Role });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        usersApi.getAll()
            .then(setUsers)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await usersApi.update(editingId, formData);
            } else {
                await usersApi.create(formData);
            }
            setFormData({ name: '', email: '', role: 'RECRUITER' });
            setShowForm(false);
            setEditingId(null);
            loadUsers();
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    };

    const handleEdit = (user: User) => {
        setFormData({ name: user.name, email: user.email, role: user.role });
        setEditingId(user.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this user?')) return;
        try {
            await usersApi.delete(id);
            loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground mt-1">Manage admins and recruiters</p>
                </div>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', email: '', role: 'RECRUITER' }); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit User' : 'New User'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Jane Smith"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="jane@vic.com"
                                />
                            </div>
                            <div className="w-40">
                                <label className="text-sm font-medium mb-1 block">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="RECRUITER">Recruiter</option>
                                </select>
                            </div>
                            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                Cancel
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : users.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No users yet. Create your first user!
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="border-b border-border">
                                <tr className="text-left">
                                    <th className="p-4 font-medium text-muted-foreground">User</th>
                                    <th className="p-4 font-medium text-muted-foreground">Email</th>
                                    <th className="p-4 font-medium text-muted-foreground">Role</th>
                                    <th className="p-4 font-medium text-muted-foreground">Created</th>
                                    <th className="p-4 font-medium text-muted-foreground w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{user.email}</td>
                                        <td className="p-4"><RoleBadge role={user.role} /></td>
                                        <td className="p-4 text-muted-foreground text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
