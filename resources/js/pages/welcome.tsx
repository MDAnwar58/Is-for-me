import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Bell,
    Boxes,
    CreditCard,
    FileDown,
    LayoutDashboard,
    Package,
    ReceiptText,
    ScanBarcode,
    ShieldCheck,
    ShoppingCart,
    TrendingUp,
    Truck,
    Warehouse,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import { register } from '@/routes';

export default function Welcome() {
    const features = [
        {
            icon: Package,
            title: 'Product Management',
            description: 'SKU, barcode, images, brands, categories & real-time stock levels for every product.',
            color: 'from-indigo-500 to-blue-600',
        },
        {
            icon: ShoppingCart,
            title: 'Fast POS & Sales',
            description: 'Barcode scanning, instant search, discounts, tax, and printable invoices at lightning speed.',
            color: 'from-emerald-500 to-teal-600',
        },
        {
            icon: Truck,
            title: 'Purchases & Suppliers',
            description: 'Purchase orders, supplier tracking, and automatic stock increases on every receipt.',
            color: 'from-amber-500 to-orange-600',
        },
        {
            icon: Warehouse,
            title: 'Smart Stock Control',
            description: 'Stock adjustments, transfers, damaged stock, and low-stock alerts that never miss.',
            color: 'from-sky-500 to-cyan-600',
        },
        {
            icon: BarChart3,
            title: 'Powerful Reports',
            description: 'Sales, profit & loss, expenses and stock reports. Export to PDF, Excel or CSV.',
            color: 'from-violet-500 to-purple-600',
        },
        {
            icon: CreditCard,
            title: 'Payments & Dues',
            description: 'Cash, bank and mobile payments with partial payment and due-balance tracking.',
            color: 'from-rose-500 to-pink-600',
        },
    ];

    const stats = [
        { value: '3', label: 'User Roles' },
        { value: '8+', label: 'Modules' },
        { value: '100%', label: 'Stock Sync' },
        { value: '24/7', label: 'Available' },
    ];

    return (
        <>
            <Head title="Welcome" />

            {/* Navbar */}
            <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30" style={{ transform: 'rotate(-8deg)' }}>
                            <Boxes className="size-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">StockHaven</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={login()}
                            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:block"
                        >
                            Log in
                        </Link>
                        <Link href={register()}>
                            <Button className="h-9 cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 font-medium shadow-lg shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-500">
                                Get Started
                                <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="perspective-2000 relative overflow-hidden bg-[#050816] pb-24 pt-32 text-white">
                {/* background blobs */}
                <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/30 blur-[120px]" />
                <div className="pointer-events-none absolute top-40 -left-40 size-96 rounded-full bg-violet-600/20 blur-[100px]" />
                <div className="pointer-events-none absolute top-20 -right-40 size-96 rounded-full bg-sky-600/20 blur-[100px]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

                <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 animate-fade-up">
                                <Zap className="size-4" />
                                Inventory, reimagined in 3D
                            </div>
                            <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl animate-fade-up animate-delay-1">
                                Run your{' '}
                                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                                    business
                                </span>{' '}
                                with complete control
                            </h1>
                            <p className="mt-6 max-w-xl text-lg text-slate-400 animate-fade-up animate-delay-2">
                                A modern inventory management system for products, purchases, sales, suppliers,
                                customers, stock, expenses and reports — with automatic stock synchronization
                                on every transaction.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4 animate-fade-up animate-delay-3">
                                <Link href={register()}>
                                    <Button size="lg" className="h-12 cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 text-base shadow-3d-lg glow-primary hover:from-indigo-400 hover:to-violet-500">
                                        Start Free Trial
                                        <ArrowRight className="size-5" />
                                    </Button>
                                </Link>
                                <Link href={login()}>
                                    <Button size="lg" variant="outline" className="h-12 cursor-pointer rounded-full border-white/20 bg-white/5 px-8 text-base text-white backdrop-blur hover:bg-white/10">
                                        <LayoutDashboard className="size-5" />
                                        View Demo
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-fade-up animate-delay-4">
                                {stats.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3D floating dashboard mockup */}
                        <div className="preserve-3d relative hidden lg:block" style={{ perspective: '1400px' }}>
                            <div className="animate-float" style={{ transform: 'rotateY(-14deg) rotateX(8deg)' }}>
                                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-5 shadow-3d-lg backdrop-blur">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Total Sales</p>
                                            <p className="text-2xl font-bold">৳284,500</p>
                                        </div>
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                            <TrendingUp className="size-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex h-32 items-end gap-2">
                                        {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-400" style={{ height: `${h}%`, opacity: 0.5 + (i / 14) }} />
                                        ))}
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {[1, 2, 3].map((row) => (
                                            <div key={row} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-emerald-400" />
                                                    <span className="text-xs text-slate-300">Invoice INV-0000{row}4</span>
                                                </div>
                                                <span className="text-xs font-medium text-emerald-400">+৳{['8,400', '12,150', '5,900'][row - 1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* floating chips */}
                            <div className="animate-float-slow absolute -left-10 top-8 flex items-center gap-2 rounded-xl border border-white/15 bg-slate-800/90 px-4 py-3 shadow-3d-lg backdrop-blur" style={{ transform: 'translateZ(80px) rotateY(-10deg)' }}>
                                <Package className="size-4 text-indigo-400" />
                                <div>
                                    <p className="text-xs text-slate-400">Products</p>
                                    <p className="text-sm font-semibold">1,240 SKUs</p>
                                </div>
                            </div>

                            <div className="animate-float absolute -right-6 top-1/3 flex items-center gap-2 rounded-xl border border-white/15 bg-slate-800/90 px-4 py-3 shadow-3d-lg backdrop-blur" style={{ transform: 'translateZ(90px) rotateY(10deg)', animationDelay: '1.2s' }}>
                                <ScanBarcode className="size-4 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-slate-400">Scanned</p>
                                    <p className="text-sm font-semibold">Barcode ready</p>
                                </div>
                            </div>

                            <div className="animate-float absolute -bottom-6 left-12 flex items-center gap-2 rounded-xl border border-white/15 bg-slate-800/90 px-4 py-3 shadow-3d-lg backdrop-blur" style={{ transform: 'translateZ(100px)', animationDelay: '2s' }}>
                                <Bell className="size-4 text-amber-400" />
                                <div>
                                    <p className="text-xs text-slate-400">Alerts</p>
                                    <p className="text-sm font-semibold">Low stock warned</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative bg-slate-950 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">Features</p>
                        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                            Everything your business needs, in one place
                        </h2>
                        <p className="mt-4 text-slate-400">
                            From barcode scanning to profit reports, every module keeps stock perfectly in sync.
                        </p>
                    </div>

                    <div className="perspective-2000 mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="tilt-card group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/60 to-slate-900/60 p-6 animate-fade-up"
                                style={{
                                    ['--tilt-x-hover' as string]: '-2deg',
                                    ['--tilt-y-hover' as string]: '5deg',
                                    ['--lift-hover' as string]: '12px',
                                    animationDelay: `${index * 0.07}s`,
                                }}
                            >
                                <div className={`mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110`} style={{ transform: 'translateZ(20px)' }}>
                                    <feature.icon className="size-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
                                <div className={`pointer-events-none absolute -right-6 -bottom-8 size-28 rounded-full bg-gradient-to-br ${feature.color} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-25`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="relative bg-[#050816] py-24">
                <div className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">Stock that stays in sync, automatically</h2>
                        <p className="mt-4 text-slate-400">
                            Every purchase, sale, return, adjustment or transfer updates stock instantly.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-6 md:grid-cols-4">
                        {[
                            { icon: ShoppingCart, step: '01', title: 'Sell', desc: 'Scan barcode or search instantly at the POS counter.' },
                            { icon: Truck, step: '02', title: 'Restock', desc: 'Receive purchases and stock increases on the spot.' },
                            { icon: ReceiptText, step: '03', title: 'Track', desc: 'Follow every movement with a full stock history log.' },
                            { icon: FileDown, step: '04', title: 'Report', desc: 'Export PDF, Excel or CSV reports anytime.' },
                        ].map((item, index) => (
                            <div key={item.step} className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center animate-fade-up" style={{ animationDelay: `${index * 0.08}s` }}>
                                <span className="absolute top-4 left-4 text-sm font-bold text-indigo-500/60">{item.step}</span>
                                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-3d">
                                    <item.icon className="size-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-white">{item.title}</h3>
                                <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security strip */}
            <section className="border-t border-white/10 bg-slate-950 py-14">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-6 px-4 sm:px-6">
                    {[
                        { icon: ShieldCheck, text: 'Role-based access control' },
                        { icon: Zap, text: 'Optimized database queries' },
                        { icon: Bell, text: 'Smart notifications & alerts' },
                    ].map((item) => (
                        <div key={item.text} className="flex items-center gap-2 text-sm text-slate-400">
                            <item.icon className="size-4 text-indigo-400" />
                            {item.text}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-950 pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-8 py-16 text-center shadow-3d-lg">
                        <div className="pointer-events-none absolute -top-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute -right-20 -bottom-20 size-64 rounded-full bg-white/10 blur-3xl" />
                        <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
                            Ready to take control of your inventory?
                        </h2>
                        <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
                            Join the businesses managing products, sales and stock with confidence.
                        </p>
                        <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                            <Link href={register()}>
                                <Button size="lg" className="h-12 cursor-pointer rounded-full bg-white px-8 text-base font-semibold text-indigo-700 shadow-3d hover:bg-indigo-50">
                                    Create Free Account
                                    <ArrowRight className="size-5" />
                                </Button>
                            </Link>
                            <Link href={login()}>
                                <Button size="lg" variant="outline" className="h-12 cursor-pointer rounded-full border-white/40 px-8 text-base text-white hover:bg-white/10">
                                    Log In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#050816] py-10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30" style={{ transform: 'rotate(-8deg)' }}>
                            <Boxes className="size-4 text-white" />
                        </div>
                        <span className="font-bold text-white">StockHaven</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} StockHaven. Built with Laravel, React & Tailwind CSS.
                    </p>
                </div>
            </footer>
        </>
    );
}
