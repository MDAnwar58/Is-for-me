import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';

export function Page({
    title,
    children,
    description,
    actions,
    breadcrumbs = [],
}: {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    breadcrumbs?: { title: string; href?: string }[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader title={title} description={description}>
                    {actions}
                </PageHeader>
                {children}
            </div>
        </AppLayout>
    );
}
