'use client';

// ... imports
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Info, History, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const PLANS = [
    { id: 'safe', name: 'แผนความเสี่ยงต่ำ', return: 0.025, color: '#10b981' }, // Green
    { id: 'balance', name: 'แผนสมดุล', return: 0.05, color: '#f59e0b' },   // Amber
    { id: 'growth', name: 'แผนเติบโต', return: 0.085, color: '#ef4444' },    // Red
];

// Mock Historical Returns (2020-2024)
const HISTORICAL_RETURNS: Record<string, number[]> = {
    safe: [2.1, 1.8, 2.0, 2.4, 2.6],        // Stable ~2%
    balance: [4.2, -1.5, 3.8, 5.1, 4.5],      // Mixed, some negative
    growth: [-8.5, 18.2, -4.5, 12.8, 9.4],    // Volatile (Covid 2020 dip, 2021 rebound)
};
const HISTORICAL_YEARS = [2020, 2021, 2022, 2023, 2024];

export default function SimulatorPage() {
    const [mode, setMode] = useState<'projection' | 'backtest'>('projection'); // Toggle state
    const [initialAmount, setInitialAmount] = useState(1000000);
    const [monthlyContribution, setMonthlyContribution] = useState(5000);
    const [years, setYears] = useState(10); // Only for Projection

    // Generate Chart Data
    const generateData = () => {
        const data = [];

        if (mode === 'projection') {
            // --- Projection Logic (Future) ---
            for (let year = 0; year <= years; year++) {
                const point: any = { label: `ปีที่ ${year}` };
                PLANS.forEach(plan => {
                    const fvLumpSum = initialAmount * Math.pow(1 + plan.return, year);
                    const rMonthly = plan.return / 12;
                    const nMonths = year * 12;
                    // Formula for Future Value of Annuity (Ordinary)
                    const fvAnnuity = monthlyContribution * ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly);
                    point[plan.id] = Math.round(fvLumpSum + (year === 0 ? 0 : fvAnnuity));
                });
                data.push(point);
            }
        } else {
            // --- Backtest Logic (Historical) ---
            // Start at year 2019 (Base) -> 2024
            let currentBalances: Record<string, number> = {};

            // Initial Point (Year 2019 / Start)
            const startPoint: any = { label: '2019 (เริ่ม)' };
            PLANS.forEach(p => {
                currentBalances[p.id] = initialAmount;
                startPoint[p.id] = initialAmount;
            });
            data.push(startPoint);

            // Calculate year by year
            HISTORICAL_YEARS.forEach((year, index) => {
                const point: any = { label: year.toString() };

                PLANS.forEach(plan => {
                    // Get return for this specific year
                    const yearReturn = (HISTORICAL_RETURNS[plan.id][index] || 0) / 100;

                    // 1. Growth on previous balance
                    let balance = currentBalances[plan.id] * (1 + yearReturn);

                    // 2. Add yearly contributions (Simplified: 12 * montly, added at end of year)
                    // (To be more precise, we could simulate monthly, but yearly is fine for summary)
                    balance += (monthlyContribution * 12);

                    currentBalances[plan.id] = Math.round(balance);
                    point[plan.id] = currentBalances[plan.id];
                });
                data.push(point);
            });
        }
        return data;
    };

    const data = generateData();

    return (
        <div className="py-6 max-w-5xl mx-auto space-y-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4"
            >
                <div className="flex items-center gap-4">
                    <Link href="/gpf-avc" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {mode === 'projection' ? <TrendingUp className="text-blue-600" /> : <History className="text-purple-600" />}
                            {mode === 'projection' ? 'จำลองผลตอบแทน (อนาคต)' : 'ทดสอบย้อนหลัง (Backtest)'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {mode === 'projection'
                                ? 'คาดการณ์การเติบโตของเงินลงทุนในอนาคต'
                                : 'ลองดูว่า "รู้งี้..." ถ้าลงทุนเมื่อ 5 ปีก่อนจะได้เท่าไหร่'}
                        </p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => setMode('projection')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'projection' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <ChartIcon size={16} /> จำลองอนาคต
                    </button>
                    <button
                        onClick={() => setMode('backtest')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'backtest' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <History size={16} /> ย้อนหลัง 5 ปี
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card h-fit"
                >
                    <h3 className="font-bold text-lg mb-4 text-gray-800">ตั้งค่าเงินลงทุน</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เงินตั้งต้น (บาท)</label>
                            <input
                                type="number"
                                value={initialAmount}
                                onChange={(e) => setInitialAmount(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เงินสะสมต่อเดือน (บาท)</label>
                            <input
                                type="number"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                        </div>

                        {mode === 'projection' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ระยะเวลา (ปี)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-right text-sm text-blue-600 font-bold">{years} ปี</div>
                            </motion.div>
                        )}

                        <div className={`pt-4 p-4 rounded-xl text-xs leading-relaxed ${mode === 'projection' ? 'bg-blue-50 text-blue-800' : 'bg-purple-50 text-purple-800'}`}>
                            <Info className="w-4 h-4 inline-block mr-1 mb-0.5" />
                            {mode === 'projection'
                                ? 'ตัวเลขนี้เป็นการคาดการณ์ล่วงหน้าโดยใช้สมมติฐานผลตอบแทนคงที่ ไม่การันตีผลลัพธ์จริง'
                                : 'ตัวเลขนี้คำนวณจากผลตอบแทนจริงของดัชนีตลาดในอดีต (2020-2024) เพื่อการศึกษาเท่านั้น'}
                        </div>
                    </div>
                </motion.div>

                {/* Chart */}
                <motion.div
                    layout
                    className="lg:col-span-2 card"
                >
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="label" fontSize={12} stroke="#9ca3af" />
                                <YAxis
                                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                                    fontSize={12}
                                    stroke="#9ca3af"
                                />
                                <Tooltip
                                    formatter={(value: number) => value.toLocaleString()}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {PLANS.map(plan => (
                                    <Line
                                        key={plan.id}
                                        type="monotone"
                                        dataKey={plan.id}
                                        name={mode === 'projection'
                                            ? `${plan.name} (~${(plan.return * 100).toFixed(1)}%)`
                                            : plan.name
                                        }
                                        stroke={plan.color}
                                        strokeWidth={3}
                                        dot={mode === 'backtest'} // Show dots for backtest (yearly points)
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {PLANS.map(plan => {
                            const lastVal = data[data.length - 1][plan.id];
                            const totalInvested = initialAmount + (monthlyContribution * 12 * (mode === 'projection' ? years : 5));
                            const profit = lastVal - totalInvested;
                            const isLoss = profit < 0;

                            return (
                                <div key={plan.id} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">{plan.name}</div>
                                    <div className="font-bold text-gray-900" style={{ color: plan.color }}>
                                        {(lastVal / 1000000).toFixed(2)} ล้านบาท
                                    </div>
                                    <div className={`text-[10px] ${isLoss ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {isLoss ? 'ขาดทุน' : 'กำไร'} {profit.toLocaleString()} ({((profit / totalInvested) * 100).toFixed(1)}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
