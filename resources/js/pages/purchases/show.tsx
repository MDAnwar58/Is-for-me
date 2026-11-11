import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, HandCoins, Printer } from 'lucide-react';
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
import type { Purchase } from '@/types/inventory';

export default function PurchaseShowPage({ purchase }: { purchase: Purchase }) {
    const { can } = usePermissions();
    const [payDialogOpen, setPayDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: String(purchase.due),
        date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
        reference: '',
        note: '',
    });

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/purchases/${purchase.id}/payments`, {
            preserveScroll: true,
            onSuccess: () => {
                setPayDialogOpen(false);
                reset();
            },
        });
    };

    return (
        <Page
            title={purchase.invoice_no}
            description={`Purchase from ${purchase.supplier?.name ?? '—'} on ${formatDate(purchase.date)}`}
            breadcrumbs={[
                { title: 'Purchases', href: '/purchases' },
                { title: purchase.invoice_no, href: `/purchases/${purchase.id}` },
            ]}
            actions={
                <>
                    {can('manage payments') && Number(purchase.due) > 0 && (
                        <Button onClick={() => setPayDialogOpen(true)} className="cursor-pointer rounded-full shadow-3d">
                            <HandCoins className="size-4" />
                            Make Payment
                        </Button>
                    )}
                    <Button asChild variant="outline" className="cursor-pointer">
                        <a href={`/purchases/${purchase.id}/invoice`} target="_blank">
                            <Printer className="size-4" />
                            Invoice PDF
                        </a>
                    </Button>
                    <Button asChild variant="ghost" className="cursor-pointer">
                        <Link href="/purchases">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                </>
            }
        >
            <Head title={purchase.invoice_no} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="tilt-card rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Total</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(purchase.total)}</p>
                    <p className="text-xs text-white/70">Subtotal {formatCurrency(purchase.subtotal)}</p>
                </div>
                <div className="tilt-card rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Paid</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(purchase.paid)}</p>
                </div>
                <div className="tilt-card rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Due</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(purchase.due)}</p>
                </div>
                <div className="tilt-card flex flex-col justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-3d">
                    <p className="text-sm text-white/80">Payment Status</p>
                    <div className="mt-2">
                        <StatusBadge status={purchase.payment_status} className="bg-white/20 text-white ring-white/30" />
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
                                        <th className="px-4 py-3 text-right">Unit Cost</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {purchase.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 font-medium">{item.product?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.unit_cost)}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/30">
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium">Subtotal</td>
                                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(purchase.subtotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Discount</td>
                                        <td className="px-4 py-2 text-right">- {formatCurrency(purchase.discount)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Tax</td>
                                        <td className="px-4 py-2 text-right">+ {formatCurrency(purchase.tax)}</td>
                                    </tr>
                                    <tr className="bg-muted/30">
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold">Grand Total</td>
                                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(purchase.total)}</td>
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
                                {purchase.payments?.map((payment) => (
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
                                {!purchase.payments?.length && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">No payments yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {purchase.note && (
                        <Card className="shadow-3d">
                            <CardHeader>
                                <CardTitle className="text-base">Note</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{purchase.note}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make Payment</DialogTitle>
                        <DialogDescription>
                            Remaining due: {formatCurrency(purchase.due)}
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
                                    max={Number(purchase.due)}
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
                                <Download className="size-4" />
                                {processing ? 'Processing...' : 'Confirm Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
