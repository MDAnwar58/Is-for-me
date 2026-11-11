import { Head, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2, Truck } from 'lucide-react';
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
import type { Paginated, Supplier } from '@/types/inventory';

type Props = {
    suppliers: Paginated<Supplier>;
    filters: { search?: string };
};

const emptyForm = {
    name: '',
    company: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    country: '',
    tax_id: '',
    opening_balance: '',
    note: '',
    is_active: true,
};

export default function SuppliersIndex({ suppliers }: Props) {
    const { can } = usePermissions();
    const canManage = can('manage suppliers');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        setDialogOpen(true);
    };

    const openEdit = (supplier: Supplier) => {
        setEditing(supplier);
        setData({
            name: supplier.name,
            company: supplier.company ?? '',
            email: supplier.email ?? '',
            phone: supplier.phone ?? '',
            mobile: supplier.mobile ?? '',
            address: supplier.address ?? '',
            city: supplier.city ?? '',
            country: supplier.country ?? '',
            tax_id: supplier.tax_id ?? '',
            opening_balance: String(supplier.opening_balance ?? ''),
            note: supplier.note ?? '',
            is_active: supplier.is_active,
        });
        setDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            put(`/suppliers/${editing.id}`, { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        } else {
            post('/suppliers', { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        }
    };

    return (
        <Page
            title="Suppliers"
            description="Manage your suppliers and their balances"
            breadcrumbs={[{ title: 'Suppliers', href: '/suppliers' }]}
            actions={
                canManage ? (
                    <Button onClick={openCreate} className="cursor-pointer rounded-full shadow-3d">
                        <Plus className="size-4" />
                        New Supplier
                    </Button>
                ) : undefined
            }
        >
            <Head title="Suppliers" />
            <SearchInput placeholder="Search suppliers..." />

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[760px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Supplier</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3 text-right">Purchases</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {suppliers.data.map((supplier) => (
                            <tr key={supplier.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400">
                                            <Truck className="size-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{supplier.name}</p>
                                            <p className="text-xs text-muted-foreground">{supplier.company || 'â€”'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p>{supplier.phone || supplier.mobile || 'â€”'}</p>
                                    <p className="text-xs text-muted-foreground">{supplier.email || supplier.city || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {formatCurrency(supplier.total_purchase_amount)}
                                    <span className="block text-xs font-normal text-muted-foreground">
                                        {supplier.purchases_count} purchases
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={Number(supplier.balance) > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                        {formatCurrency(supplier.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                            <a href={`/suppliers/${supplier.id}`}>
                                                <Eye className="size-3.5" />
                                            </a>
                                        </Button>
                                        {canManage && (
                                            <>
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(supplier)}>
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(supplier)}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {suppliers.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                                    No suppliers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={suppliers} />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Supplier' : 'New Supplier'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update supplier information.' : 'Add a new supplier.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="s-name">Name *</Label>
                            <Input id="s-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="s-company">Company</Label>
                            <Input id="s-company" value={data.company} onChange={(e) => setData('company', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="s-email">Email</Label>
                            <Input id="s-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="s-phone">Phone</Label>
                            <Input id="s-phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="s-mobile">Mobile</Label>
                            <Input id="s-mobile" value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="s-tax">Tax ID</Label>
                            <Input id="s-tax" value={data.tax_id} onChange={(e) => setData('tax_id', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="s-address">Address</Label>
                            <Input id="s-address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="s-city">City</Label>
                            <Input id="s-city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="s-country">Country</Label>
                            <Input id="s-country" value={data.country} onChange={(e) => setData('country', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="s-balance">Opening Balance</Label>
                            <Input id="s-balance" type="number" min="0" value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} />
                            <InputError message={errors.opening_balance} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="s-note">Note</Label>
                            <Textarea id="s-note" value={data.note} onChange={(e) => setData('note', e.target.value)} rows={2} />
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
                        <DialogTitle>Delete supplier?</DialogTitle>
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
                                    destroy(`/suppliers/${deleteTarget.id}`, { preserveScroll: true });
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
