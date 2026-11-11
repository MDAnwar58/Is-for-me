import { Link } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BarChart3,
    Bell,
    Boxes,
    CreditCard,
    HandCoins,
    LayoutDashboard,
    Package,
    ReceiptText,
    ShoppingBag,
    ShoppingCart,
    Tags,
    Truck,
    Users,
    UsersRound,
    Wallet,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavInventoryMain } from '@/components/nav-inventory-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/lib/permissions';
import { dashboard } from '@/routes';
import type { NavGroup } from '@/types';

export function AppSidebar() {
    const { can, isAdmin } = usePermissions();

    const navGroups: NavGroup[] = [
        {
            title: 'Overview',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            title: 'Inventory',
            items: [
                {
                    title: 'Products',
                    href: '/products',
                    icon: Package,
                },
                {
                    title: 'Categories',
                    href: '/categories',
                    icon: Tags,
                    permission: 'manage categories',
                },
                {
                    title: 'Brands',
                    href: '/brands',
                    icon: Boxes,
                    permission: 'manage brands',
                },
                {
                    title: 'Stock',
                    href: '/stock',
                    icon: Warehouse,
                },
                {
                    title: 'Stock Reports',
                    href: '/stock/report',
                    icon: BarChart3,
                    permission: 'view reports',
                },
            ],
        },
        {
            title: 'Transactions',
            items: [
                {
                    title: 'POS / Sales',
                    href: '/pos',
                    icon: ShoppingCart,
                },
                {
                    title: 'Sales History',
                    href: '/sales',
                    icon: ReceiptText,
                },
                {
                    title: 'Purchases',
                    href: '/purchases',
                    icon: ShoppingBag,
                },
                {
                    title: 'Expenses',
                    href: '/expenses',
                    icon: Wallet,
                    permission: 'manage expenses',
                },
                {
                    title: 'Payments',
                    href: '/payments',
                    icon: HandCoins,
                    permission: 'view payments',
                },
                {
                    title: 'Due Balances',
                    href: '/payments/due',
                    icon: CreditCard,
                    permission: 'view payments',
                },
            ],
        },
        {
            title: 'Parties',
            items: [
                {
                    title: 'Suppliers',
                    href: '/suppliers',
                    icon: Truck,
                },
                {
                    title: 'Customers',
                    href: '/customers',
                    icon: UsersRound,
                },
            ],
        },
        {
            title: 'Reports & Admin',
            items: [
                {
                    title: 'Reports',
                    href: '/reports',
                    icon: BadgeDollarSign,
                    permission: 'view reports',
                },
                {
                    title: 'Notifications',
                    href: '/notifications',
                    icon: Bell,
                },
                {
                    title: 'Users',
                    href: '/users',
                    icon: Users,
                    permission: 'manage users',
                },
            ],
        },
    ];

    const filteredGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.permission || can(item.permission) || isAdmin()),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavInventoryMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter className="mt-auto" items={[]} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
