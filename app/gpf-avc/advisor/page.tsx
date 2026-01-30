'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, TrendingUp, RefreshCcw, Sparkles } from 'lucide-react';
import { RISK_QUIZ, calculateRiskProfile, RiskResult, getRecommendedPlans } from '@/lib/risk-engine';
import { INVESTMENT_PLANS } from '@/lib/mock-gpf-data';
import { motion, AnimatePresence } from 'framer-motion';

import { generateInvestmentAdvice } from '@/app/actions/advisor';
import { getPortfolio } from '@/app/actions/portfolio';
import { GPFAccount } from '@/types/gpf';

export default function AdvisorPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<RiskResult | null>(null);
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
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
            setAiAdvice(null); // Reset AI advice on new quiz
        }
    };

    const handleReset = () => {
        setAnswers({});
        setCurrentStep(0);
        setResult(null);
        setAiAdvice(null);
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

            const advice = await generateInvestmentAdvice({
                riskProfile: result,
                currentPortfolio: portfolio,
                recommendedPlans: recommendedPlans,
                userQuestionsAndAnswers: questionsText
            });

            setAiAdvice(advice);
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
            <div className="p-6 max-w-2xl mx-auto space-y-6">
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
                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAskAI}
                                disabled={isLoadingAi}
                                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-purple-500/20 transition-all ${isLoadingAi ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-purple-500/40'
                                    }`}
                            >
                                {isLoadingAi ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        กำลังวิเคราะห์ข้อมูล...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        ขอคำแนะนำจาก AI Expert (Gemini)
                                    </>
                                )}
                            </motion.button>
                        </div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">แผนที่แนะนำสำหรับคุณ</h3>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full animate-bounce">Recommended</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recommendedPlans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-bold text-gray-900">{plan.name}</div>
                                    <div className="text-sm text-gray-500">{plan.description}</div>
                                    <div className="flex gap-2 mt-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded text-white ${plan.riskLevel === 'Low' ? 'bg-green-500' :
                                            plan.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}>
                                            เสี่ยง{plan.riskLevel === 'Low' ? 'ต่ำ' : plan.riskLevel === 'Medium' ? 'ปานกลาง' : 'สูง'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700">ผลตอบแทนคาดหวัง {plan.historicalReturn}%</span>
                                    </div>
                                </div>
                                <Link href={`/gpf-avc/plans?selected=${plan.id}`} className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap">
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
        <div className="p-6 max-w-xl mx-auto min-h-[600px] flex flex-col">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
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
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
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

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.02, backgroundColor: "#eff6ff" }} // hover:bg-blue-50
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswer(option.score)}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-center justify-between bg-white"
                                >
                                    <span className="text-gray-700 group-hover:text-blue-800 font-medium">{option.label}</span>
                                    <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                className="mt-8 p-4 bg-yellow-50 rounded-lg flex gap-3 text-xs text-yellow-800"
            >
                <AlertTriangle className="shrink-0 w-4 h-4" />
                <p>การลงทุนมีความเสี่ยง ผู้ลงทุนควรทำความเข้าใจลักษณะสินค้า เงื่อนไขผลตอบแทน และความเสี่ยงก่อนตัดสินใจลงทุน</p>
            </motion.div>
        </div>
    );
}
