import { Head, Link, router } from '@inertiajs/react';
import { Bell, BellOff, CheckCheck, Info, Package, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AppNotification, Paginated } from '@/types/inventory';

type Props = {
    notifications: Paginated<AppNotification>;
    unread: number;
};

const typeIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; classes: string }> = {
    stock: { icon: Package, classes: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
    sale: { icon: TrendingUp, classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    purchase: { icon: TrendingDown, classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    warning: { icon: TriangleAlert, classes: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
    info: { icon: Info, classes: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
};

export default function NotificationsIndex({ notifications, unread }: Props) {
    return (
        <Page
            title="Notifications"
            description="All system alerts and activity"
            breadcrumbs={[{ title: 'Notifications', href: '/notifications' }]}
            actions={
                unread > 0 ? (
                    <Button variant="outline" className="cursor-pointer" onClick={() => router.post('/notifications/read-all')}>
                        <CheckCheck className="size-4" />
                        Mark all read
                    </Button>
                ) : undefined
            }
        >
            <Head title="Notifications" />

            <Card className="shadow-3d">
                <CardContent className="flex items-center gap-3 pt-5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                        <Bell className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Unread</p>
                        <p className="text-lg font-bold">{unread}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                {notifications.data.map((notification) => {
                    const meta = typeIcons[notification.type] ?? typeIcons.info;
                    const Icon = meta.icon;

                    return (
                        <div
                            key={notification.id}
                            className={cn(
                                'flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-3d transition-transform hover:-translate-y-0.5',
                                !notification.is_read && 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30',
                            )}
                        >
                            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', meta.classes)}>
                                <Icon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{notification.title}</p>
                                    {!notification.is_read && <span className="size-2 rounded-full bg-indigo-500" />}
                                </div>
                                {notification.message && <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>}
                                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.created_at)}</p>
                            </div>
                            {notification.link && (
                                <Link
                                    href={notification.link}
                                    onClick={() => {
                                        if (!notification.is_read) {
                                            router.post(`/notifications/${notification.id}/read`, undefined, { preserveScroll: true });
                                        }
                                    }}
                                    className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                >
                                    View →
                                </Link>
                            )}
                            {!notification.is_read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 cursor-pointer"
                                    onClick={() => router.post(`/notifications/${notification.id}/read`, undefined, { preserveScroll: true })}
                                >
                                    <CheckCheck className="size-4" />
                                </Button>
                            )}
                        </div>
                    );
                })}
                {notifications.data.length === 0 && (
                    <div className="rounded-2xl border bg-card p-16 text-center text-muted-foreground">
                        <BellOff className="mx-auto mb-2 size-8 opacity-40" />
                        No notifications yet
                    </div>
                )}
            </div>

            <Pagination pagination={notifications} />
        </Page>
    );
}
