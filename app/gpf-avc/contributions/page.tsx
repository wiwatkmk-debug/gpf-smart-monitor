'use client';

import React, { useState } from 'react';
import { MOCK_GPF_ACCOUNT } from '@/lib/mock-gpf-data';
import Link from 'next/link';
import { ChevronLeft, DollarSign, Calculator, ArrowRight, Save } from 'lucide-react';

export default function ContributionsPage() {
    const [rate, setRate] = useState(MOCK_GPF_ACCOUNT.contributionRate);
    const [lumpSum, setLumpSum] = useState(0);
    const salary = MOCK_GPF_ACCOUNT.salary;

    // Mock Tax Calculation (Assumes 20% tax bracket for demo)
    const taxBracket = 0.20;

    const currentMonthlyAmount = (salary * MOCK_GPF_ACCOUNT.contributionRate) / 100;
    const newMonthlyAmount = (salary * rate) / 100;

    const annualContribution = newMonthlyAmount * 12 + lumpSum;
    const taxSaving = annualContribution * taxBracket;

    const handleSave = () => {
        alert(`บันทึกการเปลี่ยนแปลงเรียบร้อย!\n\nอัตราใหม่: ${rate}%\nออมเพิ่มพิเศษ: ฿${lumpSum.toLocaleString()}\n\n(Simulation Only)`);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/gpf-avc" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการการออม (Contributions)</h1>
                    <p className="text-gray-500">ปรับเปลี่ยนอัตราออมสะสมและออมเพิ่มพิเศษ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Monthly Contribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">ออมรายเดือน (Monthly)</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                อัตราออมสะสม (% ของเงินเดือน)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="3"
                                    max="30"
                                    step="1"
                                    value={rate}
                                    onChange={(e) => setRate(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="w-20 text-center py-2 bg-gray-50 rounded-lg font-bold text-blue-600 border border-gray-200">
                                    {rate}%
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>ต่าสุด 3%</span>
                                <span>สูงสุด 30%</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">เงินเดือนปัจจุบัน:</span>
                                <span className="font-semibold">฿{salary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">ยอดออมเดิม ({MOCK_GPF_ACCOUNT.contributionRate}%):</span>
                                <span className="text-gray-900">฿{currentMonthlyAmount.toLocaleString()} / เดือน</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
                                <span className="text-blue-700">ยอดออมใหม่ ({rate}%):</span>
                                <span className="text-blue-700">฿{newMonthlyAmount.toLocaleString()} / เดือน</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Lump Sum & Tax */}
                <div className="space-y-6">
                    {/* Lump Sum */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <Save className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">ออมเพิ่มพิเศษ (Lump Sum)</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ระบุจำนวนเงินที่ต้องการออมเพิ่ม (บาท)
                            </label>
                            <input
                                type="number"
                                value={lumpSum}
                                onChange={(e) => setLumpSum(Number(e.target.value))}
                                placeholder="ระบุจำนวนเงิน (ขั้นต่ำ 5,000)"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                * สามารถนำส่งได้ปีละ 2 ครั้ง และต้องไม่เกินวงเงินที่กำหนด
                            </p>
                        </div>
                    </div>

                    {/* Tax Benefit Simulation */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Calculator className="w-5 h-5 text-indigo-200" />
                            <h2 className="font-bold text-lg">ประมาณการลดหย่อนภาษี</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-indigo-100 text-sm">
                                <span>ยอดออมทั้งปี (รายเดือน + พิเศษ):</span>
                                <span>฿{annualContribution.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-indigo-200 text-sm">ประหยัดภาษีได้ประมาณ:*</span>
                                <span className="text-3xl font-bold text-white">฿{taxSaving.toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-indigo-300 mt-2">
                                * คำนวณเบื้องต้นที่ฐานภาษี {taxBracket * 100}% ตัวเลขจริงอาจเปลี่ยนแปลงตามรายได้และการลดหย่อนอื่นๆ
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                    ยืนยันทำรายการ <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
