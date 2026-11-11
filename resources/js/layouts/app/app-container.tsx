import { Breadcrumbs } from '@/components/breadcrumbs';
import type { AppLayoutProps } from '@/types';

export default function AppContainer({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <>
            <div className="mt-3 ml-7 flex items-center gap-x-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {children}
        </>
    );
}
