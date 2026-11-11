import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type NotificationProps = {
    id: number;
    type: string;
    title: string;
    message?: string | null;
    link?: string | null;
    is_read: boolean;
    created_at: string;
};

const notificationColors: Record<string, string> = {
    low_stock: 'text-amber-500 bg-amber-500/10',
    out_of_stock: 'text-red-500 bg-red-500/10',
    pending_payment: 'text-violet-500 bg-violet-500/10',
    purchase: 'text-sky-500 bg-sky-500/10',
    sale: 'text-emerald-500 bg-emerald-500/10',
};

type NotificationSharedProps = {
    notifications?: {
        items?: NotificationProps[];
        unread_count?: number;
        read_url?: string;
        read_all_url?: string;
    } | null;
};

export function NotificationBell() {
    const page = usePage<NotificationSharedProps>();
    const [open, setOpen] = useState(false);

    const notifications = page.props.notifications?.items ?? [];
    const unread = page.props.notifications?.unread_count ?? 0;

    const handleRead = (notification: NotificationProps) => {
        router.post(
            page.props.notifications?.read_url ?? `/notifications/${notification.id}/read`,
            {},
            { preserveScroll: true },
        );
    };

    const handleReadAll = () => {
        router.post(
            page.props.notifications?.read_all_url ?? '/notifications/read-all',
            {},
            { preserveScroll: true },
        );
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 cursor-pointer"
                >
                    <Bell className="size-5" />
                    {unread > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between border-b px-3 py-2.5">
                    <p className="text-sm font-semibold">Notifications</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-xs"
                        onClick={handleReadAll}
                        disabled={unread === 0}
                    >
                        <CheckCheck className="size-3.5" />
                        Mark all read
                    </Button>
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                            <Bell className="size-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                No notifications yet
                            </p>
                        </div>
                    )}

                    {notifications.map((notification) => (
                        <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleRead(notification)}
                            className={cn(
                                'flex w-full gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-accent',
                                !notification.is_read && 'bg-accent/50',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                                    notificationColors[notification.type] ??
                                        'text-indigo-500 bg-indigo-500/10',
                                )}
                            >
                                <Package className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                    {notification.title}
                                </span>
                                {notification.message && (
                                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                        {notification.message}
                                    </span>
                                )}
                                <span className="mt-1 block text-[11px] text-muted-foreground/70">
                                    {formatDateTime(notification.created_at)}
                                </span>
                            </span>
                            {!notification.is_read && (
                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" />
                            )}
                        </button>
                    ))}
                </div>

                <Link
                    href="/notifications"
                    className="block border-t px-3 py-2.5 text-center text-sm font-medium text-indigo-600 hover:bg-accent dark:text-indigo-400"
                    onClick={() => setOpen(false)}
                >
                    View all notifications
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
