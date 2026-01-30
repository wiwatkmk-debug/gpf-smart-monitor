'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_GPF_ACCOUNT, INVESTMENT_PLANS } from '@/lib/mock-gpf-data';
import Link from 'next/link';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { ChevronLeft, TrendingUp, Info } from 'lucide-react';

import { motion } from 'framer-motion';

export default function RetirementPage() {
    const [currentAge, setCurrentAge] = useState(35);
    const [retireAge, setRetireAge] = useState(60);
    const [salary, setSalary] = useState(MOCK_GPF_ACCOUNT.salary);
    const [balance, setBalance] = useState(MOCK_GPF_ACCOUNT.totalBalance);
    const [contributionRate, setContributionRate] = useState(MOCK_GPF_ACCOUNT.contributionRate);
    const [salaryGrowth, setSalaryGrowth] = useState(3); // 3% annual growth
    const [planId, setPlanId] = useState(MOCK_GPF_ACCOUNT.currentPlanId);
    const [simulationData, setSimulationData] = useState<any[]>([]);

    const selectedPlan = INVESTMENT_PLANS.find(p => p.id === planId) || INVESTMENT_PLANS[0];

    useEffect(() => {
        runSimulation();
    }, [currentAge, retireAge, salary, balance, contributionRate, salaryGrowth, planId]);

    const runSimulation = () => {
        const data: any[] = [];
        let currentBalance = balance;
        let currentSalary = salary;
        const years = retireAge - currentAge;

        // Simple probabilistic simulation parameters
        // In a real app, this would be a full Monte Carlo with 1000+ iterations
        const expectedReturn = selectedPlan.historicalReturn / 100;
        const volatility = selectedPlan.riskLevel === 'High' ? 0.15 : selectedPlan.riskLevel === 'Medium' ? 0.08 : 0.03;

        for (let i = 0; i <= years; i++) {
            const year = new Date().getFullYear() + i;
            const age = currentAge + i;

            // Calculate scenarios
            // 1. Base Case (Expected Return)
            const yearlyReturn = currentBalance * expectedReturn;
            const yearlyContribution = (currentSalary * 12) * (contributionRate / 100);

            // 2. Bear Case (Poor market conditions)
            const bearBalance: number = i === 0 ? balance : data[i - 1].bear * (1 + (expectedReturn - volatility)) + yearlyContribution;

            // 3. Bull Case (Good market conditions)
            const bullBalance: number = i === 0 ? balance : data[i - 1].bull * (1 + (expectedReturn + volatility)) + yearlyContribution;

            data.push({
                year,
                age,
                amount: Math.round(currentBalance),
                bear: Math.round(bearBalance),
                bull: Math.round(bullBalance),
                contribution: Math.round(yearlyContribution)
            });

            // Update state for next iteration
            currentBalance += yearlyReturn + yearlyContribution;
            currentSalary *= (1 + salaryGrowth / 100);
        }
        setSimulationData(data);
    };

    const finalAmount = simulationData.length > 0 ? simulationData[simulationData.length - 1].amount : 0;
    const targetAmount = 10000000; // Mock target 10MB
    const isTargetMet = finalAmount >= targetAmount;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-6 bg-gradient-to-r from-indigo-50 to-white p-4 rounded-2xl border border-indigo-100"
            >
                <Link href="/gpf-avc" className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                    <ChevronLeft className="w-6 h-6 text-indigo-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">วางแผนเกษียณ (Retirement Projection)</h1>
                    <p className="text-gray-500">จำลองเงินออมในอนาคตด้วย Monte Carlo Simulation</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Controls */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
                >
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span>
                        กำหนดตัวแปร (Parameters)
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                            <label className="block text-sm font-bold text-gray-700">อายุปัจจุบัน vs เกษียณ</label>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">ปัจจุบัน {currentAge}</span>
                                <input
                                    type="range"
                                    min={currentAge + 1}
                                    max="70"
                                    value={retireAge}
                                    onChange={e => setRetireAge(Number(e.target.value))}
                                    className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm font-bold text-indigo-600">{retireAge} ปี</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เงินเดือนปัจจุบัน (บาท)</label>
                            <input
                                type="number"
                                value={salary}
                                onChange={e => setSalary(Number(e.target.value))}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">การเติบโตของเงินเดือน (%)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryGrowth}
                                    onChange={e => setSalaryGrowth(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                                <span className="text-gray-500 font-medium">%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">แผนการลงทุน (คาดการณ์)</label>
                            <select
                                value={planId}
                                onChange={e => setPlanId(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                {INVESTMENT_PLANS.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name} (เฉลี่ย +{plan.historicalReturn}%)</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800 border border-indigo-100">
                        <h3 className="font-bold mb-1 flex items-center gap-1"><Info size={16} /> หมายเหตุ</h3>
                        การคำนวณนี้เป็นเพียงการประมาณการ (Simulation) ไม่ใช่การการันตีผลตอบแทนจริง
                    </div>
                </motion.div>

                {/* Right Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">2</span>
                                ผลลัพธ์คาดการณ์ (Projection)
                            </h2>
                            <p className="text-sm text-gray-500 ml-8">ณ อายุ {retireAge} ปี คุณจะมีเงินออมประมาณ:</p>
                        </div>
                        <div className="text-right">
                            <motion.div
                                key={finalAmount}
                                initial={{ scale: 0.8, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isTargetMet ? 'from-emerald-600 to-teal-500' : 'from-amber-500 to-orange-500'}`}
                            >
                                ฿{(finalAmount / 1000000).toFixed(2)} M
                            </motion.div>
                            {isTargetMet ? (
                                <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded inline-block mt-1">✅ ถึงเป้าหมาย 10 ล้านบาท</div>
                            ) : (
                                <div className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded inline-block mt-1">⚠️ ยังขาดอีก ฿{((targetAmount - finalAmount) / 1000000).toFixed(2)} ล้าน</div>
                            )}
                        </div>
                    </div>

                    <div className="h-[400px] w-full flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={simulationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBull" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBear" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="age" label={{ value: 'อายุ (ปี)', position: 'insideBottomRight', offset: -10 }} stroke="#94A3B8" fontSize={12} />
                                <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} stroke="#94A3B8" fontSize={12} />
                                <Tooltip
                                    formatter={(val: number) => `฿${val.toLocaleString()}`}
                                    labelFormatter={(label) => `อายุ ${label} ปี`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                {/* Bull Case Range */}
                                <Area type="monotone" dataKey="bull" fill="url(#colorBull)" stroke="#10B981" strokeWidth={2} name="กรณีตลาดดีเยี่ยม (Bull)" />

                                {/* Bear Case Range */}
                                <Area type="monotone" dataKey="bear" fill="url(#colorBear)" stroke="#F59E0B" strokeWidth={2} name="กรณีตลาดแย่ (Bear)" />

                                {/* Base Case */}
                                <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3} dot={false} name="กรณีปกติ (Base Case)" />

                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
