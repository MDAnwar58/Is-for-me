import { Head, Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { ReportFilters } from '@/components/report-filters';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Paginated, Purchase } from '@/types/inventory';

type Props = {
    purchases: Paginated<Purchase>;
    filters: { from?: string; to?: string; status?: string };
    total: number;
};

export default function ReportsPurchases({ purchases, filters, total }: Props) {
    return (
        <Page
            title="Purchase Report"
            description="Detailed purchases for the selected period"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Purchases' }]}
        >
            <Head title="Purchase Report" />

            <ReportFilters
                from={filters.from ?? ''}
                to={filters.to ?? ''}
                base="/reports/purchases"
                exportType="purchases"
                selects={[
                    {
                        name: 'status',
                        value: filters.status ?? '',
                        placeholder: 'All payment statuses',
                        options: [
                            { value: 'paid', label: 'Paid' },
                            { value: 'partial', label: 'Partial' },
                            { value: 'unpaid', label: 'Unpaid' },
                        ],
                    },
                ]}
            />

            <Card className="shadow-3d">
                <CardContent className="flex items-center gap-3 pt-5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <ShoppingCart className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Purchases (filtered)</p>
                        <p className="text-lg font-bold">{formatCurrency(total)}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Supplier</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Due</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {purchases.data.map((purchase) => (
                            <tr key={purchase.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3">
                                    <Link href={`/purchases/${purchase.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                        {purchase.invoice_no}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{purchase.supplier?.name ?? '—'}</td>
                                <td className="px-4 py-3">{formatDate(purchase.date)}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(purchase.total)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(purchase.paid)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(purchase.due)}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={purchase.payment_status} />
                                </td>
                            </tr>
                        ))}
                        {purchases.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                    No purchases in this period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={purchases} />
        </Page>
    );
}
