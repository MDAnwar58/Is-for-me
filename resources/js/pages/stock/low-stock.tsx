import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, PackageSearch } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import type { Paginated, Product } from '@/types/inventory';

type Props = {
    products: Paginated<Product & { category?: { id: number; name: string } }>;
};

export default function StockLowStock({ products }: Props) {
    return (
        <Page
            title="Low Stock Alerts"
            description="Products at or below their minimum stock level"
            breadcrumbs={[{ title: 'Stock', href: '/stock' }, { title: 'Low Stock' }]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <a href="/stock/export">Export CSV</a>
                </Button>
            }
        >
            <Head title="Low Stock" />

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Low Stock Items</p>
                            <p className="text-lg font-bold">{products.total}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-right">Min Stock</th>
                            <th className="px-4 py-3 text-right">Need More</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.data.map((product) => {
                            const qty = Number(product.stock_qty);
                            const min = Number(product.min_stock);
                            const need = Math.max(0, min - qty);

                            return (
                                <tr key={product.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <Link href="/products" className="font-medium hover:text-indigo-500">
                                            {product.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                                        {formatNumber(product.stock_qty)}
                                    </td>
                                    <td className="px-4 py-3 text-right">{formatNumber(product.min_stock)}</td>
                                    <td className="px-4 py-3 text-right font-medium">{need}</td>
                                    <td className="px-4 py-3">
                                        {qty <= 0 ? (
                                            <Badge variant="destructive">Out of stock</Badge>
                                        ) : (
                                            <Badge variant="warning">Low</Badge>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {products.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                    <PackageSearch className="mx-auto mb-2 size-8 opacity-40" />
                                    All products are well stocked. Nice!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={products} />

            <div className="flex justify-center">
                <Link href="/stock" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    View all stock movements <ArrowRight className="size-4" />
                </Link>
            </div>
        </Page>
    );
}
