import { Head, Link } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { ArrowDownRight, ArrowUpRight, Coins, ShoppingCart, TrendingUp, Trophy } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Page } from '@/components/page';
import { ReportFilters } from '@/components/report-filters';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
    from: string;
    to: string;
    summary: {
        sales: number;
        sale_count: number;
        purchases: number;
        purchase_count: number;
        expenses: number;
        profit: number;
    };
    daily: { date: string; label: string; sales: number; purchases: number }[];
    top_products: { product_id: number; total_qty: number; total_sales: number; product: { id: number; name: string; sku: string } }[];
};

export default function ReportsIndex({ from, to, summary, daily, top_products }: Props) {
    const chartData = {
        labels: daily.map((d) => d.label),
        datasets: [
            {
                label: 'Sales',
                data: daily.map((d) => d.sales),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Purchases',
                data: daily.map((d) => d.purchases),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <Page
            title="Reports Overview"
            description="Business performance at a glance"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }]}
        >
            <Head title="Reports" />

            <ReportFilters from={from} to={to} base="/reports" exportType="sales" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <TrendingUp className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sales</p>
                            <p className="text-lg font-bold">{formatCurrency(summary.sales)}</p>
                            <p className="text-xs text-muted-foreground">{summary.sale_count} invoices</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <ShoppingCart className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Purchases</p>
                            <p className="text-lg font-bold">{formatCurrency(summary.purchases)}</p>
                            <p className="text-xs text-muted-foreground">{summary.purchase_count} orders</p>
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
                            <p className="text-lg font-bold">{formatCurrency(summary.expenses)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Net Profit</p>
                            <p className={`text-lg font-bold ${summary.profit < 0 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                                {formatCurrency(summary.profit)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <h3 className="mb-4 font-semibold">Daily Sales vs Purchases</h3>
                        <div className="h-72">
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } },
                                    scales: {
                                        x: { grid: { display: false } },
                                        y: { grid: { color: 'rgba(148, 163, 184, 0.15)' } },
                                    },
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Trophy className="size-5 text-amber-500" />
                            <h3 className="font-semibold">Top Products</h3>
                        </div>
                        <div className="space-y-3">
                            {top_products.map((item, index) => (
                                <div key={item.product_id} className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                                    <span className="flex size-7 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatNumber(item.total_qty)} sold</p>
                                    </div>
                                    <span className="text-sm font-semibold">{formatCurrency(item.total_sales)}</span>
                                </div>
                            ))}
                            {top_products.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">No sales in this period.</p>
                            )}
                        </div>
                        <div className="mt-4 space-y-1">
                            <Link href="/reports/sales" className="block text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                Sales report →
                            </Link>
                            <Link href="/reports/profit-loss" className="block text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                Profit &amp; loss →
                            </Link>
                            <Link href="/reports/expenses" className="block text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                Expenses report →
                            </Link>
                            <Link href="/reports/products" className="block text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                Products report →
                            </Link>
                            <Link href="/reports/customers" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                <ArrowDownRight className="size-3.5" /> Customers →
                            </Link>
                            <Link href="/reports/suppliers" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                <ArrowDownRight className="size-3.5" /> Suppliers →
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Page>
    );
}
