import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, Truck, UserRound } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Paginated, Purchase, Supplier } from '@/types/inventory';

type Props = {
    supplier: Supplier;
    purchases: Paginated<Purchase>;
};

export default function SuppliersShow({ supplier, purchases }: Props) {
    const totalPaid = Number(supplier.total_purchase_amount) - Number(supplier.balance);

    return (
        <Page
            title={supplier.name}
            description={supplier.company ?? 'Supplier'}
            breadcrumbs={[
                { title: 'Suppliers', href: '/suppliers' },
                { title: supplier.name, href: `/suppliers/${supplier.id}` },
            ]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <Link href="/suppliers">
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={supplier.name} />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="shadow-3d lg:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-3d-lg" style={{ transform: 'rotate(-4deg)' }}>
                            <Truck className="size-9 text-white" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{supplier.name}</h2>
                            <p className="text-sm text-muted-foreground">{supplier.company}</p>
                        </div>

                        <div className="w-full space-y-2 text-sm">
                            {supplier.phone && (
                                <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {supplier.phone}</p>
                            )}
                            {supplier.mobile && (
                                <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {supplier.mobile}</p>
                            )}
                            {supplier.email && (
                                <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {supplier.email}</p>
                            )}
                            {(supplier.address || supplier.city) && (
                                <p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /> {[supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ')}</p>
                            )}
                        </div>

                        {supplier.note && (
                            <p className="w-full rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{supplier.note}</p>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="tilt-card rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 text-white shadow-3d">
                            <p className="text-sm text-white/80">Total Purchases</p>
                            <p className="mt-1 text-xl font-bold">{formatCurrency(supplier.total_purchase_amount)}</p>
                            <p className="text-xs text-white/70">{supplier.purchases_count} purchases</p>
                        </div>
                        <div className="tilt-card rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-3d">
                            <p className="text-sm text-white/80">Paid</p>
                            <p className="mt-1 text-xl font-bold">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div className="tilt-card rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white shadow-3d">
                            <p className="text-sm text-white/80">Due Balance</p>
                            <p className="mt-1 text-xl font-bold">{formatCurrency(supplier.balance)}</p>
                        </div>
                    </div>

                    <Card className="shadow-3d">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserRound className="size-4 text-amber-500" />
                                Purchase History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {purchases.data.map((purchase) => (
                                    <Link key={purchase.id} href={`/purchases/${purchase.id}`} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent">
                                        <div>
                                            <p className="text-sm font-medium">{purchase.invoice_no}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(purchase.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold">{formatCurrency(purchase.total)}</span>
                                            <StatusBadge status={purchase.payment_status} />
                                        </div>
                                    </Link>
                                ))}
                                {purchases.data.length === 0 && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">No purchases yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Pagination pagination={purchases} />
                </div>
            </div>
        </Page>
    );
}
