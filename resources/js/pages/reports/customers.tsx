import { Head, router } from '@inertiajs/react';
import { FileDown, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import type { Customer, Paginated } from '@/types/inventory';

type Props = {
    customers: Paginated<
        Customer & { sales_count?: number; total_amount?: string | number; total_paid?: string | number }
    >;
};

export default function ReportsCustomers({ customers }: Props) {
    const [search, setSearch] = useState('');

    const runSearch = (value: string) => {
        setSearch(value);
        router.get('/reports/customers', { search: value || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <Page
            title="Customer Report"
            description="Purchase activity by customer"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Customers' }]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <a href="/reports/export-csv?type=sales">
                        <FileDown className="size-4" />
                        CSV
                    </a>
                </Button>
            }
        >
            <Head title="Customer Report" />

            <div className="flex justify-between gap-3">
                <Input
                    type="search"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => runSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[680px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 text-right">Sales</th>
                            <th className="px-4 py-3 text-right">Total Purchased</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {customers.data.map((customer) => {
                            const total = Number(customer.total_amount ?? 0);
                            const paid = Number(customer.total_paid ?? 0);
                            const outstanding = total - paid;

                            return (
                                <tr key={customer.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                <UserRound className="size-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{customer.name}</p>
                                                {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">{customer.sales_count ?? 0}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(total)}</td>
                                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(paid)}</td>
                                    <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{formatCurrency(outstanding)}</td>
                                </tr>
                            );
                        })}
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
        </Page>
    );
}
