'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale,
    TrendingUp,
    TrendingDown,
    Minus,
    CheckCircle2,
    AlertCircle,
    BarChart2,
    RefreshCw,
    ChevronRight,
    Info,
    History,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { INVESTMENT_PLANS } from '@/lib/mock-gpf-data';
import { InvestmentPlan } from '@/types/gpf';
import { generateRebalancingRecommendations, calculateRebalancingImpact } from '@/lib/rebalancingEngine';
import type { Fund, RebalancingRecommendation } from '@/types/portfolio';
import { saveRebalancingHistory, loadRebalancingHistory } from '@/lib/portfolio-storage';
import { RebalancingTransaction } from '@/types/rebalancing';
import { getPortfolio } from '@/app/actions/portfolio';
import { transformHoldingsToFunds } from '@/lib/fund-mapper';



type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export default function RebalancingPage() {
    const [activeTab, setActiveTab] = useState<'adjust' | 'history'>('adjust');
    const [userAge, setUserAge] = useState(35);
    const [retirementAge, setRetirementAge] = useState(60);
    const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isRebalancing, setIsRebalancing] = useState(false);
    const [rebalanceComplete, setRebalanceComplete] = useState(false);
    const [history, setHistory] = useState<RebalancingTransaction[]>([]);

    // Real portfolio data
    const [currentPortfolio, setCurrentPortfolio] = useState<Fund[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

    // Load rebalancing history
    useEffect(() => {
        setHistory(loadRebalancingHistory());
    }, []);

    // Fetch real portfolio data
    useEffect(() => {
        async function fetchPortfolio() {
            try {
                setIsLoadingPortfolio(true);
                const portfolio = await getPortfolio();
                const funds = transformHoldingsToFunds(portfolio.holdings || [], portfolio.totalBalance);
                setCurrentPortfolio(funds);
                setTotalValue(portfolio.totalBalance);
            } catch (error) {
                console.error('Failed to load portfolio:', error);
                // Keep empty portfolio on error
            } finally {
                setIsLoadingPortfolio(false);
            }
        }
        fetchPortfolio();
    }, []);

    // Generate recommendations based on current settings
    const recommendations = useMemo(() => {
        if (currentPortfolio.length === 0) return [];
        return generateRebalancingRecommendations(
            currentPortfolio,
            totalValue,
            {
                currentAge: userAge,
                retirementAge: retirementAge,
                riskTolerance: riskTolerance,
            }
        );
    }, [currentPortfolio, totalValue, userAge, retirementAge, riskTolerance]);

    const impact = useMemo(() => calculateRebalancingImpact(recommendations), [recommendations]);

    // Calculate drift (how far from target)
    const totalDrift = useMemo(() => {
        return recommendations.reduce((sum, r) => sum + Math.abs(r.currentAllocation - r.targetAllocation), 0);
    }, [recommendations]);

    const getDriftStatus = () => {
        if (totalDrift < 5) return { label: 'ดี', color: 'text-green-400', bg: 'bg-green-500/20' };
        if (totalDrift < 15) return { label: 'ควรปรับ', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { label: 'ต้องปรับด่วน', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    const driftStatus = getDriftStatus();

    const handleRebalance = async () => {
        setIsRebalancing(true);

        // Create transaction record
        const transaction: RebalancingTransaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            totalAmount: impact.totalAdjustment,
            status: 'completed',
            items: recommendations.map(rec => ({
                fundName: rec.fundName,
                action: rec.action,
                amount: Math.abs(rec.amount)
            })).filter((item): item is { fundName: string; action: 'buy' | 'sell'; amount: number } => item.action !== 'hold')
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        saveRebalancingHistory(transaction);
        setHistory(prev => [transaction, ...prev]);

        setIsRebalancing(false);
        setRebalanceComplete(true);
        setShowConfirmation(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <Link href="/gpf-avc" className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1 mb-2">
                            <ChevronRight className="w-4 h-4 rotate-180" /> กลับหน้า AVC
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Scale className="w-8 h-8 text-purple-600" />
                            ระบบปรับสมดุลพอร์ต (Rebalancing)
                        </h1>
                        <p className="text-gray-600 mt-1">วิเคราะห์และปรับสัดส่วนการลงทุนให้ตรงเป้าหมาย</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveTab('adjust')}
                            className={`px-8 py-3 rounded-full text-base font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 ${activeTab === 'adjust' ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                                }`}
                        >
                            <Scale className="w-5 h-5" />
                            ปรับสมดุล
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-8 py-3 rounded-full text-base font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                                }`}
                        >
                            <History className="w-5 h-5" />
                            ประวัติ{' '}
                            {history.length > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'history' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{history.length}</span>
                            )}
                        </button>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'adjust' ? (
                        <motion.div
                            key="adjust"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Drift Status Card */}
                            <div className={`card ${driftStatus.bg} border border-gray-200 shadow-sm`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-1">สถานะพอร์ตปัจจุบัน</h2>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-4xl font-bold ${driftStatus.color}`}>
                                                {totalDrift.toFixed(1)}%
                                            </span>
                                            <span className="text-lg text-gray-600">Drift จากเป้าหมาย</span>
                                        </div>
                                        <p className={`text-sm mt-2 ${driftStatus.color}`}>
                                            สถานะ: {driftStatus.label}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden md:block">
                                            <p className="text-gray-600 text-sm">มูลค่าพอร์ตรวม</p>
                                            <p className="text-2xl font-bold text-gray-900">฿{totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Settings */}
                            <div className="bg-gray-50 backdrop-blur-lg rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-purple-400" />
                                    ปรับเป้าหมายการลงทุน
                                </h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Age */}
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">อายุปัจจุบัน</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min={20}
                                                max={60}
                                                value={userAge}
                                                onChange={(e) => setUserAge(Number(e.target.value))}
                                                className="flex-1 accent-purple-500"
                                            />
                                            <span className="text-xl font-bold w-12 text-center">{userAge}</span>
                                        </div>
                                    </div>
                                    {/* Retirement Age */}
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">เกษียณอายุ</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min={55}
                                                max={65}
                                                value={retirementAge}
                                                onChange={(e) => setRetirementAge(Number(e.target.value))}
                                                className="flex-1 accent-purple-500"
                                            />
                                            <span className="text-xl font-bold w-12 text-center">{retirementAge}</span>
                                        </div>
                                    </div>
                                    {/* Risk Tolerance */}
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">ระดับความเสี่ยง</label>
                                        <div className="flex gap-2">
                                            {(['conservative', 'moderate', 'aggressive'] as RiskTolerance[]).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setRiskTolerance(level)}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95 ${riskTolerance === level
                                                        ? 'bg-purple-500 text-white shadow-purple-200'
                                                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 border border-gray-200'
                                                        }`}
                                                >
                                                    {level === 'conservative' ? 'ต่ำ' : level === 'moderate' ? 'กลาง' : 'สูง'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-gray-50 backdrop-blur-lg rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-purple-400" />
                                    คำแนะนำการปรับสมดุล
                                </h2>

                                {recommendations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                                        <p>พอร์ตของคุณสมดุลดีอยู่แล้ว! ไม่ต้องปรับอะไร</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recommendations.map((rec, index) => (
                                            <div
                                                key={rec.fundId}
                                                className={`p-4 rounded-xl border ${rec.action === 'buy'
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : rec.action === 'sell'
                                                        ? 'bg-red-500/10 border-red-500/30'
                                                        : 'bg-gray-500/10 border-gray-500/30'
                                                    }`}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${rec.action === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                                                            }`}>
                                                            {rec.action === 'buy' ? (
                                                                <TrendingUp className="w-5 h-5 text-green-400" />
                                                            ) : (
                                                                <TrendingDown className="w-5 h-5 text-red-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{rec.fundName}</h3>
                                                            <p className="text-sm text-gray-600">{rec.reason}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="text-center">
                                                            <p className="text-gray-600">ปัจจุบัน</p>
                                                            <p className="font-bold text-gray-900">{rec.currentAllocation.toFixed(1)}%</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                                        <div className="text-center">
                                                            <p className="text-gray-600">เป้าหมาย</p>
                                                            <p className="font-bold text-purple-400">{rec.targetAllocation.toFixed(1)}%</p>
                                                        </div>
                                                        <div className={`text-center px-3 py-1 rounded-lg ${rec.action === 'buy' ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                                                            }`}>
                                                            <p className="font-bold">
                                                                {rec.action === 'buy' ? '+' : '-'}฿{Math.abs(rec.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Impact Summary */}
                                {recommendations.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="text-sm text-gray-600">
                                                <p>ยอดเงินที่ต้องสับเปลี่ยน: <span className="text-gray-900 font-bold">฿{impact.totalAdjustment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
                                            </div>
                                            <button
                                                onClick={() => setShowConfirmation(true)}
                                                disabled={rebalanceComplete}
                                                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${rebalanceComplete
                                                    ? 'bg-green-500/30 text-green-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                                    }`}
                                            >
                                                {rebalanceComplete ? (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        ดำเนินการเรียบร้อย
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="w-5 h-5" />
                                                        ยืนยันการปรับสมดุล
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-gray-50 backdrop-blur-lg rounded-2xl border border-gray-200 p-6"
                        >
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                ประวัติการปรับสมดุล (Rebalancing History)
                            </h2>

                            {history.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <History className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                    <p>ยังไม่มีประวัติการทำรายการ</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((tx) => (
                                        <div key={tx.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-purple-500/30 transition-colors">
                                            <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                        <span className="font-semibold text-gray-900">ปรับสมดุลสำเร็จ</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {new Date(tx.date).toLocaleDateString('th-TH', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-600 uppercase tracking-wider">ยอดรวมเปลี่ยนแปลง</span>
                                                    <p className="font-bold text-gray-900">฿{tx.totalAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {tx.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-gray-300">{item.fundName}</span>
                                                        <span className={item.action === 'buy' ? 'text-green-400' : 'text-red-400'}>
                                                            {item.action === 'buy' ? 'ซื้อ' : 'ขาย'} ฿{item.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {showConfirmation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowConfirmation(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-gray-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center">
                                    <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">ยืนยันการปรับสมดุล?</h3>
                                    <p className="text-gray-600 mb-6">
                                        ระบบจะทำการสับเปลี่ยนหน่วยลงทุนตามคำแนะนำ
                                        ยอดรวม ฿{impact.totalAdjustment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowConfirmation(false)}
                                            className="flex-1 py-3 rounded-xl bg-white hover:bg-white/20 transition-colors"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={handleRebalance}
                                            disabled={isRebalancing}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold flex items-center justify-center gap-2"
                                        >
                                            {isRebalancing ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    กำลังดำเนินการ...
                                                </>
                                            ) : (
                                                'ยืนยัน'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
