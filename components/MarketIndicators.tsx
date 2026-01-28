'use client';

import { MarketIndicator } from '@/types/portfolio';
import Card from './ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketIndicatorsProps {
    indicators: MarketIndicator[];
}

export default function MarketIndicators({ indicators }: MarketIndicatorsProps) {
    return (
        <Card>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ตัวชี้วัดตลาดโลก
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {indicators.map((indicator) => (
                    <div
                        key={indicator.id}
                        className="p-3 rounded-lg border transition-all hover:shadow-md"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {indicator.symbol}
                            </p>
                            {indicator.change >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-success" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-danger" />
                            )}
                        </div>

                        <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                            {indicator.value.toLocaleString('th-TH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>

                        <div className="flex items-center gap-1">
                            <span
                                className={`text-sm font-medium ${indicator.change >= 0 ? 'text-success' : 'text-danger'
                                    }`}
                            >
                                {indicator.change >= 0 && '+'}
                                {indicator.change.toFixed(2)} ({indicator.changePercent >= 0 && '+'}
                                {indicator.changePercent.toFixed(2)}%)
                            </span>
                        </div>

                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            {indicator.name}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
