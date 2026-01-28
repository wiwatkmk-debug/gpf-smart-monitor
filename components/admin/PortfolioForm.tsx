'use client';

import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import ImageUpload from './ImageUpload';
import type { Fund } from '@/types/portfolio';

interface PortfolioFormProps {
    initialData?: Fund[];
    initialDataDate?: string;
    onSave: (funds: Fund[], totalValue: number, dataDate: string) => void;
    onCancel?: () => void;
}

export default function PortfolioForm({ initialData, initialDataDate, onSave, onCancel }: PortfolioFormProps) {
    const [dataDate, setDataDate] = useState<string>(initialDataDate || new Date().toISOString().split('T')[0]);
    const [uploadedImage, setUploadedImage] = useState<string>('');
    const [funds, setFunds] = useState<Fund[]>(initialData || [
        {
            id: 'gpf-fix-income',
            name: 'แผนตราสารหนี้',
            code: 'GPF-FIX',
            type: 'fixed-income',
            value: 0,
            units: 0,
            navPerUnit: 0,
            allocation: 0,
            return1M: 0,
            return3M: 0,
            return6M: 0,
            return1Y: 0,
            returnYTD: 0,
            riskLevel: 2,
        },
        {
            id: 'gpf-eq-th',
            name: 'แผนหุ้นไทย',
            code: 'GPF-EQ-TH',
            type: 'equity',
            value: 0,
            units: 0,
            navPerUnit: 0,
            allocation: 0,
            return1M: 0,
            return3M: 0,
            return6M: 0,
            return1Y: 0,
            returnYTD: 0,
            riskLevel: 4,
        },
        {
            id: 'gpf-eq-global',
            name: 'แผนหุ้นต่างประเทศ',
            code: 'GPF-EQ-GL',
            type: 'equity',
            value: 0,
            units: 0,
            navPerUnit: 0,
            allocation: 0,
            return1M: 0,
            return3M: 0,
            return6M: 0,
            return1Y: 0,
            returnYTD: 0,
            riskLevel: 5,
        },
        {
            id: 'gpf-gold',
            name: 'แผนทองคำ',
            code: 'GPF-GOLD',
            type: 'alternative',
            value: 0,
            units: 0,
            navPerUnit: 0,
            allocation: 0,
            return1M: 0,
            return3M: 0,
            return6M: 0,
            return1Y: 0,
            returnYTD: 0,
            riskLevel: 3,
        },
    ]);

    const [showPreview, setShowPreview] = useState(false);

    const updateFund = (index: number, field: keyof Fund, value: number) => {
        const newFunds = [...funds];
        newFunds[index] = { ...newFunds[index], [field]: value };
        setFunds(newFunds);
    };

    const calculateTotals = () => {
        const totalValue = funds.reduce((sum, fund) => sum + fund.value, 0);

        // Auto-calculate allocations
        const fundsWithAllocation = funds.map(fund => ({
            ...fund,
            allocation: totalValue > 0 ? (fund.value / totalValue) * 100 : 0,
        }));

        return { funds: fundsWithAllocation, totalValue };
    };

    const handleSave = () => {
        const { funds: updatedFunds, totalValue } = calculateTotals();
        onSave(updatedFunds, totalValue, dataDate);
    };

    const { totalValue } = calculateTotals();

    return (
        <div className="space-y-6">
            {/* Date Field */}
            <Card>
                <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        📅 วันที่ข้อมูล
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        ระบุวันที่ของข้อมูลจาก กบข.
                    </p>
                </div>
                <input
                    type="date"
                    value={dataDate}
                    onChange={(e) => setDataDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass border text-lg"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
            </Card>

            {/* Image Upload */}
            <ImageUpload
                onImageUpload={setUploadedImage}
                currentImage={uploadedImage}
            />

            {/* Portfolio Form */}
            <Card>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        📊 ข้อมูลพอร์ต
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        กรอกข้อมูลจาก กบข. {uploadedImage && '(ดูจากภาพด้านบน)'}
                    </p>
                </div>

                <div className="space-y-6">
                    {funds.map((fund, index) => (
                        <div key={fund.id} className="p-4 rounded-lg glass border" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                {fund.name}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        มูลค่า (บาท)
                                    </label>
                                    <input
                                        type="number"
                                        value={fund.value || ''}
                                        onChange={(e) => updateFund(index, 'value', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded glass border"
                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        จำนวนหน่วย
                                    </label>
                                    <input
                                        type="number"
                                        value={fund.units || ''}
                                        onChange={(e) => updateFund(index, 'units', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded glass border"
                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                        placeholder="0.0000"
                                        step="0.0001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        NAV ต่อหน่วย (บาท)
                                    </label>
                                    <input
                                        type="number"
                                        value={fund.navPerUnit || ''}
                                        onChange={(e) => updateFund(index, 'navPerUnit', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded glass border"
                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                        placeholder="0.0000"
                                        step="0.0001"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            มูลค่ารวมทั้งสิ้น:
                        </span>
                        <span className="text-2xl font-bold text-primary">
                            ฿{totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {showPreview && (
                    <div className="mt-6 p-4 rounded-lg border-2 border-primary/20" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            📋 Preview
                        </h3>
                        {calculateTotals().funds.map(fund => (
                            <div key={fund.id} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{fund.name}</span>
                                <span style={{ color: 'var(--text-primary)' }}>
                                    {fund.allocation.toFixed(1)}% (฿{fund.value.toLocaleString('th-TH')})
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex-1 px-4 py-3 glass rounded-lg font-medium hover:opacity-90 transition-opacity"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {showPreview ? '🙈 ซ่อน Preview' : '👁️ แสดง Preview'}
                    </button>

                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-3 glass rounded-lg font-medium hover:opacity-90 transition-opacity"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            ยกเลิก
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={totalValue === 0}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        💾 บันทึกข้อมูล
                    </button>
                </div>
            </Card>
        </div>
    );
}
