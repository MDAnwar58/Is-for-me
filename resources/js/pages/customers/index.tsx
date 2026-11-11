import { Head, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
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
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Customer, Paginated } from '@/types/inventory';

type Props = {
    customers: Paginated<Customer>;
    filters: { search?: string };
};

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    opening_balance: '',
    note: '',
    is_active: true,
};

export default function CustomersIndex({ customers }: Props) {
    const { can } = usePermissions();
    const canManage = can('manage customers');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        setDialogOpen(true);
    };

    const openEdit = (customer: Customer) => {
        setEditing(customer);
        setData({
            name: customer.name,
            email: customer.email ?? '',
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            city: customer.city ?? '',
            country: customer.country ?? '',
            opening_balance: String(customer.opening_balance ?? ''),
            note: customer.note ?? '',
            is_active: customer.is_active,
        });
        setDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            put(`/customers/${editing.id}`, { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        } else {
            post('/customers', { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        }
    };

    return (
        <Page
            title="Customers"
            description="Manage your customers and their balances"
            breadcrumbs={[{ title: 'Customers', href: '/customers' }]}
            actions={
                canManage ? (
                    <Button onClick={openCreate} className="cursor-pointer rounded-full shadow-3d">
                        <Plus className="size-4" />
                        New Customer
                    </Button>
                ) : undefined
            }
        >
            <Head title="Customers" />
            <SearchInput placeholder="Search customers..." />

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3 text-right">Sales</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {customers.data.map((customer) => (
                            <tr key={customer.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400">
                                            <UsersRound className="size-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{customer.city || 'â€”'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p>{customer.phone || 'â€”'}</p>
                                    <p className="text-xs text-muted-foreground">{customer.email || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {formatCurrency(customer.total_sale_amount)}
                                    <span className="block text-xs font-normal text-muted-foreground">
                                        {customer.sales_count} sales
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={Number(customer.balance) > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                        {formatCurrency(customer.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                            <a href={`/customers/${customer.id}`}>
                                                <Eye className="size-3.5" />
                                            </a>
                                        </Button>
                                        {canManage && (
                                            <>
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(customer)}>
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(customer)}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {customers.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                                    No customers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={customers} />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Customer' : 'New Customer'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update customer information.' : 'Add a new customer.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="c-name">Name *</Label>
                            <Input id="c-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="c-email">Email</Label>
                            <Input id="c-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="c-phone">Phone</Label>
                            <Input id="c-phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="c-address">Address</Label>
                            <Input id="c-address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="c-city">City</Label>
                            <Input id="c-city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="c-country">Country</Label>
                            <Input id="c-country" value={data.country} onChange={(e) => setData('country', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="c-balance">Opening Balance</Label>
                            <Input id="c-balance" type="number" min="0" value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} />
                            <InputError message={errors.opening_balance} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="c-note">Note</Label>
                            <Textarea id="c-note" value={data.note} onChange={(e) => setData('note', e.target.value)} rows={2} />
                        </div>
                        <DialogFooter className="sm:col-span-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editing ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete customer?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove "{deleteTarget?.name}".
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deleteTarget) {
                                    destroy(`/customers/${deleteTarget.id}`, { preserveScroll: true });
                                }

                                setDeleteTarget(null);
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
