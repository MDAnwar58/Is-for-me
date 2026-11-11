import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Page } from '@/components/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Product, Supplier } from '@/types/inventory';

type Props = {
    suppliers: Pick<Supplier, 'id' | 'name'>[];
    products: (Product & { category?: { id: number; name: string } | null })[];
};

type CartItem = {
    product_id: string;
    quantity: string;
    unit_cost: string;
};

export default function PurchasesCreate({ suppliers, products }: Props) {
    const { can } = usePermissions();

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        date: new Date().toISOString().slice(0, 10),
        items: [] as CartItem[],
        discount: '0',
        tax: '0',
        paid: '0',
        payment_method: 'cash',
        note: '',
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQty, setSelectedQty] = useState('1');
    const [selectedCost, setSelectedCost] = useState('');

    const addItem = () => {
        if (!selectedProduct || !selectedQty || Number(selectedQty) <= 0) {
            return;
        }

        const cost = selectedCost || String(products.find((p) => String(p.id) === selectedProduct)?.cost_price ?? 0);

        setData('items', [
            ...data.items,
            { product_id: selectedProduct, quantity: selectedQty, unit_cost: cost },
        ]);
        setSelectedProduct('');
        setSelectedQty('1');
        setSelectedCost('');
    };

    const updateItem = (index: number, field: keyof CartItem, value: string) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const totals = useMemo(() => {
        const subtotal = data.items.reduce(
            (sum, item) => sum + Number(item.quantity) * Number(item.unit_cost),
            0,
        );
        const discount = Number(data.discount) || 0;
        const tax = Number(data.tax) || 0;
        const total = subtotal - discount + tax;

        return { subtotal, discount, tax, total };
    }, [data.items, data.discount, data.tax]);

    const handleProductSelect = (value: string) => {
        setSelectedProduct(value);
        const product = products.find((p) => String(p.id) === value);
        setSelectedCost(product ? String(product.cost_price) : '');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/purchases');
    };

    if (!can('manage purchases')) {
        return (
            <Page title="Purchases">
                <Head title="Purchases" />
                <p className="text-muted-foreground">You don't have permission to create purchases.</p>
            </Page>
        );
    }

    return (
        <Page
            title="New Purchase"
            description="Stock increases automatically when the purchase is saved"
            breadcrumbs={[
                { title: 'Purchases', href: '/purchases' },
                { title: 'New Purchase', href: '/purchases/create' },
            ]}
        >
            <Head title="New Purchase" />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Supplier & meta */}
                    <Card className="shadow-3d">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingBag className="size-4 text-amber-500" />
                                Purchase Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                                <Label>Supplier</Label>
                                <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Walk-in (no supplier)</SelectItem>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.supplier_id} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                                <InputError message={errors.date} className="mt-1" />
                            </div>
                            <div>
                                <Label>Payment Method</Label>
                                <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="mobile">Mobile Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product picker */}
                    <Card className="shadow-3d">
                        <CardHeader>
                            <CardTitle className="text-base">Add Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-[1fr_110px_140px_auto]">
                                <div>
                                    <Label>Product</Label>
                                    <Select value={selectedProduct} onValueChange={handleProductSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search product..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku}) Â· stock {formatNumber(product.stock_qty)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="qty">Quantity</Label>
                                    <Input id="qty" type="number" min="0.01" step="0.01" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="cost">Unit Cost</Label>
                                    <Input id="cost" type="number" min="0" step="0.01" value={selectedCost} onChange={(e) => setSelectedCost(e.target.value)} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="button" variant="outline" className="h-10 cursor-pointer" onClick={addItem}>
                                        <Plus className="size-4" />
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[520px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                                            <th className="py-2 pr-3">Product</th>
                                            <th className="w-24 py-2 pr-3">Qty</th>
                                            <th className="w-32 py-2 pr-3">Unit Cost</th>
                                            <th className="w-28 py-2 pr-3 text-right">Total</th>
                                            <th className="w-10 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data.items.map((item, index) => {
                                            const product = products.find((p) => String(p.id) === item.product_id);
                                            const lineTotal = Number(item.quantity) * Number(item.unit_cost);

                                            return (
                                                <tr key={index}>
                                                    <td className="py-2 pr-3 font-medium">{product?.name ?? 'â€”'}</td>
                                                    <td className="py-2 pr-3">
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </td>
                                                    <td className="py-2 pr-3">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unit_cost}
                                                            onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </td>
                                                    <td className="py-2 pr-3 text-right font-medium">{formatCurrency(lineTotal)}</td>
                                                    <td className="py-2">
                                                        <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => removeItem(index)}>
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {data.items.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                                    No items yet â€” select a product above
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <InputError message={errors.items} className="mt-1" />
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                    <Card className="shadow-3d">
                        <CardHeader>
                            <CardTitle className="text-base">Totals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-muted-foreground">Discount</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    className="h-8 w-32 text-right"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-muted-foreground">Tax</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.tax}
                                    onChange={(e) => setData('tax', e.target.value)}
                                    className="h-8 w-32 text-right"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-muted-foreground">Paid Now</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.paid}
                                    onChange={(e) => setData('paid', e.target.value)}
                                    className="h-8 w-32 text-right"
                                />
                            </div>
                            <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(totals.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Due</span>
                                <span className={Number(totals.total) - Number(data.paid) > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : 'font-semibold text-emerald-600 dark:text-emerald-400'}>
                                    {formatCurrency(totals.total - Number(data.paid))}
                                </span>
                            </div>
                            <div>
                                <Label htmlFor="note">Note</Label>
                                <Input id="note" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Optional note" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1 cursor-pointer" disabled={processing || data.items.length === 0}>
                            <Save className="size-4" />
                            {processing ? 'Saving...' : 'Save Purchase'}
                        </Button>
                        <Button asChild variant="outline" className="cursor-pointer">
                            <Link href="/purchases">
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>
            </form>
        </Page>
    );
}
