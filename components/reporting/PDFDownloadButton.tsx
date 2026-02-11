'use client';

import React, { useRef, useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AnnualReportTemplate } from './AnnualReportTemplate';

interface PDFDownloadButtonProps {
    user: any;
    holdings: any[];
    balance: number;
    currentPlanId: string;
}

export default function PDFDownloadButton({ user, holdings, balance, currentPlanId }: PDFDownloadButtonProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        if (!reportRef.current) return;
        setIsGenerating(true);

        try {
            // Wait for a moment to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // High resolution
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`GPF-Report-${user.id.slice(0, 6)}-${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('ไม่สามารถสร้างไฟล์ PDF ได้ในขณะนี้');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        กำลังสร้างเอกสาร...
                    </>
                ) : (
                    <>
                        <FileDown className="w-5 h-5" />
                        <div>
                            <span className="font-semibold text-sm">ดาวน์โหลดรายงาน</span>
                            <span className="text-xs text-slate-400 block -mt-0.5">Annual Report (PDF)</span>
                        </div>
                    </>
                )}
            </button>

            {/* Hidden Template for Rendering */}
            <div className="absolute top-[-9999px] left-[-9999px]">
                <AnnualReportTemplate
                    ref={reportRef}
                    user={user}
                    holdings={holdings}
                    balance={balance}
                    currentPlanId={currentPlanId}
                />
            </div>
        </>
    );
}
