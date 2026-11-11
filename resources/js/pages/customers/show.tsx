import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, ShoppingCart, UserRound } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Customer, Paginated, Sale } from '@/types/inventory';

type Props = {
    customer: Customer;
    sales: Paginated<Sale>;
};

export default function CustomersShow({ customer, sales }: Props) {
    const totalPaid = Number(customer.total_sale_amount) - Number(customer.balance);

    return (
        <Page
            title={customer.name}
            description="Customer profile"
            breadcrumbs={[
                { title: 'Customers', href: '/customers' },
                { title: customer.name, href: `/customers/${customer.id}` },
            ]}
            actions={
                <Button asChild variant="outline" className="cursor-pointer">
                    <Link href="/customers">
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={customer.name} />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="shadow-3d lg:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-3d-lg" style={{ transform: 'rotate(-4deg)' }}>
                            <UserRound className="size-9 text-white" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{customer.name}</h2>
                            <p className="text-sm text-muted-foreground">Customer</p>
                        </div>

                        <div className="w-full space-y-2 text-sm">
                            {customer.phone && (
                                <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {customer.phone}</p>
                            )}
                            {customer.email && (
                                <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {customer.email}</p>
                            )}
                            {(customer.address || customer.city) && (
                                <p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /> {[customer.address, customer.city, customer.country].filter(Boolean).join(', ')}</p>
                            )}
                        </div>

                        {customer.note && (
                            <p className="w-full rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{customer.note}</p>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="tilt-card rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 text-white shadow-3d">
                            <p className="text-sm text-white/80">Total Sales</p>
                            <p className="mt-1 text-xl font-bold">{formatCurrency(customer.total_sale_amount)}</p>
                            <p className="text-xs text-white/70">{customer.sales_count} purchases</p>
                        </div>
                        <div className="tilt-card rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-3d">
                            <p className="text-sm text-white/80">Paid</p>
                            <p className="mt-1 text-xl font-bold">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div className="tilt-card rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white shadow-3d">
                            <p className="text-sm text-white/80">Due Balance</p>
                            <p className="mt-1 text-xl font-bold">{formatCurrency(customer.balance)}</p>
                        </div>
                    </div>

                    <Card className="shadow-3d">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="size-4 text-emerald-500" />
                                Purchase History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {sales.data.map((sale) => (
                                    <Link key={sale.id} href={`/sales/${sale.id}`} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent">
                                        <div>
                                            <p className="text-sm font-medium">{sale.invoice_no}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold">{formatCurrency(sale.total)}</span>
                                            <StatusBadge status={sale.payment_status} />
                                        </div>
                                    </Link>
                                ))}
                                {sales.data.length === 0 && (
                                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">No sales yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Pagination pagination={sales} />
                </div>
            </div>
        </Page>
    );
}
