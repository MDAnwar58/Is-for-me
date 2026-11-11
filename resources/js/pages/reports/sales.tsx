import { Head, Link } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { ReportFilters } from '@/components/report-filters';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Paginated, Sale } from '@/types/inventory';

type Props = {
    sales: Paginated<Sale>;
    filters: { from?: string; to?: string; status?: string };
    total: number;
};

export default function ReportsSales({ sales, filters, total }: Props) {
    return (
        <Page
            title="Sales Report"
            description="Detailed sales for the selected period"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Sales' }]}
        >
            <Head title="Sales Report" />

            <ReportFilters
                from={filters.from ?? ''}
                to={filters.to ?? ''}
                base="/reports/sales"
                exportType="sales"
                selects={[
                    {
                        name: 'status',
                        value: filters.status ?? '',
                        placeholder: 'All payment statuses',
                        options: [
                            { value: 'paid', label: 'Paid' },
                            { value: 'partial', label: 'Partial' },
                            { value: 'unpaid', label: 'Unpaid' },
                            { value: 'refunded', label: 'Refunded' },
                        ],
                    },
                ]}
            />

            <Card className="shadow-3d">
                <CardContent className="flex items-center gap-3 pt-5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                        <TrendingUp className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Sales (filtered)</p>
                        <p className="text-lg font-bold">{formatCurrency(total)}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Due</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sales.data.map((sale) => (
                            <tr key={sale.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3">
                                    <Link href={`/sales/${sale.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                        {sale.invoice_no}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{sale.customer?.name ?? 'Walk-in'}</td>
                                <td className="px-4 py-3">{formatDate(sale.date)}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sale.total)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(sale.paid)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(sale.due)}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={sale.payment_status} />
                                </td>
                            </tr>
                        ))}
                        {sales.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                    No sales in this period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={sales} />
        </Page>
    );
}
