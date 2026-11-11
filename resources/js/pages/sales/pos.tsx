import { Head, useForm } from '@inertiajs/react';
import { Banknote, CreditCard, Minus, Package, Plus, ScanBarcode, Smartphone, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Page } from '@/components/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import type { Customer, Product } from '@/types/inventory';

type Props = {
    products: (Product & { category?: { id: number; name: string } | null })[];
    customers: Pick<Customer, 'id' | 'name'>[];
};

type CartItem = {
    product: Product;
    quantity: number;
    unit_price: number;
    discount: number;
};

export default function SalesPos({ products, customers }: Props) {
    const { can } = usePermissions();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const barcodeRef = useRef<HTMLInputElement>(null);
    const [scanValue, setScanValue] = useState('');

    const { data, setData, post, transform, processing, errors } = useForm({
        customer_id: '',
        discount: '0',
        tax: '0',
        paid: '',
        payment_method: 'cash',
        note: '',
        date: new Date().toISOString().slice(0, 10),
        items: [] as { product_id: number; quantity: number; unit_price: number; discount: number }[],
    });

    const categories = useMemo(() => {
        const map = new Map<string, string>();
        products.forEach((p) => {
            if (p.category) {
                map.set(String(p.category.id), p.category.name);
            }
        });

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                !scanValue ||
                product.name.toLowerCase().includes(scanValue.toLowerCase()) ||
                product.sku.toLowerCase().includes(scanValue.toLowerCase()) ||
                (product.barcode ?? '').includes(scanValue);
            const matchesCategory = !selectedCategory || String(product.category_id) === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, scanValue, selectedCategory]);

    const totals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        const discount = Number(data.discount) || 0;
        const tax = Number(data.tax) || 0;
        const total = subtotal - discount + tax;

        return { subtotal, discount, tax, total };
    }, [cart, data.discount, data.tax]);

    const addToCart = (product: Product) => {
        if (Number(product.stock_qty) <= 0) {
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);

            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.stock_qty)) }
                        : item,
                );
            }

            return [
                ...prev,
                {
                    product,
                    quantity: 1,
                    unit_price: Number(
                        product.discount_price && Number(product.discount_price) > 0
                            ? product.discount_price
                            : product.selling_price,
                    ),
                    discount: 0,
                },
            ];
        });
    };

    const updateQty = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.product.id !== productId) {
                        return item;
                    }

                    return {
                        ...item,
                        quantity: Math.min(
                            Math.max(1, item.quantity + delta),
                            Number(item.product.stock_qty),
                        ),
                    };
                })
                .filter((item) => item.quantity > 0),
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setData({
            customer_id: '',
            discount: '0',
            tax: '0',
            paid: '',
            payment_method: 'cash',
            note: '',
        });
    };

    const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const product = products.find(
                (p) => p.barcode && p.barcode === scanValue.trim(),
            );

            if (product) {
                addToCart(product);
            }

            setScanValue('');
        }
    };

    useEffect(() => {
        if (checkoutOpen && barcodeRef.current) {
            barcodeRef.current.focus();
        }
    }, [checkoutOpen]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((formData) => ({
            ...formData,
            date: new Date().toISOString().slice(0, 10),
            paid: formData.paid || String(totals.total),
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount,
            })),
        }));
        post('/sales', {
            onSuccess: () => {
                clearCart();
                setCheckoutOpen(false);
            },
        });
    };

    const change = Math.max(0, Number(data.paid) - totals.total);

    if (!can('manage sales')) {
        return (
            <Page title="POS">
                <Head title="POS" />
                <p className="text-muted-foreground">You don't have permission to use the POS.</p>
            </Page>
        );
    }

    return (
        <Page
            title="Point of Sale"
            description="Fast sales with barcode scanning and instant stock sync"
            breadcrumbs={[{ title: 'POS', href: '/pos' }]}
        >
            <Head title="POS" />

            <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
                {/* Products */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-56">
                            <ScanBarcode className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={barcodeRef}
                                value={scanValue}
                                onChange={(e) => setScanValue(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Scan barcode or search..."
                                className="h-11 pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={selectedCategory === '' ? 'default' : 'outline'}
                                size="sm"
                                className="h-10 cursor-pointer rounded-full"
                                onClick={() => setSelectedCategory('')}
                            >
                                All
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-10 cursor-pointer rounded-full"
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const out = Number(product.stock_qty) <= 0;
                            const low = !out && Number(product.stock_qty) <= Number(product.min_stock);

                            return (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => addToCart(product)}
                                    disabled={out}
                                    className={cn(
                                        'tilt-card group relative overflow-hidden rounded-xl border bg-card p-3 text-left shadow-3d transition-all',
                                        'hover:border-indigo-500/60 hover:bg-indigo-500/5',
                                        out && 'cursor-not-allowed opacity-40',
                                    )}
                                    style={{
                                        ['--tilt-x-hover' as string]: '-3deg',
                                        ['--tilt-y-hover' as string]: '4deg',
                                        ['--lift-hover' as string]: '8px',
                                    }}
                                >
                                    <div className="flex h-16 items-center justify-center rounded-lg bg-muted/50">
                                        {product.image ? (
                                            <img src={`/storage/${product.image}`} alt={product.name} className="h-full w-full rounded-lg object-cover" />
                                        ) : (
                                            <Package className="size-7 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <p className="mt-2 line-clamp-1 text-sm font-medium">{product.name}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{product.sku}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(product.discount_price && Number(product.discount_price) > 0 ? product.discount_price : product.selling_price)}
                                        </span>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                out
                                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                    : low
                                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                                            )}
                                        >
                                            {formatNumber(product.stock_qty)}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <p className="col-span-full py-16 text-center text-muted-foreground">
                                No products match your search
                            </p>
                        )}
                    </div>
                </div>

                {/* Cart */}
                <div className="lg:sticky lg:top-4 lg:self-start">
                    <Card className="overflow-hidden shadow-3d-lg">
                        <div className="border-b bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Cart</h2>
                                {cart.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 cursor-pointer gap-1 px-2 text-xs text-white/90 hover:bg-white/10 hover:text-white"
                                        onClick={clearCart}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[380px] space-y-2 overflow-y-auto p-3 scrollbar-thin">
                            {cart.length === 0 && (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Cart is empty
                                    <br />
                                    <span className="text-xs">Scan or click products to add</span>
                                </p>
                            )}
                            {cart.map((item) => (
                                <div key={item.product.id} className="flex items-center gap-2 rounded-xl border p-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(item.unit_price)} each
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" className="size-7 cursor-pointer" onClick={() => updateQty(item.product.id, -1)}>
                                            <Minus className="size-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-7 cursor-pointer"
                                            onClick={() => updateQty(item.product.id, 1)}
                                            disabled={item.quantity >= Number(item.product.stock_qty)}
                                        >
                                            <Plus className="size-3" />
                                        </Button>
                                    </div>
                                    <span className="w-20 text-right text-sm font-semibold">
                                        {formatCurrency(item.quantity * item.unit_price)}
                                    </span>
                                    <Button variant="ghost" size="icon" className="size-7 cursor-pointer text-destructive" onClick={() => removeFromCart(item.product.id)}>
                                        <X className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t p-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(totals.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-muted-foreground">Discount</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    className="h-8 w-28 text-right"
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
                                    className="h-8 w-28 text-right"
                                />
                            </div>
                            <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
                                <span>Total</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(totals.total)}</span>
                            </div>
                            <Button
                                className="mt-3 w-full cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-6 text-base font-bold shadow-3d hover:from-indigo-500 hover:to-violet-500"
                                disabled={cart.length === 0}
                                onClick={() => setCheckoutOpen(true)}
                            >
                                Checkout
                                <CreditCard className="size-5" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Checkout dialog */}
            {checkoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-3d-lg animate-fade-up">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Checkout</h2>
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => setCheckoutOpen(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Customer</Label>
                                <Select value={data.customer_id} onValueChange={(v) => setData('customer_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Walk-in customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Walk-in customer</SelectItem>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={String(customer.id)}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Payment Method</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'cash', label: 'Cash', icon: Banknote },
                                        { value: 'bank', label: 'Bank', icon: CreditCard },
                                        { value: 'mobile', label: 'Mobile', icon: Smartphone },
                                    ].map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => setData('payment_method', method.value)}
                                            className={cn(
                                                'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-all',
                                                data.payment_method === method.value
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 shadow-md dark:text-indigo-400'
                                                    : 'hover:border-indigo-300',
                                            )}
                                        >
                                            <method.icon className="size-5" />
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="paid">Amount Paid</Label>
                                <Input
                                    id="paid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.paid}
                                    onChange={(e) => setData('paid', e.target.value)}
                                    placeholder="Enter paid amount"
                                    className="h-11 text-lg font-semibold"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-bold">{formatCurrency(totals.total)}</span>
                            </div>
                            {change > 0 && (
                                <div className="flex justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-sm">
                                    <span className="text-emerald-600 dark:text-emerald-400">Change</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(change)}</span>
                                </div>
                            )}
                            {Number(data.paid) < totals.total && (
                                <div className="flex justify-between rounded-lg bg-amber-500/10 px-3 py-2 text-sm">
                                    <span className="text-amber-600 dark:text-amber-400">Due</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totals.total - Number(data.paid))}</span>
                                </div>
                            )}

                            <InputError message={errors.items} className="mt-1" />

                            <Button
                                type="submit"
                                disabled={processing || cart.length === 0}
                                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-5 text-base font-bold shadow-3d hover:from-emerald-500 hover:to-teal-500"
                            >
                                {processing ? 'Processing...' : `Complete Sale Â· ${formatCurrency(totals.total)}`}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </Page>
    );
}
