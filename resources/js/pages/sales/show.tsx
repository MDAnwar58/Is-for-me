import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, HandCoins, Printer, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Page } from '@/components/page';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatCurrency, formatDate } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Sale, SaleItem } from '@/types/inventory';

export default function SaleShowPage({ sale }: { sale: Sale }) {
    const { can } = usePermissions();
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: String(sale.due),
        date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
        reference: '',
        note: '',
    });

    const returnForm = useForm({
        items: [] as { product_id: string; quantity: string }[],
        refund_amount: '0',
    });

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/sales/${sale.id}/payments`, {
            preserveScroll: true,
            onSuccess: () => {
                setPayDialogOpen(false);
                reset();
            },
        });
    };

    const toggleReturnItem = (item: SaleItem, checked: boolean) => {
        const items = returnForm.data.items.filter((i) => i.product_id !== String(item.product_id));

        if (checked) {
            items.push({ product_id: String(item.product_id), quantity: String(item.quantity) });
            returnForm.setData('refund_amount', String(Number(sale.due) + Number(item.quantity) * Number(item.unit_price)));
        } else {
            returnForm.setData('refund_amount', String(Number(returnForm.data.refund_amount) - Number(item.quantity) * Number(item.unit_price)));
        }

        returnForm.setData('items', items);
    };

    const updateReturnQty = (productId: string, quantity: string, max: number) => {
        const items = returnForm.data.items.map((i) =>
            i.product_id === productId ? { ...i, quantity: String(Math.min(Number(quantity), max)) } : i,
        );
        const refund = items.reduce((sum, i) => {
            const item = sale.items?.find((s) => String(s.product_id) === i.product_id);

            return sum + Number(i.quantity) * Number(item?.unit_price ?? 0);
        }, 0);
        returnForm.setData({ items, refund_amount: String(Math.min(refund, Number(sale.due))) });
    };

    const submitReturn = (e: React.FormEvent) => {
        e.preventDefault();
        returnForm.post(`/sales/${sale.id}/return`, {
            preserveScroll: true,
            onSuccess: () => {
                setReturnDialogOpen(false);
                returnForm.reset();
            },
        });
    };

    return (
        <Page
            title={sale.invoice_no}
            description={`Sale to ${sale.customer?.name ?? 'Walk-in'} on ${formatDate(sale.date)}`}
            breadcrumbs={[
                { title: 'Sales', href: '/sales' },
                { title: sale.invoice_no, href: `/sales/${sale.id}` },
            ]}
            actions={
                <>
                    {can('manage payments') && Number(sale.due) > 0 && (
                        <Button onClick={() => setPayDialogOpen(true)} className="cursor-pointer rounded-full shadow-3d">
                            <HandCoins className="size-4" />
                            Receive Payment
                        </Button>
                    )}
                    {can('manage sales') && (
                        <Button variant="outline" className="cursor-pointer" onClick={() => setReturnDialogOpen(true)}>
                            <RotateCcw className="size-4" />
                            Return Items
                        </Button>
                    )}
                    <Button asChild variant="outline" className="cursor-pointer">
                        <a href={`/sales/${sale.id}/invoice`} target="_blank">
                            <Printer className="size-4" />
                            Invoice PDF
                        </a>
                    </Button>
                    <Button asChild variant="ghost" className="cursor-pointer">
                        <Link href="/sales">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                </>
            }
        >
            <Head title={sale.invoice_no} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="tilt-card rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Total</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(sale.total)}</p>
                    <p className="text-xs text-white/70">Subtotal {formatCurrency(sale.subtotal)}</p>
                </div>
                <div className="tilt-card rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Paid</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(sale.paid)}</p>
                </div>
                <div className="tilt-card rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Due</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(sale.due)}</p>
                </div>
                <div className="tilt-card flex flex-col justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Payment Status</p>
                    <div className="mt-2">
                        <StatusBadge status={sale.payment_status} className="bg-white/20 text-white ring-white/30" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="shadow-3d lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3 text-right">Qty</th>
                                        <th className="px-4 py-3 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sale.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 font-medium">{item.product?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/30">
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium">Subtotal</td>
                                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sale.subtotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Discount</td>
                                        <td className="px-4 py-2 text-right">- {formatCurrency(sale.discount)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Tax</td>
                                        <td className="px-4 py-2 text-right">+ {formatCurrency(sale.tax)}</td>
                                    </tr>
                                    <tr className="bg-muted/30">
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold">Grand Total</td>
                                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(sale.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="shadow-3d">
                        <CardHeader>
                            <CardTitle className="text-base">Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {sale.payments?.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                                            <p className="text-xs capitalize text-muted-foreground">
                                                {payment.payment_method} · {formatDate(payment.date)}
                                            </p>
                                        </div>
                                        <StatusBadge status="paid" />
                                    </div>
                                ))}
                                {!sale.payments?.length && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">No payments yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {sale.note && (
                        <Card className="shadow-3d">
                            <CardHeader>
                                <CardTitle className="text-base">Note</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{sale.note}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Payment dialog */}
            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Receive Payment</DialogTitle>
                        <DialogDescription>
                            Remaining due: {formatCurrency(sale.due)}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitPayment} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="pay-amount">Amount</Label>
                                <Input
                                    id="pay-amount"
                                    type="number"
                                    min="0.01"
                                    max={Number(sale.due)}
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="pay-date">Date</Label>
                                <Input id="pay-date" type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                            </div>
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
                        <div>
                            <Label htmlFor="pay-reference">Reference</Label>
                            <Input id="pay-reference" value={data.reference} onChange={(e) => setData('reference', e.target.value)} placeholder="Transaction ID (optional)" />
                        </div>
                        <InputError message={errors.amount} className="mt-1" />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPayDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <HandCoins className="size-4" />
                                {processing ? 'Processing...' : 'Confirm Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Return dialog */}
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Return Items</DialogTitle>
                        <DialogDescription>
                            Select items to return. Stock will be restored automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReturn} className="space-y-4">
                        <div className="space-y-2">
                            {sale.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3">
                                    <input
                                        type="checkbox"
                                        className="size-4 cursor-pointer accent-indigo-600"
                                        checked={returnForm.data.items.some((i) => i.product_id === String(item.product_id))}
                                        onChange={(e) => toggleReturnItem(item, e.target.checked)}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.product?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Qty {item.quantity} × {formatCurrency(item.unit_price)}
                                        </p>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={item.quantity}
                                        className="h-8 w-20"
                                        value={
                                            returnForm.data.items.find((i) => i.product_id === String(item.product_id))?.quantity ?? '0'
                                        }
                                        disabled={!returnForm.data.items.some((i) => i.product_id === String(item.product_id))}
                                        onChange={(e) => updateReturnQty(String(item.product_id), e.target.value, Number(item.quantity))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <Label htmlFor="refund">Refund Amount</Label>
                            <Input id="refund" type="number" min="0" step="0.01" value={returnForm.data.refund_amount} onChange={(e) => returnForm.setData('refund_amount', e.target.value)} />
                            <InputError message={returnForm.errors.refund_amount} className="mt-1" />
                            <InputError message={returnForm.errors.items} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setReturnDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={returnForm.processing || returnForm.data.items.length === 0}>
                                <RotateCcw className="size-4" />
                                {returnForm.processing ? 'Processing...' : 'Process Return'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
