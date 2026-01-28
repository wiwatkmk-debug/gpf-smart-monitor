import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
    children: ReactNode;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
    className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={clsx(
                'badge',
                variant === 'success' && 'badge-success',
                variant === 'danger' && 'badge-danger',
                variant === 'warning' && 'badge-warning',
                variant === 'info' && 'badge-info',
                variant === 'default' && 'bg-gray-100 text-gray-700',
                className
            )}
        >
            {children}
        </span>
    );
}
