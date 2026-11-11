import { router } from '@inertiajs/react';
import { FileDown, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type FilterSelect = {
    name: string;
    value: string;
    placeholder: string;
    options: { value: string; label: string }[];
};

type Props = {
    from: string;
    to: string;
    base: string;
    selects?: FilterSelect[];
    exportType?: string;
    hidePdf?: boolean;
};

export function ReportFilters({ from, to, base, selects = [], exportType = 'sales', hidePdf = false }: Props) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);

    const apply = () => {
        router.get(base, { from: dateFrom, to: dateTo }, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-3d">
            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            {selects.map((select) => (
                <div key={select.name}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Filter</label>
                    <Select
                        value={select.value || 'all'}
                        onValueChange={(v) =>
                            router.get(base, { [select.name]: v === 'all' ? undefined : v }, { preserveState: true, preserveScroll: true })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{select.placeholder}</SelectItem>
                            {select.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
            <Button onClick={apply} className="cursor-pointer">
                Apply
            </Button>
            <div className="ml-auto flex gap-2">
                {!hidePdf && (
                    <Button asChild variant="outline" className="cursor-pointer">
                        <a href={`/reports/export-pdf?type=${exportType}&from=${from}&to=${to}`}>
                            <FileText className="size-4" />
                            PDF
                        </a>
                    </Button>
                )}
                <Button asChild variant="outline" className="cursor-pointer">
                    <a href={`/reports/export-csv?type=${exportType}&from=${from}&to=${to}`}>
                        <FileDown className="size-4" />
                        CSV
                    </a>
                </Button>
            </div>
        </div>
    );
}
