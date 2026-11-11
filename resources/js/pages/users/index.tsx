import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Shield, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Paginated, UserRecord } from '@/types/inventory';

type Props = {
    users: Paginated<UserRecord>;
    filters: { search?: string; role?: string };
    roles: { id: number; name: string }[];
};

const roleStyles: Record<string, string> = {
    admin: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    manager: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    staff: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export default function UsersIndex({ users, roles, filters }: Props) {
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<UserRecord | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm({ name: '', email: '', password: '', role: '' });

    const openCreate = () => {
        setEditing(null);
        form.reset();
        setOpen(true);
    };

    const openEdit = (user: UserRecord) => {
        setEditing(user);
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0]?.name ?? '',
        });
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            form.put(`/users/${editing.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setEditing(null);
                },
            });
        } else {
            form.post('/users', {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (deleteId === null) {
return;
}

        router.delete(`/users/${deleteId}`, { preserveScroll: true, onSuccess: () => setDeleteId(null) });
    };

    const runSearch = (value: string) => {
        router.get('/users', { search: value || undefined, role: filters.role || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <Page
            title="Users"
            description="Manage team members and their roles"
            breadcrumbs={[{ title: 'Users', href: '/users' }]}
            actions={
                can('manage users') ? (
                    <Button className="cursor-pointer" onClick={openCreate}>
                        <Plus className="size-4" />
                        Add User
                    </Button>
                ) : undefined
            }
        >
            <Head title="Users" />

            <div className="flex flex-wrap items-center gap-3">
                <Input
                    type="search"
                    placeholder="Search users..."
                    defaultValue={filters.search}
                    onChange={(e) => runSearch(e.target.value)}
                    className="max-w-xs"
                />
                <Select
                    value={filters.role ?? 'all'}
                    onValueChange={(v) =>
                        router.get('/users', { role: v === 'all' ? undefined : v, search: filters.search || undefined }, { preserveState: true, preserveScroll: true })
                    }
                >
                    <SelectTrigger className="w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.data.map((user) => {
                    const roleName = user.roles?.[0]?.name ?? '—';

                    return (
                        <div key={user.id} className="rounded-2xl border bg-card p-5 shadow-3d transition-transform hover:-translate-y-1">
                            <div className="flex items-start gap-3">
                                <div className="flex size-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <UserRound className="size-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{user.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <Badge className={roleStyles[roleName] ?? ''}>
                                    <Shield className="size-3" />
                                    {roleName}
                                </Badge>
                                {can('manage users') && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openEdit(user)}>
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="cursor-pointer text-rose-500" onClick={() => setDeleteId(user.id)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {users.data.length === 0 && (
                    <div className="col-span-full rounded-2xl border bg-card p-16 text-center text-muted-foreground">No users found</div>
                )}
            </div>

            <Pagination pagination={users} />

            {/* User form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update user details and role.' : 'Create a new team member.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="password">{editing ? 'Password (leave blank to keep)' : 'Password'}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required={!editing}
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={form.data.role} onValueChange={(v) => form.setData('role', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : editing ? 'Update User' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User?</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
