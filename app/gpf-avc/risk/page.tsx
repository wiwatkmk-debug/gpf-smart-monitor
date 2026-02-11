'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function RiskAssessmentPage() {
    const [selectedRisk, setSelectedRisk] = useState<number | null>(null);

    const riskLevels = [
        {
            level: 1,
            name: 'ต่ำมาก',
            color: 'bg-green-100 text-green-800 border-green-300',
            description: 'เหมาะสำหรับผู้ที่ไม่ต้องการความเสี่ยง',
            allocation: 'หุ้น 0-10%, พันธบัตร 90-100%'
        },
        {
            level: 2,
            name: 'ต่ำ',
            color: 'bg-blue-100 text-blue-800 border-blue-300',
            description: 'เหมาะสำหรับผู้ที่ต้องการความเสี่ยงต่ำ',
            allocation: 'หุ้น 10-30%, พันธบัตร 70-90%'
        },
        {
            level: 3,
            name: 'ปานกลาง',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            description: 'เหมาะสำหรับผู้ที่รับความเสี่ยงปานกลางได้',
            allocation: 'หุ้น 30-50%, พันธบัตร 50-70%'
        },
        {
            level: 4,
            name: 'สูง',
            color: 'bg-orange-100 text-orange-800 border-orange-300',
            description: 'เหมาะสำหรับผู้ที่รับความเสี่ยงสูงได้',
            allocation: 'หุ้น 50-70%, พันธบัตร 30-50%'
        },
        {
            level: 5,
            name: 'สูงมาก',
            color: 'bg-red-100 text-red-800 border-red-300',
            description: 'เหมาะสำหรับผู้ที่รับความเสี่ยงสูงมากได้',
            allocation: 'หุ้น 70-100%, พันธบัตร 0-30%'
        }
    ];

    return (
        <div className="py-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
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
                            <Shield className="w-8 h-8 text-purple-600" />
                            ประเมินความเสี่ยง
                        </h1>
                        <p className="text-gray-600 mt-1">ค้นหาระดับความเสี่ยงที่เหมาะสมกับคุณ</p>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">เกี่ยวกับการประเมินความเสี่ยง</h3>
                            <p className="text-gray-600 text-sm">
                                การประเมินความเสี่ยงจะช่วยให้คุณเข้าใจว่าคุณสามารถรับความผันผวนของผลตอบแทนได้มากน้อยแค่ไหน
                                และช่วยเลือกแผนการลงทุนที่เหมาะสมกับคุณ
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Risk Levels */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-purple-600" />
                        ระดับความเสี่ยง
                    </h2>
                    <div className="space-y-3">
                        {riskLevels.map((risk) => (
                            <motion.button
                                key={risk.level}
                                onClick={() => setSelectedRisk(risk.level)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedRisk === risk.level
                                        ? risk.color + ' shadow-lg'
                                        : 'bg-white border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl font-bold">
                                                {risk.level}
                                            </span>
                                            <div>
                                                <div className="font-bold text-lg">{risk.name}</div>
                                                <div className="text-sm text-gray-600">{risk.description}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            <strong>สัดส่วนแนะนำ:</strong> {risk.allocation}
                                        </div>
                                    </div>
                                    {selectedRisk === risk.level && (
                                        <div className="ml-4">
                                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Selected Risk Details */}
                {selectedRisk && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                    >
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            คำแนะนำสำหรับระดับความเสี่ยง {selectedRisk}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                คุณเลือกระดับความเสี่ยง <strong>{riskLevels[selectedRisk - 1].name}</strong>
                                ซึ่งเหมาะสำหรับผู้ที่{riskLevels[selectedRisk - 1].description.toLowerCase()}
                            </p>
                            <div className="flex gap-3 mt-4">
                                <Link
                                    href="/gpf-avc/plans"
                                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                                >
                                    ดูแผนการลงทุนที่เหมาะสม
                                </Link>
                                <Link
                                    href="/gpf-avc/rebalancing"
                                    className="px-6 py-3 bg-white text-purple-600 font-bold rounded-full border-2 border-purple-600 hover:bg-purple-50 transition-all"
                                >
                                    ปรับสมดุลพอร์ต
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Coming Soon Features */}
                <div className="card bg-gray-50 border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">🚀 ฟีเจอร์ที่กำลังพัฒนา</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            แบบประเมินความเสี่ยงแบบละเอียด (Risk Questionnaire)
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            การวิเคราะห์ความเสี่ยงตามอายุและเป้าหมาย
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            คำแนะนำการปรับพอร์ตตามความเสี่ยงที่เหมาะสม
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
