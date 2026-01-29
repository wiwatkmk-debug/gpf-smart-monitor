'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import PortfolioForm from '@/components/admin/PortfolioForm';
import PDFUpload from '@/components/admin/PDFUpload';
import { login, logout, isAuthenticated } from '@/lib/admin-auth';
import { savePortfolioData, loadPortfolioData } from '@/lib/portfolio-storage';
import type { Fund } from '@/types/portfolio';

export default function AdminPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'current' | 'historical'>('current');

    useEffect(() => {
        // Check if already authenticated
        setAuthenticated(isAuthenticated());
        setIsLoading(false);
    }, []);

    const handleLogin = (password: string) => {
        const success = login(password);

        if (success) {
            setAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleLogout = () => {
        logout();
        setAuthenticated(false);
        router.push('/');
    };

    const handleSave = (funds: Fund[], totalValue: number, dataDate: string) => {
        try {
            savePortfolioData({
                funds,
                totalValue,
                dataDate,
                lastUpdated: new Date().toISOString(),
            });

            setSaveSuccess(true);

            // Show success message for 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error saving data:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleGoHome = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            GPF Smart Monitor
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Admin Panel
                        </p>
                    </div>

                    <LoginForm onLogin={handleLogin} error={loginError} />

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleGoHome}
                            className="text-sm hover:underline"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            ← กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const existingData = loadPortfolioData();
    const initialFunds = existingData?.funds;

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            GPF Smart Monitor
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Admin Panel - อัพเดทข้อมูลพอร์ต
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGoHome}
                            className="px-4 py-2 glass rounded-lg hover:opacity-90 transition-opacity"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            🏠 หน้าหลัก
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 glass rounded-lg hover:opacity-90 transition-opacity"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 animate-pulse">
                        <p className="text-green-500 font-medium text-center">
                            ✅ บันทึกข้อมูลสำเร็จ! กลับไปหน้าหลักแล้วกด Refresh เพื่อดูข้อมูลใหม่
                        </p>
                    </div>
                )}

                {/* Info Box */}
                {existingData && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            📅 <strong>วันที่ข้อมูล:</strong>{' '}
                            {existingData.dataDate ? new Date(existingData.dataDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            🕒 <strong>อัพเดทล่าสุด:</strong>{' '}
                            {new Date(existingData.lastUpdated).toLocaleString('th-TH')}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            💰 <strong>มูลค่ารวม:</strong>{' '}
                            ฿{existingData.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}


                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`px-4 py-3 font-medium transition-all ${activeTab === 'current'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📸 ข้อมูลปัจจุบัน (Screenshot)
                    </button>
                    <button
                        onClick={() => setActiveTab('historical')}
                        className={`px-4 py-3 font-medium transition-all ${activeTab === 'historical'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📄 นำเข้าข้อมูลย้อนหลัง (PDF)
                    </button>
                </div>

                {/* Current Data Tab */}
                {activeTab === 'current' && (
                    <>
                        {/* Portfolio Form */}
                        <PortfolioForm
                            initialData={initialFunds}
                            initialDataDate={existingData?.dataDate}
                            onSave={handleSave}
                        />

                        {/* Instructions */}
                        <div className="mt-6 p-4 rounded-lg glass border" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                📝 วิธีใช้งาน
                            </h3>
                            <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                <li>1. ระบุวันที่ของข้อมูล</li>
                                <li>2. (ตัวเลือก) อัพโหลดภาพแคปหน้าจอจาก กบข.</li>
                                <li>3. กรอกข้อมูลในแต่ละกองทุน</li>
                                <li>4. คลิก "แสดง Preview" เพื่อตรวจสอบข้อมูล</li>
                                <li>5. คลิก "บันทึกข้อมูล" เพื่อบันทึก</li>
                                <li>6. กลับไปหน้าหลักแล้วกด "รีเฟรช" เพื่อดูข้อมูลใหม่</li>
                            </ol>
                        </div>
                    </>
                )}

                {/* Historical Data Tab */}
                {activeTab === 'historical' && (
                    <>
                        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                                💡 นำเข้าข้อมูลย้อนหลังจาก PDF
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                อัพโหลดไฟล์ TransactionUnitDetail_*.pdf จาก กบข. เพื่อนำเข้าข้อมูลย้อนหลัง
                                ระบบจะดึงข้อมูลทั้ง 4 กองทุนอัตโนมัติ
                            </p>
                        </div>

                        <PDFUpload
                            onDataExtracted={(data) => {
                                console.log('PDF data extracted:', data);
                            }}
                            onDataSaved={(year) => {
                                console.log('Data saved for year:', year);
                                setSaveSuccess(true);
                                setTimeout(() => setSaveSuccess(false), 3000);
                            }}
                        />

                        {/* Instructions for PDF */}
                        <div className="mt-6 p-4 rounded-lg glass border" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                📝 วิธีใช้งาน PDF Import
                            </h3>
                            <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                <li>1. เตรียม TransactionUnitDetail ไฟล์ PDF จาก กบข.</li>
                                <li>2. วางไฟล์ในพื้นที่อัพโหลด หรือคลิกเพื่อเลือกไฟล์</li>
                                <li>3. รอระบบประมวลผลและดึงข้อมูล (ใช้เวลาประมาณ 10-20 วินาที)</li>
                                <li>4. ตรวจสอบข้อมูลที่ดึงได้</li>
                                <li>5. บันทึกข้อมูลเข้าระบบ</li>
                            </ol>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
