'use client';

import { Fund } from '@/types/portfolio';
import Card from './ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AllocationChartProps {
    funds: Fund[];
}

const COLORS = {
    equity: '#667eea',
    'fixed-income': '#10b981',
    property: '#f59e0b',
    alternative: '#ef4444',
};

export default function AllocationChart({ funds }: AllocationChartProps) {
    // Use individual funds instead of grouping by type
    const allocationData = funds.map((fund) => ({
        name: fund.name,
        type: fund.type,
        value: fund.allocation,
        amount: fund.value,
    }));

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { amount: number } }> }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {payload[0].name}
                    </p>
                    <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {payload[0].value.toFixed(1)}%
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        ฿{data.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                การกระจายการลงทุน
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 gap-3">
                {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[item.type as keyof typeof COLORS] }}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {item.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {item.value.toFixed(1)}% · ฿{(item.amount / 1000).toLocaleString('th-TH', { maximumFractionDigits: 0 })}K
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
