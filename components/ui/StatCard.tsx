import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    changePercent?: number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export default function StatCard({
    title,
    value,
    change,
    changePercent,
    icon,
    trend,
    className,
}: StatCardProps) {
    const isPositive = trend === 'up' || (change && change > 0);
    const isNegative = trend === 'down' || (change && change < 0);

    return (
        <div className={clsx('stat-card', className)}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {title}
                </p>
                {icon && <div className="opacity-60">{icon}</div>}
            </div>

            <div className="mb-2">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {value}
                </h3>
            </div>

            {(change !== undefined || changePercent !== undefined) && (
                <div className="flex items-center gap-1">
                    {isPositive && <TrendingUp className="w-4 h-4 text-success" />}
                    {isNegative && <TrendingDown className="w-4 h-4 text-danger" />}

                    <span
                        className={clsx(
                            'text-sm font-medium',
                            isPositive && 'text-success',
                            isNegative && 'text-danger',
                            !isPositive && !isNegative && 'text-secondary'
                        )}
                    >
                        {change !== undefined && (
                            <>
                                {change > 0 && '+'}
                                {change.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                            </>
                        )}
                        {changePercent !== undefined && (
                            <>
                                {' '}({changePercent > 0 && '+'}
                                {changePercent.toFixed(2)}%)
                            </>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}
