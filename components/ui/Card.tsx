import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export default function Card({ children, className, hover = true, glass = false }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl border transition-all duration-300',
                glass ? 'glass' : 'card',
                hover && 'hover:shadow-xl hover:-translate-y-1',
                className
            )}
        >
            {children}
        </div>
    );
}
