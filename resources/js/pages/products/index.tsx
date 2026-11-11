import { Link, router, usePage } from '@inertiajs/react';
import { Package, PackagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Brand, Category, Paginated, Product } from '@/types/inventory';

type Props = {
    products: Paginated<Product>;
    filters: { search?: string; category_id?: string; brand_id?: string; status?: string };
    categories: Pick<Category, 'id' | 'name'>[];
    brands: Pick<Brand, 'id' | 'name'>[];
};

export default function ProductsIndex({ products, filters, categories, brands }: Props) {
    const { can } = usePermissions();
    const page = usePage();
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const flash = page.props.flash as { success?: string };

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        params.delete('page');
        router.get('/products', Object.fromEntries(params), {
            preserveState: true,
            only: ['products', 'filters'],
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        router.delete(`/products/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <Page
            title="Products"
            description={`${products.total} products in your catalog`}
            breadcrumbs={[{ title: 'Products', href: '/products' }]}
            actions={
                can('manage products') ? (
                    <Button asChild className="cursor-pointer rounded-full shadow-3d">
                        <Link href="/products/create">
                            <Plus className="size-4" />
                            New Product
                        </Link>
                    </Button>
                ) : undefined
            }
        >
            {flash?.success && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {flash.success}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <SearchInput value={filters.search} placeholder="Search name, SKU, barcode..." />
                <Select value={filters.category_id ?? ''} onValueChange={(v) => updateFilter('category_id', v)}>
                    <SelectTrigger className="h-9 w-44">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filters.brand_id ?? ''} onValueChange={(v) => updateFilter('brand_id', v)}>
                    <SelectTrigger className="h-9 w-40">
                        <SelectValue placeholder="All brands" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All brands</SelectItem>
                        {brands.map((brand) => (
                            <SelectItem key={brand.id} value={String(brand.id)}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filters.status ?? ''} onValueChange={(v) => updateFilter('status', v)}>
                    <SelectTrigger className="h-9 w-36">
                        <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="low">Low stock</SelectItem>
                        <SelectItem value="out">Out of stock</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.data.map((product) => {
                    const stock = Number(product.stock_qty);
                    const stockStatus = stock <= 0 ? 'out' : stock <= Number(product.min_stock) ? 'low' : 'ok';

                    return (
                        <div
                            key={product.id}
                            className="tilt-card group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-3d animate-fade-up"
                            style={{
                                ['--tilt-x-hover' as string]: '-2deg',
                                ['--tilt-y-hover' as string]: '4deg',
                                ['--lift-hover' as string]: '10px',
                            }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-500 dark:text-indigo-400" style={{ transform: 'translateZ(20px)' }}>
                                    {product.image ? (
                                        <img
                                            src={`/storage/${product.image}`}
                                            alt={product.name}
                                            className="size-12 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <Package className="size-6" />
                                    )}
                                </div>
                                <StatusBadge status={stockStatus} kind="stock" />
                            </div>

                            <Link href={`/products/${product.id}/edit`} className="mt-3 block">
                                <h3 className="line-clamp-1 font-semibold hover:text-indigo-500">{product.name}</h3>
                            </Link>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {product.sku}
                                {product.category ? ` · ${product.category.name}` : ''}
                            </p>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                                    <p className="text-[10px] text-muted-foreground">Stock</p>
                                    <p className="text-sm font-semibold">{formatNumber(stock)}</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                                    <p className="text-[10px] text-muted-foreground">Cost</p>
                                    <p className="text-sm font-semibold">{formatCurrency(product.cost_price)}</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                                    <p className="text-[10px] text-muted-foreground">Price</p>
                                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(product.discount_price && Number(product.discount_price) > 0 ? product.discount_price : product.selling_price)}
                                    </p>
                                </div>
                            </div>

                            {can('manage products') && (
                                <div className="mt-4 flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="h-8 flex-1 cursor-pointer">
                                        <Link href={`/products/${product.id}/edit`}>
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 cursor-pointer text-destructive hover:text-destructive"
                                        onClick={() => setDeleteTarget(product)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {products.data.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
                    <PackagePlus className="size-12 text-muted-foreground/40" />
                    <p className="mt-4 font-medium">No products found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                    {can('manage products') && (
                        <Button asChild className="mt-4 cursor-pointer">
                            <Link href="/products/create">
                                <Plus className="size-4" />
                                Add your first product
                            </Link>
                        </Button>
                    )}
                </div>
            )}

            <Pagination pagination={products} />

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete product?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove "{deleteTarget?.name}". This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            <Trash2 className="size-4" />
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
