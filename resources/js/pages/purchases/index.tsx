import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, FileDown, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Paginated, Purchase, Supplier } from '@/types/inventory';

type Props = {
    purchases: Paginated<Purchase>;
    filters: { search?: string; supplier_id?: string; status?: string; from?: string; to?: string };
    suppliers: Pick<Supplier, 'id' | 'name'>[];
};

export default function PurchasesIndex({ purchases, filters, suppliers }: Props) {
    const { can } = usePermissions();
    const canManage = can('manage purchases');
    const page = usePage();
    const flash = page.props.flash as { success?: string };

    const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
    const [deleting, setDeleting] = useState(false);

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        params.delete('page');
        router.get('/purchases', Object.fromEntries(params), {
            preserveState: true,
            only: ['purchases', 'filters'],
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        router.delete(`/purchases/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <Page
            title="Purchases"
            description="Purchase orders with automatic stock updates"
            breadcrumbs={[{ title: 'Purchases', href: '/purchases' }]}
            actions={
                canManage ? (
                    <Button asChild className="cursor-pointer rounded-full shadow-3d">
                        <Link href="/purchases/create">
                            <Plus className="size-4" />
                            New Purchase
                        </Link>
                    </Button>
                ) : undefined
            }
        >
            <Head title="Purchases" />

            {flash?.success && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {flash.success}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <SearchInput value={filters.search} placeholder="Search invoice..." />
                <Select value={filters.supplier_id ?? ''} onValueChange={(v) => updateFilter('supplier_id', v)}>
                    <SelectTrigger className="h-9 w-48">
                        <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All suppliers</SelectItem>
                        {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                                {supplier.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filters.status ?? ''} onValueChange={(v) => updateFilter('status', v)}>
                    <SelectTrigger className="h-9 w-40">
                        <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[800px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Supplier</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Due</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {purchases.data.map((purchase) => (
                            <tr key={purchase.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3 font-medium">{purchase.invoice_no}</td>
                                <td className="px-4 py-3">{purchase.supplier?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDate(purchase.date)}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(purchase.total)}</td>
                                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(purchase.paid)}</td>
                                <td className={`px-4 py-3 text-right ${Number(purchase.due) > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}`}>
                                    {formatCurrency(purchase.due)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={purchase.payment_status} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                            <a href={`/purchases/${purchase.id}`}>
                                                <Eye className="size-3.5" />
                                            </a>
                                        </Button>
                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                            <a href={`/purchases/${purchase.id}/invoice`} target="_blank">
                                                <FileDown className="size-3.5" />
                                            </a>
                                        </Button>
                                        {canManage && (
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(purchase)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {purchases.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                    No purchases found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={purchases} />

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete purchase?</DialogTitle>
                        <DialogDescription>
                            Stock for {deleteTarget?.invoice_no} will be returned to products. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            <Trash2 className="size-4" />
                            {deleting ? 'Deleting...' : 'Delete & Revert Stock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
