import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/inventory';

export function Pagination({
    pagination,
    className,
}: {
    pagination: Paginated<unknown>;
    className?: string;
}) {
    if (!pagination || pagination.last_page <= 1) {
        return null;
    }

    const pages: (number | '...')[] = [];
    const total = pagination.last_page;
    const current = pagination.current_page;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - current) <= 1) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 px-1 py-3',
                className,
            )}
        >
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {pagination.from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                    {pagination.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {pagination.total}
                </span>{' '}
                results
            </p>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!pagination.prev_page_url} asChild={!!pagination.prev_page_url}>
                    {pagination.prev_page_url ? (
                        <Link href={pagination.prev_page_url}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <span>
                            <ChevronLeft className="h-4 w-4" />
                        </span>
                    )}
                </Button>

                {pages.map((page, index) =>
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-1 text-sm text-muted-foreground"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === current ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0 text-sm"
                            asChild={page !== current}
                        >
                            {page !== current ? (
                                <Link href={`${pagination.path}?page=${page}`}>
                                    {page}
                                </Link>
                            ) : (
                                <span>{page}</span>
                            )}
                        </Button>
                    ),
                )}

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!pagination.next_page_url} asChild={!!pagination.next_page_url}>
                    {pagination.next_page_url ? (
                        <Link href={pagination.next_page_url}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <span>
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
