import { Head, router } from '@inertiajs/react';
import { FileDown, Package } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Paginated, Product } from '@/types/inventory';

type Props = {
    products: Paginated<Product & { category?: { id: number; name: string } }>;
};

export default function ReportsProducts({ products }: Props) {
    const [search, setSearch] = useState('');

    const runSearch = (value: string) => {
        setSearch(value);
        router.get('/reports/products', { search: value || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <Page
            title="Product Report"
            description="Stock levels and value by product"
            breadcrumbs={[{ title: 'Reports', href: '/reports' }, { title: 'Products' }]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <a href="/reports/export-csv?type=products">
                        <FileDown className="size-4" />
                        CSV
                    </a>
                </Button>
            }
        >
            <Head title="Product Report" />

            <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => runSearch(e.target.value)}
                className="max-w-xs"
            />

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[680px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-right">Cost</th>
                            <th className="px-4 py-3 text-right">Selling</th>
                            <th className="px-4 py-3 text-right">Stock Value</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.data.map((product) => {
                            const qty = Number(product.stock_qty);

                            return (
                                <tr key={product.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                <Package className="size-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatNumber(product.stock_qty)}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(product.cost_price)}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(product.selling_price)}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(qty * Number(product.cost_price))}</td>
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
                        {products.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                    No products found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={products} />
        </Page>
    );
}
