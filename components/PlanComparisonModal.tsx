'use client';

import React from 'react';
import { InvestmentPlan } from '@/types/gpf';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PlanComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    plans: InvestmentPlan[];
    onSelectPlan: (planId: string) => void;
}

export default function PlanComparisonModal({ isOpen, onClose, plans, onSelectPlan }: PlanComparisonModalProps) {
    // Shared colors for consistency with main page
    const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#10B981', '#6366F1'];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    />

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all animate-in zoom-in-95 fade-in duration-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">เปรียบเทียบแผนการลงทุน</h2>
                                <p className="text-gray-500">เปรียบเทียบรายละเอียดเพื่อเลือกแผนที่เหมาะสมที่สุด</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Comparison Grid - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {plans.map((plan, index) => (
                                    <div key={plan.id} className="flex flex-col space-y-6">
                                        {/* Plan Header */}
                                        <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="text-sm font-semibold text-gray-500 mb-1">แผนที่ {index + 1}</div>
                                            <h3 className="text-xl font-bold text-blue-900 mb-2">{plan.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold
                                                ${plan.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                                                    plan.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'}`}>
                                                ความเสี่ยง{plan.riskLevel === 'Low' ? 'ต่ำ' : plan.riskLevel === 'Medium' ? 'ปานกลาง' : 'สูง'}
                                            </span>
                                        </div>

                                        {/* Asset Allocation Chart */}
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-700 mb-4 text-center">สัดส่วนการลงทุน</h4>
                                            <div className="h-48 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={plan.allocation}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={60}
                                                            paddingAngle={5}
                                                            dataKey="percentage"
                                                        >
                                                            {plan.allocation.map((entry, idx) => (
                                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Legend */}
                                            <div className="mt-2 space-y-1">
                                                {plan.allocation.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                            <span className="text-gray-600 truncate max-w-[120px]">{item.assetClass}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900">{item.percentage}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-4">
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <div className="text-xs text-gray-500 mb-1">ผลตอบแทนเฉลี่ยย้อนหลัง</div>
                                                <div className="text-2xl font-bold text-blue-600">+{plan.historicalReturn.toFixed(2)}%</div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="text-xs text-gray-500 mb-2 font-bold">จุดเด่น</div>
                                                <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                            <button
                                                onClick={() => {
                                                    onSelectPlan(plan.id);
                                                    onClose();
                                                }}
                                                className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                เลือกแผนนี้
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
