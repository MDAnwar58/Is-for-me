import { Head, Link } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BadgeDollarSign,
    Boxes,
    Package,
    PackageSearch,
    ReceiptText,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    Wallet,
    Warehouse,
} from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatNumber, timeAgo } from '@/lib/format';
import { dashboard } from '@/routes';
import type { Purchase, Sale, StockMovement, Product } from '@/types/inventory';
import AppContainer from '@/layouts/app/app-container';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
);

type Props = {
    stats: {
        total_products: number;
        total_stock: number;
        stock_value: number;
        low_stock_count: number;
        out_of_stock_count: number;
        sales_today: number;
        sales_total: number;
        purchases_today: number;
        purchases_total: number;
        expenses_total: number;
        profit: number;
        customer_dues: number;
        supplier_dues: number;
    };
    charts: {
        monthly: { label: string; sales: number; purchases: number }[];
    };
    recent_sales: Sale[];
    recent_purchases: Purchase[];
    recent_movements: StockMovement[];
    low_stock_products: Product[];
};

export default function DashboardIndex({
    stats,
    charts,
    recent_sales,
    recent_purchases,
    recent_movements,
    low_stock_products,
}: Props) {
    const monthlyChart = {
        labels: charts.monthly.map((m) => m.label),
        datasets: [
            {
                label: 'Sales',
                data: charts.monthly.map((m) => m.sales),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#6366f1',
                borderWidth: 3,
            },
            {
                label: 'Purchases',
                data: charts.monthly.map((m) => m.purchases),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
                borderWidth: 3,
            },
        ],
    };

    const lowStockChart = {
        labels: ['In Stock', 'Low', 'Out of Stock'],
        datasets: [
            {
                data: [
                    stats.total_products - stats.low_stock_count - stats.out_of_stock_count,
                    stats.low_stock_count,
                    stats.out_of_stock_count,
                ],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 6,
            },
        ],
    };

    return (
        <AppContainer
            breadcrumbs={[
                {
                    title: 'Dashboard',
                    href: dashboard(),
                },
            ]}
        >
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Products"
                        value={stats.total_products}
                        icon={Package}
                        color="indigo"
                        trend="flat"
                        trendValue={`${stats.total_stock} units in stock`}
                    />
                    <StatCard
                        title="Stock Value"
                        value={stats.stock_value}
                        icon={Warehouse}
                        color="sky"
                        trend="flat"
                        trendValue={`${formatNumber(stats.total_stock)} total units`}
                    />
                    <StatCard
                        title="Today's Sales"
                        value={stats.sales_today}
                        icon={ShoppingCart}
                        color="emerald"
                        trend="up"
                        trendValue="Today"
                    />
                    <StatCard
                        title="Total Sales"
                        value={stats.sales_total}
                        icon={TrendingUp}
                        color="violet"
                        trend="up"
                        trendValue="All time"
                    />
                    <StatCard
                        title="Total Purchases"
                        value={stats.purchases_total}
                        icon={ShoppingBag}
                        color="amber"
                        trend="up"
                        trendValue="All time"
                    />
                    <StatCard
                        title="Total Expenses"
                        value={stats.expenses_total}
                        icon={Wallet}
                        color="rose"
                        trend="down"
                        trendValue="All time"
                    />
                    <StatCard
                        title="Net Profit"
                        value={stats.profit}
                        icon={BadgeDollarSign}
                        color="emerald"
                        trend="up"
                        trendValue="Est. profit"
                    />
                    <StatCard
                        title="Low Stock Alerts"
                        value={stats.low_stock_count + stats.out_of_stock_count}
                        icon={AlertTriangle}
                        color="amber"
                        trend="down"
                        trendValue={`${stats.out_of_stock_count} out of stock`}
                    />
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="tilt-card shadow-3d lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="size-4 text-indigo-500" />
                                Sales & Purchases (6 months)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <Line
                                    data={monthlyChart}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: { usePointStyle: true, boxWidth: 8 },
                                            },
                                        },
                                        scales: {
                                            y: {
                                                grid: { color: 'rgba(148, 163, 184, 0.12)' },
                                                ticks: { callback: (value) => formatCurrency(Number(value)).replace('.00', '') },
                                            },
                                            x: {
                                                grid: { display: false },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="tilt-card shadow-3d">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <PackageSearch className="size-4 text-amber-500" />
                                Stock Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-56">
                                <Doughnut
                                    data={lowStockChart}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '65%',
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                                <div className="rounded-xl bg-emerald-500/10 px-3 py-2">
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {stats.total_products - stats.low_stock_count - stats.out_of_stock_count}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Healthy</p>
                                </div>
                                <div className="rounded-xl bg-rose-500/10 px-3 py-2">
                                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{stats.out_of_stock_count}</p>
                                    <p className="text-xs text-muted-foreground">Out of stock</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent sales & purchases */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="shadow-3d">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="size-4 text-emerald-500" />
                                Recent Sales
                            </CardTitle>
                            <Link href="/sales" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recent_sales.map((sale) => (
                                    <Link
                                        key={sale.id}
                                        href={`/sales/${sale.id}`}
                                        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <ReceiptText className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{sale.invoice_no}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sale.customer?.name ?? 'Walk-in'} · {timeAgo(sale.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold">{formatCurrency(sale.total)}</span>
                                            <StatusBadge status={sale.payment_status} />
                                        </div>
                                    </Link>
                                ))}
                                {recent_sales.length === 0 && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">No sales yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-3d">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingBag className="size-4 text-amber-500" />
                                Recent Purchases
                            </CardTitle>
                            <Link href="/purchases" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recent_purchases.map((purchase) => (
                                    <Link
                                        key={purchase.id}
                                        href={`/purchases/${purchase.id}`}
                                        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Boxes className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{purchase.invoice_no}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {purchase.supplier?.name ?? '—'} · {timeAgo(purchase.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold">{formatCurrency(purchase.total)}</span>
                                            <StatusBadge status={purchase.payment_status} />
                                        </div>
                                    </Link>
                                ))}
                                {recent_purchases.length === 0 && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">No purchases yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stock movements & low stock */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="shadow-3d">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ArrowDownRight className="size-4 text-sky-500" />
                                Recent Stock Movements
                            </CardTitle>
                            <Link href="/stock" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recent_movements.map((movement) => {
                                    const isIn = Number(movement.quantity) > 0;

                                    return (
                                        <div key={movement.id} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex size-9 items-center justify-center rounded-lg ${isIn
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                        }`}
                                                >
                                                    {isIn ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{movement.product?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {movement.type.replace('_', ' ')} · balance {formatNumber(movement.balance)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-sm font-semibold ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                            >
                                                {isIn ? '+' : ''}{formatNumber(movement.quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-3d">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="size-4 text-amber-500" />
                                Low Stock Products
                            </CardTitle>
                            <Link href="/stock/low" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {low_stock_products.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.category?.name ?? '—'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusBadge
                                                status={Number(product.stock_qty) <= 0 ? 'out' : 'low'}
                                                kind="stock"
                                            />
                                            <span className="text-sm font-semibold">{formatNumber(product.stock_qty)}</span>
                                        </div>
                                    </div>
                                ))}
                                {low_stock_products.length === 0 && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        All products are sufficiently stocked
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppContainer>
    );
}
