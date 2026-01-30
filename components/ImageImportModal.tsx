'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Loader2, AlertCircle, FileText, Image as ImageIcon, Save } from 'lucide-react';
import { extractPortfolioFromImage, ExtractedPortfolioData, ExtractedFundData } from '@/app/actions/extract-portfolio';
import { FundHolding } from '@/types/gpf';

interface ImageImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FundHolding[]) => void;
}

export default function ImageImportModal({ isOpen, onClose, onSave }: ImageImportModalProps) {
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedPortfolioData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
            processImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (base64Image: string) => {
        setStep('processing');
        setError(null);
        try {
            const result = await extractPortfolioFromImage(base64Image);
            setExtractedData(result);
            setStep('review');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to process image');
            setStep('upload');
        }
    };

    const handleSave = () => {
        if (!extractedData) return;

        // Convert to FundHolding format
        const holdings: FundHolding[] = extractedData.funds.map(fund => ({
            name: fund.name,
            value: fund.value,
            units: fund.units,
            navPerUnit: fund.navPerUnit,
            updatedAt: extractedData.dataDate || new Date().toISOString()
        }));

        onSave(holdings);
        handleClose();
    };

    const handleClose = () => {
        setStep('upload');
        setImagePreview(null);
        setExtractedData(null);
        setError(null);
        onClose();
    };

    const handleDataChange = (index: number, field: keyof ExtractedFundData, value: string | number) => {
        if (!extractedData) return;

        const newFunds = [...extractedData.funds];
        newFunds[index] = {
            ...newFunds[index],
            [field]: value
        };

        setExtractedData({
            ...extractedData,
            funds: newFunds
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                                นำเข้าพอร์ตจากรูปภาพ
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 mt-0.5" />
                                    <div>
                                        <h3 className="font-bold">เกิดข้อผิดพลาด</h3>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {step === 'upload' && (
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">คลิกเพื่ออัปโหลดรูปภาพ</h3>
                                    <p className="text-gray-500 text-center max-w-xs">
                                        อัปโหลดภาพหน้าจอสรุปพอร์ตลงทุน กบข. ของคุณ
                                        รองรับไฟล์ JPG, PNG
                                    </p>
                                </div>
                            )}

                            {step === 'processing' && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="mt-6 text-xl font-bold text-gray-900">กำลังวิเคราะห์ข้อมูล...</h3>
                                    <p className="text-gray-500 mt-2">AI กำลังอ่านข้อมูลกองทุนจากรูปภาพ</p>
                                </div>
                            )}

                            {step === 'review' && extractedData && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Preview Image */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> รูปภาพต้นฉบับ
                                        </h3>
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Preview" className="w-full h-auto object-contain max-h-[400px]" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Extracted Data Form */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> ข้อมูลที่อ่านได้
                                            </h3>
                                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                ตรวจสอบความถูกต้อง
                                            </span>
                                        </div>

                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                            {extractedData.funds.map((fund, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase">ชื่อกองทุน</label>
                                                        <input
                                                            type="text"
                                                            value={fund.name}
                                                            onChange={(e) => handleDataChange(idx, 'name', e.target.value)}
                                                            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase">มูลค่า (บาท)</label>
                                                            <input
                                                                type="number"
                                                                value={fund.value}
                                                                onChange={(e) => handleDataChange(idx, 'value', parseFloat(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase">จำนวนหน่วย</label>
                                                            <input
                                                                type="number"
                                                                value={fund.units}
                                                                onChange={(e) => handleDataChange(idx, 'units', parseFloat(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase">NAV</label>
                                                            <input
                                                                type="number"
                                                                value={fund.navPerUnit}
                                                                onChange={(e) => handleDataChange(idx, 'navPerUnit', parseFloat(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                มูลค่ารวม: <span className="font-bold text-gray-900">
                                                    ฿{extractedData.funds.reduce((sum, f) => sum + f.value, 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                ยกเลิก
                            </button>
                            {step === 'review' && (
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    ยืนยันและบันทึก
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
