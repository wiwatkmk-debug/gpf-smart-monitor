'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import PortfolioForm from '@/components/admin/PortfolioForm';
import { login, logout, isAuthenticated } from '@/lib/admin-auth';
import { savePortfolioData, loadPortfolioData } from '@/lib/portfolio-storage';
import type { Fund } from '@/types/portfolio';

export default function AdminPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);

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

    const handleSave = (funds: Fund[], totalValue: number) => {
        try {
            savePortfolioData({
                funds,
                totalValue,
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
                            📅 <strong>อัพเดทล่าสุด:</strong>{' '}
                            {new Date(existingData.lastUpdated).toLocaleString('th-TH')}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            💰 <strong>มูลค่ารวม:</strong>{' '}
                            ฿{existingData.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}

                {/* Portfolio Form */}
                <PortfolioForm
                    initialData={initialFunds}
                    onSave={handleSave}
                />

                {/* Instructions */}
                <div className="mt-6 p-4 rounded-lg glass border" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        📝 วิธีใช้งาน
                    </h3>
                    <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>1. กรอกข้อมูลจาก กบข. ของคุณในแต่ละกองทุน</li>
                        <li>2. คลิก "แสดง Preview" เพื่อตรวจสอบข้อมูล</li>
                        <li>3. คลิก "บันทึกข้อมูล" เพื่อบันทึก</li>
                        <li>4. กลับไปหน้าหลักแล้วกด "รีเฟรช" เพื่อดูข้อมูลใหม่</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
