'use client';

import React, { useState } from 'react';
import { INVESTMENT_PLANS } from '@/lib/mock-gpf-data';
import { InvestmentPlan } from '@/types/gpf';
import Link from 'next/link';
import { ChevronLeft, Check, Info, TrendingUp, AlertTriangle, Shield, Activity, Scale, X } from 'lucide-react';
import PlanComparisonModal from '@/components/PlanComparisonModal';

import { motion, AnimatePresence } from 'framer-motion';

export default function PlanSelectionPage() {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [filterRisk, setFilterRisk] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

    // Comparison State
    const [isCompareMode, setCompareMode] = useState(false);
    const [compareList, setCompareList] = useState<string[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const filteredPlans = filterRisk === 'All'
        ? INVESTMENT_PLANS
        : INVESTMENT_PLANS.filter(p => p.riskLevel === filterRisk);

    const handleSelect = (planId: string) => {
        setSelectedPlanId(planId);
        setShowConfirm(true);
    };

    const toggleCompare = (planId: string) => {
        if (compareList.includes(planId)) {
            setCompareList(compareList.filter(id => id !== planId));
        } else {
            if (compareList.length < 3) {
                setCompareList([...compareList, planId]);
            } else {
                alert('เลือกเปรียบเทียบได้สูงสุด 3 แผนครับ');
            }
        }
    };

    const confirmSelection = () => {
        // In a real app, this would call an API
        alert(`เปลี่ยนแผนสำเร็จ! คุณได้เลือกแผน "${INVESTMENT_PLANS.find(p => p.id === selectedPlanId)?.name}" เรียบร้อยแล้ว\n\n(Simulation Only)`);
        setShowConfirm(false);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-6 bg-gradient-to-r from-blue-50 to-white p-4 rounded-2xl border border-blue-100"
            >
                <Link href="/gpf-avc" className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                    <ChevronLeft className="w-6 h-6 text-blue-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">เลือกแผนการลงทุน</h1>
                    <p className="text-gray-500">เลือกแผนที่เหมาะสมกับเป้าหมายและความเสี่ยงของคุณ</p>
                </div>
            </motion.div>

            {/* Filters & Compare Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                    {['All', 'Low', 'Medium', 'High'].map((risk) => (
                        <button
                            key={risk}
                            onClick={() => setFilterRisk(risk as any)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap
                  ${filterRisk === risk
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
                        >
                            {risk === 'All' ? 'ทั้งหมด' : `ความเสี่ยง${risk === 'Low' ? 'ต่ำ' : risk === 'Medium' ? 'ปานกลาง' : 'สูง'}`}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {compareList.length > 0 && (
                        <button
                            onClick={() => setShowCompareModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg animate-in fade-in"
                        >
                            <Scale size={18} />
                            เปรียบเทียบ ({compareList.length})
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setCompareMode(!isCompareMode);
                            if (isCompareMode) setCompareList([]); // Clear selection when exiting
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all
                        ${isCompareMode
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'}`}
                    >
                        {isCompareMode ? (
                            <>
                                <X size={18} /> ปิดโหมดเปรียบเทียบ
                            </>
                        ) : (
                            <>
                                <Scale size={18} /> เปรียบเทียบแผน
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24" // Added padding bottom for floating bar
            >
                <AnimatePresence mode="popLayout">
                    {filteredPlans.map((plan) => (
                        <motion.div
                            layout
                            key={plan.id}
                            variants={item}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all flex flex-col group relative
                                ${compareList.includes(plan.id) ? 'border-2 border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100'}`}
                            onClick={() => {
                                if (isCompareMode) toggleCompare(plan.id);
                            }}
                        >
                            {/* Compare Checkbox Overlay */}
                            {isCompareMode && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                        ${compareList.includes(plan.id)
                                            ? 'bg-indigo-600 border-indigo-600 scale-110'
                                            : 'bg-white border-gray-300'}`}
                                    >
                                        {compareList.includes(plan.id) && <Check size={14} className="text-white" />}
                                    </div>
                                </div>
                            )}

                            {/* Card Header */}
                            <div className={`h-2 ${plan.riskLevel === 'High' ? 'bg-red-500' :
                                plan.riskLevel === 'Medium' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`} />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5
                      ${plan.riskLevel === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                                            plan.riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                                'bg-green-50 text-green-700 border border-green-100'}`}>
                                        {plan.riskLevel === 'High' ? <Activity size={14} /> :
                                            plan.riskLevel === 'Medium' ? <TrendingUp size={14} /> :
                                                <Shield size={14} />}
                                        เสี่ยง{plan.riskLevel === 'High' ? 'สูง' : plan.riskLevel === 'Medium' ? 'ปานกลาง' : 'ต่ำ'}
                                    </div>
                                    {plan.id.includes('LIFEPATH') && (
                                        <span className="px-2.5 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 shadow-sm">
                                            Life Path
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 min-h-[56px] group-hover:text-blue-600 transition-colors">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 min-h-[60px] leading-relaxed">{plan.description}</p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 mb-1">ผลตอบแทนเฉลี่ย</div>
                                        <div className="text-xl font-bold text-blue-600">+{plan.historicalReturn.toFixed(2)}%</div>
                                        <div className="text-[10px] text-gray-400">ต่อปี (ย้อนหลัง)</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 mb-1">สินทรัพย์เสี่ยง</div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {plan.allocation.reduce((sum, item) => item.assetClass.includes('หุ้น') ? sum + item.percentage : sum, 0)}%
                                        </div>
                                        <div className="text-[10px] text-gray-400">สัดส่วนหุ้น</div>
                                    </div>
                                </div>

                                {/* Allocation Visual */}
                                <div className="mb-6">
                                    <div className="text-xs font-bold text-gray-900 mb-3 flex justify-between">
                                        <span>สัดส่วนการลงทุน</span>
                                        <span className="text-gray-400 font-normal">ละเอียด</span>
                                    </div>
                                    <div className="flex h-3 rounded-full overflow-hidden w-full bg-gray-100 shadow-inner">
                                        {plan.allocation.map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                                style={{ backgroundColor: getColorForAsset(item.assetClass) }}
                                                className="h-full relative group/segment"
                                                title={`${item.assetClass}: ${item.percentage}%`}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                                        {plan.allocation.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex items-center text-[10px] text-gray-500">
                                                <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: getColorForAsset(item.assetClass) }} />
                                                {item.assetClass}
                                            </div>
                                        ))}
                                        {plan.allocation.length > 3 && (
                                            <div className="flex items-center text-[10px] text-gray-400">
                                                +{plan.allocation.length - 3} อื่นๆ
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card select when clicking button in review mode? Actually in compare mode card click toggles.
                                            if (isCompareMode) toggleCompare(plan.id);
                                            else handleSelect(plan.id);
                                        }}
                                        className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2
                                            ${isCompareMode
                                                ? (compareList.includes(plan.id)
                                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100')
                                                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                                            }`}
                                    >
                                        {isCompareMode
                                            ? (compareList.includes(plan.id) ? 'ยกเลิกการเลือก' : 'เลือกเปรียบเทียบ')
                                            : 'เลือกแผนนี้'
                                        }
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Floating Compare Bar */}
            {compareList.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-6 border border-slate-700 transition-all animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {compareList.length}
                        </div>
                        <span className="font-medium">แผนที่เลือก</span>
                    </div>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <button
                        onClick={() => setShowCompareModal(true)}
                        className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                        <Scale size={18} /> เปรียบเทียบเลย
                    </button>
                    <button
                        onClick={() => setCompareList([])}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Compare Modal */}
            <PlanComparisonModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                plans={INVESTMENT_PLANS.filter(p => compareList.includes(p.id))}
                onSelectPlan={(planId) => {
                    handleSelect(planId);
                    setShowCompareModal(false);
                }}
            />

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && selectedPlanId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full mb-4 mx-auto text-indigo-600">
                                <Info className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">ยืนยันการเปลี่ยนแผน?</h2>
                            <p className="text-gray-500 text-sm text-center mb-6">
                                กรุณาตรวจสอบแผนที่คุณเลือก การเปลี่ยนแปลงจะมีผลในวันทำการถัดไป
                            </p>

                            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-6">
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">แผนที่คุณเลือก</div>
                                <div className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                                    {INVESTMENT_PLANS.find(p => p.id === selectedPlanId)?.name}
                                    <Check className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={confirmSelection}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95"
                                >
                                    ยืนยันเปลี่ยนแผน
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getColorForAsset(asset: string): string {
    if (asset.includes('หุ้นไทย')) return '#4F46E5'; // Indigo-600
    if (asset.includes('หุ้นต่างประเทศ')) return '#06B6D4'; // Cyan-500
    if (asset.includes('ตราสารหนี้')) return '#F59E0B'; // Amber-500
    if (asset.includes('เงินฝาก')) return '#10B981'; // Emerald-500
    return '#6366F1';
}
