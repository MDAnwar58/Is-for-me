import { Head } from '@inertiajs/react';
import { Coins } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { ReportFilters } from '@/components/report-filters';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Expense, Paginated } from '@/types/inventory';

type Props = {
    expenses: Paginated<Expense>;
    filters: { from?: string; to?: string; category_id?: string };
    total: number;
    categories: { id: number; name: string }[];
};

export default function ReportsExpenses({ expenses, filters, total, categories }: Props) {
    return (
        <Page
            title="Expense Report"
            description="Detailed expenses for the selected period"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Expenses' }]}
        >
            <Head title="Expense Report" />

            <ReportFilters
                from={filters.from ?? ''}
                to={filters.to ?? ''}
                base="/reports/expenses"
                exportType="expenses"
                selects={[
                    {
                        name: 'category_id',
                        value: filters.category_id ?? '',
                        placeholder: 'All categories',
                        options: categories.map((c) => ({ value: String(c.id), label: c.name })),
                    },
                ]}
            />

            <Card className="shadow-3d">
                <CardContent className="flex items-center gap-3 pt-5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        <Coins className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Expenses (filtered)</p>
                        <p className="text-lg font-bold">{formatCurrency(total)}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {expenses.data.map((expense) => (
                            <tr key={expense.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3 font-medium">{expense.title}</td>
                                <td className="px-4 py-3 text-muted-foreground">{expense.category?.name ?? '—'}</td>
                                <td className="px-4 py-3">{formatDate(expense.date)}</td>
                                <td className="px-4 py-3 capitalize text-muted-foreground">{expense.payment_method}</td>
                                <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(expense.amount)}</td>
                            </tr>
                        ))}
                        {expenses.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                                    No expenses in this period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={expenses} />
        </Page>
    );
}
