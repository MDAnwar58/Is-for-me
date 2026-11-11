import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavGroup } from '@/types';

export function NavInventoryMain({ groups }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { state, open } = useSidebar();
    const collapsed = state === 'collapsed' && !open;

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const active = isCurrentUrl(item.href);
                            const hasChildren = item.children && item.children.length > 0;

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={cn(
                                            'group/menu-button',
                                            active &&
                                                'bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground',
                                        )}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                    {item.badge > 9 ? '9+' : item.badge}
                                                </span>
                                            )}
                                            {hasChildren && (
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/menu-button:rotate-90" />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                    {hasChildren && (
                                        <SidebarMenuSub>
                                            {item.children!.map((child) => (
                                                <SidebarMenuSubItem key={child.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isCurrentUrl(child.href)}
                                                    >
                                                        <Link href={child.href} prefetch>
                                                            <span>{child.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
            {collapsed && (
                <div className="px-4 py-2 text-center">
                    <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                        {groups.reduce((acc, g) => acc + g.items.length, 0)} items
                    </p>
                </div>
            )}
        </>
    );
}
