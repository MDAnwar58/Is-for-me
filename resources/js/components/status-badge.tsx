import { cn } from '@/lib/utils';

const paymentStatusStyles: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    partial: 'bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    unpaid: 'bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
};

const recordStatusStyles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    received: 'bg-sky-100 text-sky-700 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
    returned: 'bg-violet-100 text-violet-700 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
    ordered: 'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
    cancelled: 'bg-zinc-200 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-500/30',
};

const stockStatusStyles: Record<string, string> = {
    ok: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    low: 'bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    out: 'bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
};

export const paymentStatusLabels: Record<string, string> = {
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
};

export const recordStatusLabels: Record<string, string> = {
    completed: 'Completed',
    received: 'Received',
    returned: 'Returned',
    ordered: 'Ordered',
    cancelled: 'Cancelled',
};

export function StatusBadge({
    status,
    kind = 'payment',
    className,
}: {
    status: string;
    kind?: 'payment' | 'record' | 'stock';
    className?: string;
}) {
    const styles =
        kind === 'payment'
            ? paymentStatusStyles
            : kind === 'stock'
              ? stockStatusStyles
              : recordStatusStyles;

    const labels =
        kind === 'payment'
            ? paymentStatusLabels
            : kind === 'stock'
              ? { ok: 'In Stock', low: 'Low Stock', out: 'Out of Stock' }
              : recordStatusLabels;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                styles[status] ?? paymentStatusStyles.unpaid,
                className,
            )}
        >
            {labels[status] ?? status}
        </span>
    );
}
