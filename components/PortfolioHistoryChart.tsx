'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistorySnapshot } from '@/types/gpf';
import { motion } from 'framer-motion';

interface PortfolioHistoryChartProps {
    history: HistorySnapshot[];
}

export default function PortfolioHistoryChart({ history }: PortfolioHistoryChartProps) {
    const [timeRange, setTimeRange] = React.useState<'1M' | '6M' | '1Y' | 'ALL'>('ALL');

    // Filter logic
    const filteredHistory = React.useMemo(() => {
        if (!history || history.length === 0) return [];

        const now = new Date();
        let cutoffDate = new Date();

        switch (timeRange) {
            case '1M':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case '6M':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case '1Y':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'ALL':
            default:
                return history;
        }

        return history.filter(h => new Date(h.date) >= cutoffDate);
    }, [history, timeRange]);

    // Map to chart data
    const data = filteredHistory.length > 0 ? filteredHistory.map(h => ({
        date: new Date(h.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        value: h.totalBalance
    })) : [];

    // If only one data point, add a previous point for visual continuity (mock start of month)
    if (data.length === 1) {
        data.unshift({
            date: 'Start',
            value: data[0].value * 0.98 // Mock 2% growth
        });
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    <p className="text-blue-600 font-bold text-lg">
                        ฿{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">การเติบโตของพอร์ต</h2>
                    <p className="text-sm text-gray-500">มูลค่าสินทรัพย์สะสมย้อนหลัง</p>
                </div>
                <div className="flex gap-2">
                    {(['1M', '6M', '1Y', 'ALL'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${timeRange === range
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {range === 'ALL' ? 'ทั้งหมด' : range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `฿${(value / 1000000).toFixed(1)}M`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563EB"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
