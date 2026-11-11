import { Head } from '@inertiajs/react';
import { Coins, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Page } from '@/components/page';
import { ReportFilters } from '@/components/report-filters';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

type Props = {
    from: string;
    to: string;
    data: {
        sales: number;
        cogs: number;
        gross_profit: number;
        expenses: number;
        net_profit: number;
    };
};

export default function ReportsProfitLoss({ from, to, data }: Props) {
    return (
        <Page
            title="Profit & Loss"
            description="Income statement for the selected period"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Profit & Loss' }]}
        >
            <Head title="Profit & Loss" />

            <ReportFilters from={from} to={to} base="/reports/profit-loss" exportType="profit-loss" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <TrendingUp className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sales</p>
                            <p className="text-lg font-bold">{formatCurrency(data.sales)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <Scale className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">COGS</p>
                            <p className="text-lg font-bold">{formatCurrency(data.cogs)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gross Profit</p>
                            <p className="text-lg font-bold">{formatCurrency(data.gross_profit)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            <Coins className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expenses</p>
                            <p className="text-lg font-bold">{formatCurrency(data.expenses)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div
                            className={`flex size-11 items-center justify-center rounded-xl ${
                                data.net_profit >= 0
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                        >
                            <Wallet className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Net Profit</p>
                            <p className={`text-lg font-bold ${data.net_profit < 0 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                                {formatCurrency(data.net_profit)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mx-auto max-w-xl shadow-3d">
                <CardContent className="space-y-3 pt-6">
                    <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-sm font-medium text-muted-foreground">Total Sales</span>
                        <span className="font-semibold">{formatCurrency(data.sales)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-sm font-medium text-muted-foreground">Cost of Goods Sold</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(data.cogs)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-sm font-medium">Gross Profit</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.gross_profit)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-sm font-medium text-muted-foreground">Expenses</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(data.expenses)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Net Profit</span>
                        <span className={`text-lg font-bold ${data.net_profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {formatCurrency(data.net_profit)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <TrendingDown className="size-4" />
                Negative net profit means the business lost money in this period.
            </div>
        </Page>
    );
}
