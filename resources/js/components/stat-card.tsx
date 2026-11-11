import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'indigo',
    delay = '',
}: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
    color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet';
    delay?: string;
}) {
    const colorStyles: Record<string, string> = {
        indigo: 'from-indigo-500/80 via-indigo-500/60 to-indigo-600/70',
        emerald: 'from-emerald-500/80 via-emerald-500/60 to-emerald-600/70',
        rose: 'from-rose-500/80 via-rose-500/60 to-rose-600/70',
        amber: 'from-amber-500/80 via-amber-500/60 to-amber-600/70',
        sky: 'from-sky-500/80 via-sky-500/60 to-sky-600/70',
        violet: 'from-violet-500/80 via-violet-500/60 to-violet-600/70',
    };

    const iconBg: Record<string, string> = {
        indigo: 'bg-indigo-500/20 text-indigo-200',
        emerald: 'bg-emerald-500/20 text-emerald-200',
        rose: 'bg-rose-500/20 text-rose-200',
        amber: 'bg-amber-500/20 text-amber-200',
        sky: 'bg-sky-500/20 text-sky-200',
        violet: 'bg-violet-500/20 text-violet-200',
    };

    const TrendIcon =
        trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

    return (
        <div
            className={`tilt-card group relative overflow-hidden rounded-2xl p-5 shadow-3d animate-fade-up ${delay}`}
            style={{
                ['--tilt-x-hover' as string]: '-2deg',
                ['--tilt-y-hover' as string]: '4deg',
                ['--lift-hover' as string]: '10px',
            }}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${colorStyles[color]} opacity-90 dark:opacity-95`}
            />
            <div className="card-3d absolute inset-0" />

            <div className="preserve-3d relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/80">
                            {title}
                        </p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
                            {formatCurrency(value)}
                        </p>
                    </div>
                    <div
                        className={cn(
                            'flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg',
                            iconBg[color],
                        )}
                        style={{ transform: 'translateZ(24px)' }}
                    >
                        <Icon className="size-5" />
                    </div>
                </div>

                {trendValue && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-white/80">
                        <TrendIcon className="size-3.5" />
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div
                className="pointer-events-none absolute -right-8 -bottom-10 size-32 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:scale-125"
                style={{ transform: 'translateZ(30px)' }}
            />
        </div>
    );
}
