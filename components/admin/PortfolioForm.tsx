'use client';

import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import ImageUpload from './ImageUpload';
// import { extractDataFromImage } from '@/lib/image-processor'; // Deprecated: Moved to Server Action
import type { Fund } from '@/types/portfolio';

interface PortfolioFormProps {
    initialData?: Fund[];
    initialDataDate?: string;
    onSave: (funds: Fund[], totalValue: number, dataDate: string) => void;
    onCancel?: () => void;
}

export default function PortfolioForm({ initialData, initialDataDate, onSave, onCancel }: PortfolioFormProps) {
    // Validate and sanitize initial date
    const getValidDate = (dateString?: string): string => {
        if (!dateString) return new Date().toISOString().split('T')[0];

        const date = new Date(dateString);
        const year = date.getFullYear();

        // Check if date is valid and year is reasonable (between 2000-2100)
        if (isNaN(date.getTime()) || year < 2000 || year > 2100) {
            return new Date().toISOString().split('T')[0];
        }

        return dateString;
    };

    const [dataDate, setDataDate] = useState<string>(getValidDate(initialDataDate));
    const [uploadedImage, setUploadedImage] = useState<string>('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string>('');
    const [extractedData, setExtractedData] = useState<any>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
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

    const handleExtractData = async () => {
        if (!uploadedImage) {
            setExtractError('กรุณาอัพโหลดภาพก่อน');
            return;
        }

        setIsExtracting(true);
        setExtractError('');

        try {
            // Call Server Action instead of client-side function
            const { extractPortfolioFromImage } = await import('@/app/actions/extract-portfolio');
            const data = await extractPortfolioFromImage(uploadedImage);

            // Store extracted data and show confirmation dialog
            setExtractedData(data);
            setShowConfirmDialog(true);
            setIsExtracting(false);
        } catch (error) {
            console.error('Error extracting data:', error);
            setExtractError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอ่านข้อมูล');
            setIsExtracting(false);
        }
    };

    const handleConfirmExtraction = () => {
        console.log('🔵 handleConfirmExtraction called');
        console.log('📦 extractedData:', extractedData);

        if (!extractedData) {
            console.log('❌ No extracted data');
            return;
        }

        // Map extracted data to funds
        const fundMapping: { [key: string]: string } = {
            'แผนตราสารหนี้': 'gpf-fix-income',
            'แผนหุ้นไทย': 'gpf-eq-th',
            'แผนหุ้นต่างประเทศ': 'gpf-eq-global',
            'แผนทองคำ': 'gpf-gold',
        };

        console.log('🗺️ fundMapping:', fundMapping);
        console.log('📊 Current funds before update:', funds);

        const updatedFunds = funds.map(fund => {
            const extractedFund = extractedData.funds.find(
                (ef: any) => fundMapping[ef.name] === fund.id
            );

            console.log(`Checking fund ${fund.id}:`, extractedFund);

            if (extractedFund) {
                const updated = {
                    ...fund,
                    value: extractedFund.value,
                    units: extractedFund.units,
                    navPerUnit: extractedFund.navPerUnit,
                };
                console.log(`✅ Updated fund ${fund.id}:`, updated);
                return updated;
            }

            console.log(`⏭️ No update for fund ${fund.id}`);
            return fund;
        });

        console.log('📊 Updated funds:', updatedFunds);
        setFunds(updatedFunds);

        // Update date if found
        if (extractedData.dataDate) {
            console.log('📅 Setting date to:', extractedData.dataDate);
            setDataDate(extractedData.dataDate);
        }

        setShowConfirmDialog(false);
        setExtractedData(null);
        console.log('✅ handleConfirmExtraction completed');
    };

    const handleCancelExtraction = () => {
        setShowConfirmDialog(false);
        setExtractedData(null);
    };

    const handleSave = () => {
        console.log('💾 handleSave called');
        console.log('📊 Current funds:', funds);
        console.log('📅 Current dataDate:', dataDate);

        const { funds: updatedFunds, totalValue } = calculateTotals();
        console.log('💰 Total value:', totalValue);
        console.log('📊 Updated funds with allocations:', updatedFunds);

        onSave(updatedFunds, totalValue, dataDate);
        console.log('✅ onSave called');

        // Show success notification
        setShowSuccessNotification(true);

        // Redirect to homepage after 2 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    };



    const { totalValue } = calculateTotals();

    return (
        <div className="space-y-6">
            {/* Success Notification */}
            {showSuccessNotification && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="glass rounded-lg p-4 border-2 flex items-center gap-3" style={{ borderColor: 'var(--success)', backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-bold" style={{ color: 'var(--success)' }}>บันทึกสำเร็จ!</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>ข้อมูลถูกบันทึกเรียบร้อยแล้ว</p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            🏠 กลับหน้าแรก
                        </a>
                    </div>
                </div>
            )}

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

            {/* Extract Button */}
            {uploadedImage && (
                <Card>
                    <button
                        onClick={handleExtractData}
                        disabled={isExtracting}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                    >
                        {isExtracting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                กำลังอ่านข้อมูล...
                            </>
                        ) : (
                            <>
                                🤖 อ่านข้อมูลอัตโนมัติ
                            </>
                        )}
                    </button>
                    {extractError && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-red-500 text-sm">❌ {extractError}</p>
                        </div>
                    )}
                    {!isExtracting && !extractError && (
                        <p className="mt-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                            💡 คลิกเพื่อให้ AI อ่านข้อมูลจากภาพและกรอกให้อัตโนมัติ
                        </p>
                    )}
                </Card>
            )}

            {/* Premium Confirmation Dialog */}
            {showConfirmDialog && extractedData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden scale-100 animate-slide-up"
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Premium Header */}
                        <div className="bg-gradient-to-r from-indigo-900 to-slate-800 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-50"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-1">
                                    พอร์ตการลงทุนของคุณ
                                </h3>
                                <p className="text-indigo-200 text-sm">
                                    {extractedData.dataDate ? `ข้อมูล ณ วันที่ ${new Date(extractedData.dataDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'ไม่พบวันที่ระบุ'}
                                </p>
                                <div className="mt-4 text-3xl font-bold text-emerald-400">
                                    ฿{extractedData.funds.reduce((acc: number, f: any) => acc + f.value, 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-indigo-300">มูลค่ารวมทั้งหมด</p>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                            {extractedData.funds.map((fund: any, idx: number) => {
                                // Determine icon and color based on fund name
                                let icon = '📌';
                                let colorClass = 'bg-slate-100 text-slate-600';
                                if (fund.name.includes('ตราสารหนี้')) { icon = '💵'; colorClass = 'bg-blue-50 text-blue-600'; }
                                if (fund.name.includes('หุ้นไทย')) { icon = '📈'; colorClass = 'bg-red-50 text-red-600'; }
                                if (fund.name.includes('หุ้นต่างประเทศ')) { icon = '🌐'; colorClass = 'bg-indigo-50 text-indigo-600'; }
                                if (fund.name.includes('ทองคำ')) { icon = '👑'; colorClass = 'bg-amber-50 text-amber-600'; }

                                return (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-sm">{fund.name}</h4>
                                            <div className="flex justify-between items-end mt-1">
                                                <div>
                                                    <p className="text-xs text-slate-500">มูลค่า</p>
                                                    <p className="font-bold text-slate-900">฿{fund.value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">หน่วย</p>
                                                    <p className="font-medium text-slate-700 text-sm">{fund.units.toLocaleString('th-TH', { minimumFractionDigits: 4 })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={handleCancelExtraction}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmExtraction}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                ยืนยันข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        💾 บันทึกข้อมูล
                    </button>
                </div>
            </Card>
        </div>
    );
}
