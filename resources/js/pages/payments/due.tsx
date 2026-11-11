import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, CreditCard, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
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
import { formatCurrency } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Customer, Supplier } from '@/types/inventory';

type Props = {
    customer_dues: (Customer & { sales_count?: number })[];
    supplier_dues: (Supplier & { purchases_count?: number })[];
};

export default function PaymentsDue({ customer_dues, supplier_dues }: Props) {
    const { can } = usePermissions();
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);

    const receive = useForm({ customer_id: '', date: new Date().toISOString().slice(0, 10), amount: '', payment_method: 'cash', reference: '', note: '' });
    const pay = useForm({ supplier_id: '', date: new Date().toISOString().slice(0, 10), amount: '', payment_method: 'cash', reference: '', note: '' });

    const submitReceive = (e: React.FormEvent) => {
        e.preventDefault();
        receive.post('/payments/receive', {
            preserveScroll: true,
            onSuccess: () => {
                setReceiveOpen(false);
                receive.reset();
            },
        });
    };

    const submitPay = (e: React.FormEvent) => {
        e.preventDefault();
        pay.post('/payments/pay', {
            preserveScroll: true,
            onSuccess: () => {
                setPayOpen(false);
                pay.reset();
            },
        });
    };

    const totalCustomerDues = customer_dues.reduce((s, c) => s + Number(c.balance), 0);
    const totalSupplierDues = supplier_dues.reduce((s, s2) => s + Number(s2.balance), 0);

    return (
        <Page
            title="Outstanding Dues"
            description="Money customers owe you and money you owe suppliers"
            breadcrumbs={[{ title: 'Payments', href: '/payments' }, { title: 'Dues' }]}
        >
            <Head title="Outstanding Dues" />

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Customer dues */}
                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                    <UserRound className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Customers Owe You</h3>
                                    <p className="text-xs text-muted-foreground">{customer_dues.length} customers with balance</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCustomerDues)}</span>
                        </div>

                        <div className="space-y-2">
                            {customer_dues.map((customer) => (
                                <div key={customer.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium">{customer.name}</p>
                                        <p className="text-xs text-muted-foreground">{customer.sales_count ?? 0} sales</p>
                                    </div>
                                    <span className="text-sm font-semibold">{formatCurrency(customer.balance)}</span>
                                </div>
                            ))}
                            {customer_dues.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No outstanding customer balances.</p>}
                        </div>

                        {can('manage payments') && customer_dues.length > 0 && (
                            <Button className="mt-4 w-full cursor-pointer" onClick={() => setReceiveOpen(true)}>
                                <ArrowDownLeft className="size-4" />
                                Receive Payment
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Supplier dues */}
                <Card className="shadow-3d">
                    <CardContent className="pt-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                    <CreditCard className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">You Owe Suppliers</h3>
                                    <p className="text-xs text-muted-foreground">{supplier_dues.length} suppliers with balance</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalSupplierDues)}</span>
                        </div>

                        <div className="space-y-2">
                            {supplier_dues.map((supplier) => (
                                <div key={supplier.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium">{supplier.name}</p>
                                        <p className="text-xs text-muted-foreground">{supplier.purchases_count ?? 0} purchases</p>
                                    </div>
                                    <span className="text-sm font-semibold">{formatCurrency(supplier.balance)}</span>
                                </div>
                            ))}
                            {supplier_dues.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No outstanding supplier balances.</p>}
                        </div>

                        {can('manage payments') && supplier_dues.length > 0 && (
                            <Button variant="outline" className="mt-4 w-full cursor-pointer" onClick={() => setPayOpen(true)}>
                                <ArrowUpRight className="size-4" />
                                Make Payment
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center">
                <Link href="/payments" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    View all payments →
                </Link>
            </div>

            {/* Receive dialog */}
            <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Receive Payment</DialogTitle>
                        <DialogDescription>Record money received from a customer.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReceive} className="space-y-4">
                        <div>
                            <Label>Customer</Label>
                            <Select value={receive.data.customer_id} onValueChange={(v) => receive.setData('customer_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customer_dues.map((customer) => (
                                        <SelectItem key={customer.id} value={String(customer.id)}>
                                            {customer.name} — owes {formatCurrency(customer.balance)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="r-amount">Amount</Label>
                                <Input id="r-amount" type="number" min="0.01" step="0.01" value={receive.data.amount} onChange={(e) => receive.setData('amount', e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="r-date">Date</Label>
                                <Input id="r-date" type="date" value={receive.data.date} onChange={(e) => receive.setData('date', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Method</Label>
                                <Select value={receive.data.payment_method} onValueChange={(v) => receive.setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="r-ref">Reference</Label>
                                <Input id="r-ref" value={receive.data.reference} onChange={(e) => receive.setData('reference', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="r-note">Note</Label>
                            <Input id="r-note" value={receive.data.note} onChange={(e) => receive.setData('note', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setReceiveOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={receive.processing}>
                                {receive.processing ? 'Saving...' : 'Receive Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Pay dialog */}
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make Payment</DialogTitle>
                        <DialogDescription>Record money paid to a supplier.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitPay} className="space-y-4">
                        <div>
                            <Label>Supplier</Label>
                            <Select value={pay.data.supplier_id} onValueChange={(v) => pay.setData('supplier_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supplier_dues.map((supplier) => (
                                        <SelectItem key={supplier.id} value={String(supplier.id)}>
                                            {supplier.name} — owe {formatCurrency(supplier.balance)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="p-amount">Amount</Label>
                                <Input id="p-amount" type="number" min="0.01" step="0.01" value={pay.data.amount} onChange={(e) => pay.setData('amount', e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="p-date">Date</Label>
                                <Input id="p-date" type="date" value={pay.data.date} onChange={(e) => pay.setData('date', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Method</Label>
                                <Select value={pay.data.payment_method} onValueChange={(v) => pay.setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="p-ref">Reference</Label>
                                <Input id="p-ref" value={pay.data.reference} onChange={(e) => pay.setData('reference', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="p-note">Note</Label>
                            <Input id="p-note" value={pay.data.note} onChange={(e) => pay.setData('note', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPayOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={pay.processing}>
                                {pay.processing ? 'Saving...' : 'Make Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
