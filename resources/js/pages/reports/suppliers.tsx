import { Head, router } from '@inertiajs/react';
import { FileDown, Truck } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import type { Paginated, Supplier } from '@/types/inventory';

type Props = {
    suppliers: Paginated<
        Supplier & { purchases_count?: number; total_amount?: string | number; total_paid?: string | number }
    >;
};

export default function ReportsSuppliers({ suppliers }: Props) {
    const [search, setSearch] = useState('');

    const runSearch = (value: string) => {
        setSearch(value);
        router.get('/reports/suppliers', { search: value || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <Page
            title="Supplier Report"
            description="Purchase activity by supplier"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Suppliers' }]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <a href="/reports/export-csv?type=purchases">
                        <FileDown className="size-4" />
                        CSV
                    </a>
                </Button>
            }
        >
            <Head title="Supplier Report" />

            <Input
                type="search"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => runSearch(e.target.value)}
                className="max-w-xs"
            />

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[680px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Supplier</th>
                            <th className="px-4 py-3 text-right">Purchases</th>
                            <th className="px-4 py-3 text-right">Total Purchased</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {suppliers.data.map((supplier) => {
                            const total = Number(supplier.total_amount ?? 0);
                            const paid = Number(supplier.total_paid ?? 0);
                            const outstanding = total - paid;

                            return (
                                <tr key={supplier.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Truck className="size-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{supplier.name}</p>
                                                {supplier.company && <p className="text-xs text-muted-foreground">{supplier.company}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">{supplier.purchases_count ?? 0}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(total)}</td>
                                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(paid)}</td>
                                    <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{formatCurrency(outstanding)}</td>
                                </tr>
                            );
                        })}
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
        </Page>
    );
}
