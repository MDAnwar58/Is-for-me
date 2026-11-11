import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, AlertTriangle, FileDown, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDateTime, formatNumber } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Paginated, Product, StockMovement } from '@/types/inventory';

type Props = {
    movements: Paginated<StockMovement>;
    filters: { product_id?: string; type?: string; from?: string; to?: string };
    products: Pick<Product, 'id' | 'name' | 'sku'>[];
    types: { value: string; label: string; direction: number }[];
};

const movementStyles: Record<string, string> = {
    purchase: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    sale: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    sale_return: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    purchase_return: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    adjustment: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    transfer_in: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    transfer_out: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    damaged: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function StockIndex({ movements, products, types }: Props) {
    const { can } = usePermissions();
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);

    const adjust = useForm({
        product_id: '',
        type: 'adjustment',
        quantity: '',
        note: '',
    });

    const transfer = useForm({
        from_product_id: '',
        to_product_id: '',
        quantity: '',
    });

    const submitAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        adjust.post('/stock/adjust', {
            preserveScroll: true,
            onSuccess: () => {
                setAdjustOpen(false);
                adjust.reset();
            },
        });
    };

    const submitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        transfer.post('/stock/transfer', {
            preserveScroll: true,
            onSuccess: () => {
                setTransferOpen(false);
                transfer.reset();
            },
        });
    };

    return (
        <Page
            title="Stock Movements"
            description="Complete history of every stock change"
            breadcrumbs={[{ title: 'Stock', href: '/stock' }]}
            actions={
                can('manage stock') ? (
                    <>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setAdjustOpen(true)}>
                            <SlidersHorizontal className="size-4" />
                            Adjust
                        </Button>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setTransferOpen(true)}>
                            <ArrowUpRight className="size-4" />
                            Transfer
                        </Button>
                        <Button asChild variant="outline" className="cursor-pointer">
                            <a href="/stock/export">
                                <FileDown className="size-4" />
                                Export CSV
                            </a>
                        </Button>
                    </>
                ) : undefined
            }
        >
            <Head title="Stock" />

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Stock In</p>
                            <p className="text-lg font-bold">
                                {formatNumber(movements.data.filter((m) => Number(m.quantity) > 0).reduce((s, m) => s + Number(m.quantity), 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            <ArrowDownRight className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Stock Out</p>
                            <p className="text-lg font-bold">
                                {formatNumber(movements.data.filter((m) => Number(m.quantity) < 0).reduce((s, m) => s + Math.abs(Number(m.quantity)), 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Movement Types</p>
                            <p className="text-lg font-bold">{types.length}</p>
                        </div>
                        <Link href="/stock/low" className="ml-auto text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                            Low stock →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3">Note</th>
                            <th className="px-4 py-3">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {movements.data.map((movement) => {
                            const isIn = Number(movement.quantity) > 0;

                            return (
                                <tr key={movement.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <Link href="/products" className="font-medium hover:text-indigo-500">
                                            {movement.product?.name ?? '—'}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">{movement.product?.sku}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', movementStyles[movement.type])}>
                                            {movement.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className={cn('px-4 py-3 text-right font-semibold', isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                                        {isIn ? '+' : ''}{formatNumber(movement.quantity)}
                                    </td>
                                    <td className="px-4 py-3 text-right">{formatNumber(movement.balance)}</td>
                                    <td className="max-w-52 truncate px-4 py-3 text-muted-foreground">{movement.note ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(movement.created_at)}</td>
                                </tr>
                            );
                        })}
                        {movements.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                    No stock movements found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={movements} />

            {/* Adjust dialog */}
            <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            Record an adjustment or damaged stock. Balance updates automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAdjust} className="space-y-4">
                        <div>
                            <Label>Product</Label>
                            <Select value={adjust.data.product_id} onValueChange={(v) => adjust.setData('product_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={String(product.id)}>
                                            {product.name} ({product.sku})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select value={adjust.data.type} onValueChange={(v) => adjust.setData('type', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                                    <SelectItem value="damaged">Damaged Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="qty">Quantity (reduces stock if damaged)</Label>
                            <Input
                                id="qty"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={adjust.data.quantity}
                                onChange={(e) => adjust.setData('quantity', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="note">Note</Label>
                            <Input id="note" value={adjust.data.note} onChange={(e) => adjust.setData('note', e.target.value)} placeholder="Reason for adjustment" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={adjust.processing}>
                                {adjust.processing ? 'Saving...' : 'Save Adjustment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Transfer dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Stock</DialogTitle>
                        <DialogDescription>
                            Move stock between two products. Both balances update automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitTransfer} className="space-y-4">
                        <div>
                            <Label>From Product</Label>
                            <Select value={transfer.data.from_product_id} onValueChange={(v) => transfer.setData('from_product_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={String(product.id)}>
                                            {product.name} ({product.sku})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>To Product</Label>
                            <Select value={transfer.data.to_product_id} onValueChange={(v) => transfer.setData('to_product_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select destination product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={String(product.id)}>
                                            {product.name} ({product.sku})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="t-qty">Quantity</Label>
                            <Input
                                id="t-qty"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={transfer.data.quantity}
                                onChange={(e) => transfer.setData('quantity', e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={transfer.processing}>
                                {transfer.processing ? 'Transferring...' : 'Transfer Stock'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
