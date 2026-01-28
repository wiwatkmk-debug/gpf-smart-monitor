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
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 25;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            // Split Thai fund names properly
                            let line1 = '';
                            let line2 = '';

                            if (name === 'แผนตราสารหนี้') {
                                line1 = 'แผน';
                                line2 = 'ตราสารหนี้';
                            } else if (name === 'แผนหุ้นไทย') {
                                line1 = 'แผน';
                                line2 = 'หุ้นไทย';
                            } else if (name === 'แผนหุ้นต่างประเทศ') {
                                line1 = 'แผนหุ้น';
                                line2 = 'ต่างประเทศ';
                            } else if (name === 'แผนทองคำ') {
                                line1 = 'แผน';
                                line2 = 'ทองคำ';
                            } else {
                                line1 = name;
                                line2 = '';
                            }

                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill="var(--text-primary)"
                                    textAnchor={x > cx ? 'start' : 'end'}
                                    dominantBaseline="central"
                                    fontSize="11"
                                >
                                    <tspan x={x} dy="-0.6em">{line1}</tspan>
                                    {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
                                    <tspan x={x} dy="1.2em" fontWeight="bold">{value.toFixed(1)}%</tspan>
                                </text>
                            );
                        }}
                        outerRadius={80}
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
