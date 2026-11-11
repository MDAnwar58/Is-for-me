import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, FileDown, ReceiptText, ShoppingCart, Trash2 } from 'lucide-react';
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
import type { Customer, Paginated, Sale } from '@/types/inventory';

type Props = {
    sales: Paginated<Sale>;
    filters: { search?: string; customer_id?: string; status?: string; from?: string; to?: string };
    customers: Pick<Customer, 'id' | 'name'>[];
};

export default function SalesIndex({ sales, filters, customers }: Props) {
    const { can } = usePermissions();
    const canManage = can('manage sales');
    const page = usePage();
    const flash = page.props.flash as { success?: string };

    const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
    const [deleting, setDeleting] = useState(false);

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        params.delete('page');
        router.get('/sales', Object.fromEntries(params), {
            preserveState: true,
            only: ['sales', 'filters'],
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        router.delete(`/sales/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <Page
            title="Sales History"
            description="All sales transactions"
            breadcrumbs={[{ title: 'Sales', href: '/sales' }]}
            actions={
                canManage ? (
                    <Button asChild className="cursor-pointer rounded-full bg-indigo-600 shadow-3d hover:bg-indigo-500">
                        <Link href="/pos">
                            <ShoppingCart className="size-4" />
                            Open POS
                        </Link>
                    </Button>
                ) : undefined
            }
        >
            <Head title="Sales" />

            {flash?.success && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {flash.success}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <SearchInput value={filters.search} placeholder="Search invoice..." />
                <Select value={filters.customer_id ?? ''} onValueChange={(v) => updateFilter('customer_id', v)}>
                    <SelectTrigger className="h-9 w-48">
                        <SelectValue placeholder="All customers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All customers</SelectItem>
                        {customers.map((customer) => (
                            <SelectItem key={customer.id} value={String(customer.id)}>
                                {customer.name}
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
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Due</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sales.data.map((sale) => (
                            <tr key={sale.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 font-medium">
                                        <ReceiptText className="size-4 text-emerald-500" />
                                        {sale.invoice_no}
                                    </div>
                                </td>
                                <td className="px-4 py-3">{sale.customer?.name ?? 'Walk-in'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDate(sale.date)}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sale.total)}</td>
                                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.paid)}</td>
                                <td className={`px-4 py-3 text-right ${Number(sale.due) > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}`}>
                                    {formatCurrency(sale.due)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={sale.payment_status} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                            <a href={`/sales/${sale.id}`}>
                                                <Eye className="size-3.5" />
                                            </a>
                                        </Button>
                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                            <a href={`/sales/${sale.id}/invoice`} target="_blank">
                                                <FileDown className="size-3.5" />
                                            </a>
                                        </Button>
                                        {canManage && (
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(sale)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sales.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                    No sales found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={sales} />

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete sale?</DialogTitle>
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
