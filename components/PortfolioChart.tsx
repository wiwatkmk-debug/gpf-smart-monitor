'use client';

import { useState } from 'react';
import { HistoricalData } from '@/types/portfolio';
import Card from './ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioChartProps {
    data: HistoricalData[];
}

type TimePeriod = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export default function PortfolioChart({ data }: PortfolioChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');

    const periods: TimePeriod[] = ['1M', '3M', '6M', '1Y', 'ALL'];

    const getFilteredData = () => {
        const monthsMap: Record<TimePeriod, number> = {
            '1M': 1,
            '3M': 3,
            '6M': 6,
            '1Y': 12,
            'ALL': data.length,
        };
        const months = monthsMap[selectedPeriod];
        return data.slice(-months);
    };

    const filteredData = getFilteredData();

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string }; value: number }> }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass" style={{ padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {payload[0].payload.date}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ฿{payload[0].value.toLocaleString('th-TH')}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="mb-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    ผลการดำเนินงานพอร์ต
                </h3>
                <div className="flex gap-2">
                    {periods.map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period
                                ? 'bg-gradient-primary text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            style={
                                selectedPeriod !== period
                                    ? { color: 'var(--text-secondary)' }
                                    : undefined
                            }
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filteredData}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-tertiary)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="var(--text-tertiary)"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `฿${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#667eea"
                        strokeWidth={3}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}
