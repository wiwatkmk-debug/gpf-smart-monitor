'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, TrendingUp, RefreshCcw, Sparkles } from 'lucide-react';
import { RISK_QUIZ, calculateRiskProfile, RiskResult, getRecommendedPlans } from '@/lib/risk-engine';
import { motion, AnimatePresence } from 'framer-motion';

import { generateInvestmentAdvice, analyzePortfolioHealth, HealthCheckResult } from '@/app/actions/advisor';
import { getSocialBenchmark, BenchmarkResult } from '@/app/actions/benchmarking';
import { getPortfolio } from '@/app/actions/portfolio';
import { GPFAccount } from '@/types/gpf';
import HealthScoreCard from '@/components/advisor/HealthScoreCard';
import SocialRankCard from '@/components/advisor/SocialRankCard';

export default function AdvisorPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<RiskResult | null>(null);
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
    const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [portfolio, setPortfolio] = useState<GPFAccount | null>(null);

    // Fetch portfolio on mount
    React.useEffect(() => {
        getPortfolio().then(setPortfolio);
    }, []);

    const handleAnswer = (score: number) => {
        const questionId = RISK_QUIZ[currentStep].id;
        const newAnswers = { ...answers, [questionId]: score };
        setAnswers(newAnswers);

        if (currentStep < RISK_QUIZ.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 200);
        } else {
            // Finished
            const profile = calculateRiskProfile(newAnswers);
            setResult(profile);
            setAiAdvice(null);
            setHealthResult(null);
            setBenchmark(null);
        }
    };

    const handleReset = () => {
        setAnswers({});
        setCurrentStep(0);
        setResult(null);
        setAiAdvice(null);
        setHealthResult(null);
        setBenchmark(null);
    };

    const handleAskAI = async () => {
        if (!result || !portfolio) return;
        setIsLoadingAi(true);
        try {
            const recommendedPlans = getRecommendedPlans(result.recommendedPlanIds);

            // Map answers to text for better AI context
            const questionsText: Record<string, string> = {};
            Object.entries(answers).forEach(([qId, score]) => {
                const q = RISK_QUIZ.find(q => q.id === Number(qId));
                const opt = q?.options.find(o => o.score === score);
                if (q && opt) questionsText[q.text] = opt.label;
            });

            const requestData = {
                riskProfile: result,
                currentPortfolio: portfolio,
                recommendedPlans: recommendedPlans,
                userQuestionsAndAnswers: questionsText
            };

            // Run in parallel for speed
            const [advice, health, bench] = await Promise.all([
                generateInvestmentAdvice(requestData),
                analyzePortfolioHealth(requestData),
                getSocialBenchmark()
            ]);

            setAiAdvice(advice);
            setHealthResult(health);
            setBenchmark(bench);
        } catch (e) {
            console.error(e);
            alert('AI Service temporarily unavailable');
        } finally {
            setIsLoadingAi(false);
        }
    };

    const currentQuestion = RISK_QUIZ[currentStep];
    const progress = ((currentStep + 1) / RISK_QUIZ.length) * 100;

    // Render Result View
    if (result) {
        const recommendedPlans = getRecommendedPlans(result.recommendedPlanIds);

        return (
            <div className="py-6 max-w-2xl mx-auto flex flex-col gap-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-center space-y-2"
                >
                    <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-lg shadow-blue-500/10">
                        {result.level === 'Low' ? <Shield size={48} /> :
                            result.level === 'Medium' ? <CheckCircle size={48} /> :
                                <TrendingUp size={48} />}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">ผลการประเมินของคุณ</h1>
                    <div className="text-xl font-medium text-blue-700">{result.label} (Score: {result.score}/20)</div>
                    <p className="text-gray-500 max-w-md mx-auto">{result.description}</p>
                </motion.div>

                {/* Social Benchmark Card */}
                <AnimatePresence>
                    {benchmark && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-0"
                        >
                            <SocialRankCard data={benchmark} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Health Score Card */}
                <AnimatePresence>
                    {healthResult && (
                        <div className="mb-6">
                            <HealthScoreCard result={healthResult} />
                        </div>
                    )}
                </AnimatePresence>

                {/* AI Advice Section */}
                <AnimatePresence>
                    {aiAdvice ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-purple-50 p-6 rounded-xl border border-purple-200"
                        >
                            <div className="flex items-center gap-2 mb-3 text-purple-800 font-bold">
                                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" /> AI Smart Advisor
                            </div>
                            <p className="text-purple-900 leading-relaxed whitespace-pre-line">{aiAdvice}</p>
                        </motion.div>
                    ) : (
                        <div className="flex justify-center flex-col items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAskAI}
                                disabled={isLoadingAi}
                                className={`flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-purple-500/20 transition-all ${isLoadingAi ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-purple-500/40'
                                    }`}
                            >
                                {isLoadingAi ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        กำลังตรวจสุขภาพพอร์ต...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        วิเคราะห์ & ตรวจสุขภาพพอร์ตเชิงลึก (AI Expert)
                                    </>
                                )}
                            </motion.button>
                            <p className="text-xs text-gray-400">Powered by Gemini 2.0 Flash</p>
                        </div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <h3 className="font-bold text-gray-800 text-lg">แผนที่แนะนำสำหรับคุณ</h3>
                        <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full animate-pulse">Recommended</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {recommendedPlans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                            >
                                <div className="flex-1">
                                    <div className="flex items-start justify-between md:justify-start gap-3 mb-2">
                                        <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{plan.name}</div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${plan.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                                            plan.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            เสี่ยง{plan.riskLevel === 'Low' ? 'ต่ำ' : plan.riskLevel === 'Medium' ? 'ปานกลาง' : 'สูง'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-3 leading-relaxed">{plan.description}</div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            ผลตอบแทน {plan.historicalReturn}%
                                        </div>
                                        {plan.allocation && (
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                หุ้น {plan.allocation.reduce((sum: number, item: any) => item.assetClass.includes('หุ้น') ? sum + item.percentage : sum, 0)}%
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Link href={`/gpf-avc/plans?selected=${plan.id}`} className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all text-sm whitespace-nowrap text-center shadow-sm">
                                    ดูรายละเอียด
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="flex justify-center gap-4 pt-6">
                    <button onClick={handleReset} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
                        <RefreshCcw size={18} /> ทำแบบประเมินใหม่
                    </button>
                    <Link href="/gpf-avc" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                        กลับหน้าหลัก <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    // Render Quiz View
    return (
        <div className="py-6 max-w-xl mx-auto min-h-[600px] flex flex-col gap-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <Link href="/gpf-avc" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Smart Advisor</h1>
                    <p className="text-gray-500">แบบประเมินความเสี่ยงเพื่อแนะนำแผนลงทุน</p>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            {/* Question Card */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-2 text-sm font-medium text-blue-600">คำถามที่ {currentStep + 1}/{RISK_QUIZ.length}</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 min-h-[60px]">
                            {currentQuestion.text}
                        </h2>

                        <div className="flex flex-col gap-4">
                            {currentQuestion.options.map((option, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswer(option.score)}
                                    className="w-full text-left p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-500 transition-all group flex items-center justify-between bg-white relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-gray-800 group-hover:text-blue-700 font-semibold text-lg pl-2 transition-colors">{option.label}</span>
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 bg-yellow-50 rounded-lg flex gap-3 text-xs text-yellow-800"
            >
                <AlertTriangle className="shrink-0 w-4 h-4" />
                <p>การลงทุนมีความเสี่ยง ผู้ลงทุนควรทำความเข้าใจลักษณะสินค้า เงื่อนไขผลตอบแทน และความเสี่ยงก่อนตัดสินใจลงทุน</p>
            </motion.div>
        </div>
    );
}
