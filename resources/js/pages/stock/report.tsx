import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileDown } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Paginated, Product } from '@/types/inventory';

type Props = {
    products: Paginated<Product & { category?: { id: number; name: string } }>;
};

export default function StockReport({ products }: Props) {
    const totalStockValue = products.data.reduce((s, p) => s + Number(p.stock_qty) * Number(p.cost_price), 0);
    const totalRetailValue = products.data.reduce((s, p) => s + Number(p.stock_qty) * Number(p.selling_price), 0);

    return (
        <Page
            title="Stock Report"
            description="Current stock levels and valuation"
            breadcrumbs={[{ title: 'Stock', href: '/stock' }, { title: 'Report' }]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <a href="/stock/export">
                        <FileDown className="size-4" />
                        Export CSV
                    </a>
                </Button>
            }
        >
            <Head title="Stock Report" />

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground">Products</p>
                        <p className="text-2xl font-bold">{products.total}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground">Stock Value (Cost)</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalStockValue)}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground">Retail Value</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalRetailValue)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[760px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-right">Min</th>
                            <th className="px-4 py-3 text-right">Cost</th>
                            <th className="px-4 py-3 text-right">Selling</th>
                            <th className="px-4 py-3 text-right">Value</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.data.map((product) => {
                            const qty = Number(product.stock_qty);
                            const value = qty * Number(product.cost_price);

                            return (
                                <tr key={product.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <Link href="/products" className="font-medium hover:text-indigo-500">
                                            {product.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatNumber(product.stock_qty)}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">{formatNumber(product.min_stock)}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(product.cost_price)}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(product.selling_price)}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(value)}</td>
                                    <td className="px-4 py-3">
                                        {qty <= 0 ? (
                                            <Badge variant="destructive">Out</Badge>
                                        ) : qty <= Number(product.min_stock) ? (
                                            <Badge variant="warning">Low</Badge>
                                        ) : (
                                            <Badge>OK</Badge>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={products} />

            <div className="flex justify-center">
                <Link href="/stock" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    <ArrowLeft className="size-4" /> Back to movements
                </Link>
            </div>
        </Page>
    );
}
