'use client';

import { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import type { PDFExtractedData } from '@/lib/pdf-processor';

interface PDFUploadProps {
    onDataExtracted?: (data: PDFExtractedData) => void;
    onDataSaved?: (year: number) => void;
}

export default function PDFUpload({ onDataExtracted, onDataSaved }: PDFUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<PDFExtractedData | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processPDF = async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setExtractedData(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch('/api/import-pdf', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to process PDF');
            }

            setExtractedData(result.data);
            if (onDataExtracted) {
                onDataExtracted(result.data);
            }

        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการอ่าน PDF');
            console.error('PDF processing error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const pdfFile = files.find(file => file.type === 'application/pdf');

        if (pdfFile) {
            processPDF(pdfFile);
        } else {
            setError('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processPDF(file);
        }
    }, []);

    const handleSaveData = async () => {
        if (!extractedData) return;

        setIsSaving(true);
        setError(null);

        try {
            // Import dynamically to avoid SSR issues
            const { saveMonthlySnapshots } = await import('@/lib/historical-storage');
            const { portfolioSnapshot } = extractedData;

            // Convert monthly snapshots to storage format
            const monthlyData = portfolioSnapshot.monthlySnapshots.map(snapshot => {
                const totalValue = snapshot.funds.reduce((sum, fund) => sum + fund.value, 0);
                return {
                    year: portfolioSnapshot.year,
                    month: snapshot.month,
                    date: snapshot.date,
                    funds: snapshot.funds,
                    totalValue,
                    source: 'pdf' as const
                };
            });

            // Save all monthly snapshots
            saveMonthlySnapshots(monthlyData);

            setSaveSuccess(true);
            if (onDataSaved) {
                onDataSaved(portfolioSnapshot.year);
            }

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);

        } catch (err: any) {
            setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                    className="hidden"
                    id="pdf-upload"
                />

                <label htmlFor="pdf-upload" className="cursor-pointer block">
                    <FileText className="mx-auto mb-4 text-gray-400" size={48} />

                    <h3 className="text-lg font-semibold mb-2">
                        อัพโหลดไฟล์ PDF จาก กบข.
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">
                        วางไฟล์ที่นี่ หรือ คลิกเพื่อเลือกไฟล์
                    </p>

                    <p className="text-xs text-gray-500">
                        รองรับไฟล์ TransactionUnitDetail_*.pdf
                    </p>

                    {isProcessing && (
                        <div className="mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-sm text-gray-600 mt-2">กำลังประมวลผล PDF...</p>
                        </div>
                    )}
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">❌ {error}</p>
                </div>
            )}

            {/* Save Success Message */}
            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
                    <p className="text-green-800 font-medium">✅ บันทึกข้อมูลสำเร็จ!</p>
                </div>
            )}

            {/* Extracted Data Preview */}
            {extractedData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">
                        ✅ ดึงข้อมูลสำเร็จ
                    </h4>

                    <div className="space-y-2 text-sm">
                        <p className="text-green-800">
                            <strong>ปี:</strong> {extractedData.portfolioSnapshot.year}
                        </p>
                        <p className="text-green-800">
                            <strong>จำนวนเดือน:</strong> {extractedData.portfolioSnapshot.monthlySnapshots.length} เดือน
                        </p>

                        <div className="mt-3">
                            <strong className="text-green-900">ข้อมูลรายเดือน:</strong>
                            <div className="mt-2 space-y-3 max-h-96 overflow-y-auto">
                                {extractedData.portfolioSnapshot.monthlySnapshots.map((snapshot, idx) => {
                                    const totalValue = snapshot.funds.reduce((sum, f) => sum + f.value, 0);
                                    return (
                                        <div key={idx} className="bg-white rounded p-2 border border-green-200">
                                            <div className="font-medium text-green-900 mb-1">
                                                เดือนที่ {snapshot.month} ({snapshot.date})
                                            </div>
                                            <div className="text-xs text-green-700">
                                                มูลค่ารวม: ฿{totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-green-600 mt-1">
                                                {snapshot.funds.length} กองทุน: {snapshot.funds.map(f => f.name).join(', ')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-4 pt-4 border-t border-green-300">
                            <button
                                onClick={handleSaveData}
                                disabled={isSaving || saveSuccess}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${isSaving || saveSuccess
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {isSaving ? '⏳ กำลังบันทึก...' : saveSuccess ? '✅ บันทึกแล้ว' : `💾 บันทึก ${extractedData.portfolioSnapshot.monthlySnapshots.length} เดือน (ปี ${extractedData.portfolioSnapshot.year})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
