import { Head, Link } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Paginated, Payment } from '@/types/inventory';

type Props = {
    payments: Paginated<Payment>;
    filters: { type?: string; from?: string; to?: string };
    total_received: number;
    total_paid: number;
};

export default function PaymentsIndex({ payments, total_received, total_paid }: Props) {
    const { can } = usePermissions();

    return (
        <Page
            title="Payments"
            description="All money received and paid out"
            breadcrumbs={[{ title: 'Payments', href: '/payments' }]}
            actions={
                can('manage payments') ? (
                    <Link href="/payments/due" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white shadow-3d transition-transform hover:-translate-y-0.5 hover:bg-indigo-500">
                        <Wallet className="size-4" />
                        Outstanding Dues
                    </Link>
                ) : undefined
            }
        >
            <Head title="Payments" />

            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ArrowDownLeft className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Received</p>
                            <p className="text-lg font-bold">{formatCurrency(total_received)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            <ArrowUpRight className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Paid</p>
                            <p className="text-lg font-bold">{formatCurrency(total_paid)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[680px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Party</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payments.data.map((payment) => {
                            const isSale = payment.payable_type.includes('Sale') || payment.payable_type.includes('Customer');
                            const isIncoming = isSale;

                            return (
                                <tr key={payment.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">
                                            {payment.payable && 'invoice_no' in payment.payable
                                                ? payment.payable.invoice_no
                                                : payment.payable && 'name' in payment.payable
                                                  ? payment.payable.name
                                                  : '—'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.payable && 'invoice_no' in payment.payable
                                                ? payment.payable_type.includes('Sale')
                                                    ? 'Sale invoice'
                                                    : 'Purchase invoice'
                                                : payment.payable_type.includes('Customer')
                                                  ? 'Customer'
                                                  : 'Supplier'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                                isIncoming
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                                            )}
                                        >
                                            {isIncoming ? 'Received' : 'Paid'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{formatDate(payment.date)}</td>
                                    <td
                                        className={cn(
                                            'px-4 py-3 text-right font-semibold',
                                            isIncoming ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                                        )}
                                    >
                                        {isIncoming ? '+' : '-'}
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="px-4 py-3 capitalize text-muted-foreground">{payment.payment_method}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{payment.reference ?? '—'}</td>
                                </tr>
                            );
                        })}
                        {payments.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                    No payments recorded
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={payments} />
        </Page>
    );
}
