import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

export function SearchInput({
    value = '',
    placeholder = 'Search...',
    param = 'search',
}: {
    value?: string;
    placeholder?: string;
    param?: string;
}) {
    const [query, setQuery] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (value !== prevValue) {
        setPrevValue(value);
        setQuery(value);
    }

    useEffect(() => {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => {
            const current = new URLSearchParams(window.location.search);

            if (query) {
                current.set(param, query);
            } else {
                current.delete(param);
            }

            current.delete('page');

            router.get(window.location.pathname, Object.fromEntries(current), {
                preserveState: true,
                replace: true,
                only: ['filters', 'products', 'sales', 'purchases', 'suppliers', 'customers', 'movements', 'expenses', 'users'],
            });
        }, 400);

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, [query, param]);

    return (
        <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full pl-9 sm:w-64"
            />
        </div>
    );
}
