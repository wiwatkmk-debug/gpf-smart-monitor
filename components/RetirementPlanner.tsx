'use client';

import { useState } from 'react';
import Card from './ui/Card';
import { calculateRetirementProjection, getRetirementAdvice } from '@/lib/retirementCalculator';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

export default function RetirementPlanner() {
    const [currentAge, setCurrentAge] = useState(35);
    const [retirementAge, setRetirementAge] = useState(60);
    const [currentSavings, setCurrentSavings] = useState(500000);
    const [monthlyContribution, setMonthlyContribution] = useState(10000);
    const expectedReturn = 7;

    const plan = calculateRetirementProjection({
        currentAge,
        retirementAge,
        currentSavings,
        monthlyContribution,
        expectedReturn,
    });

    const advice = getRetirementAdvice(plan.readinessScore);

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { age: number }; value: number }> }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass" style={{ padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                        อายุ {payload[0].payload.age} ปี
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
        <Card>
            <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    วางแผนเกษียณ
                </h3>
            </div>

            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        อายุปัจจุบัน: {currentAge} ปี
                    </label>
                    <input
                        type="range"
                        min="20"
                        max="65"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        อายุเกษียณ: {retirementAge} ปี
                    </label>
                    <input
                        type="range"
                        min="50"
                        max="70"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        เงินออมปัจจุบัน (บาท)
                    </label>
                    <input
                        type="number"
                        value={currentSavings}
                        onChange={(e) => setCurrentSavings(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        เงินออมต่อเดือน (บาท)
                    </label>
                    <input
                        type="number"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    />
                </div>
            </div>

            {/* Readiness Score */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between mb-3">
                    <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                        ความพร้อมเกษียณ
                    </p>
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-5 h-5 ${advice.color}`} />
                        <span className={`text-2xl font-bold ${advice.color}`}>
                            {plan.readinessScore}%
                        </span>
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                    <div
                        className={`h-3 rounded-full transition-all ${plan.readinessScore >= 70 ? 'bg-success' : plan.readinessScore >= 50 ? 'bg-warning' : 'bg-danger'
                            }`}
                        style={{ width: `${plan.readinessScore}%` }}
                    />
                </div>

                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {advice.message}
                </p>
            </div>

            {/* Projection Chart */}
            <div className="mb-6">
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                    คาดการณ์เงินออมเมื่อเกษียณ
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={plan.projections}>
                        <defs>
                            <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey="age"
                            stroke="var(--text-tertiary)"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'อายุ (ปี)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            stroke="var(--text-tertiary)"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `฿${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="portfolioValue"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="url(#colorProjection)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    คำแนะนำ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <p style={{ color: 'var(--text-secondary)' }}>เงินออมที่แนะนำต่อเดือน</p>
                        <p className="text-lg font-bold text-success">
                            ฿{plan.recommendedMonthlyContribution.toLocaleString('th-TH')}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)' }}>คาดการณ์เงินออมเมื่ออายุ {retirementAge} ปี</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            ฿{(plan.projections[plan.projections.length - 1].portfolioValue / 1000000).toFixed(2)}M
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
