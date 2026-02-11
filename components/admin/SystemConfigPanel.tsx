'use client';

import { useState, useEffect } from 'react';
import { getSystemConfigsAction, updateSystemConfigAction } from '@/app/actions/admin';
import { Settings, AlertCircle, DollarSign, Clock, Hash, Globe, Link as LinkIcon, Save, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to categorize and style configs based on key
const getConfigStyle = (key: string) => {
    if (key.includes('PRICE')) return { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', group: 'Pricing' };
    if (key.includes('DAYS') || key.includes('TIME')) return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', group: 'Settings' };
    if (key.includes('URL') || key.includes('LINK')) return { icon: LinkIcon, color: 'text-blue-600', bg: 'bg-blue-50', group: 'System' };
    if (key.includes('BANK')) return { icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', group: 'Banking' };
    return { icon: Hash, color: 'text-gray-600', bg: 'bg-gray-50', group: 'General' };
};

// Friendly labels mapping
const FRIENDLY_LABELS: Record<string, string> = {
    'TRIAL_DAYS': 'จำนวนวันทดลองใช้ฟรี (Trial Days)',
    'SUBSCRIPTION_PRICE_MONTHLY': 'ราคาแพ็กเกจรายเดือน',
    'SUBSCRIPTION_PRICE_QUARTERLY': 'ราคาแพ็กเกจราย 3 เดือน',
    'SUBSCRIPTION_PRICE_YEARLY': 'ราคาแพ็กเกจรายปี',
    'BANK_INFO': 'ข้อมูลบัญชีธนาคาร',
    'GOOGLE_CHAT_WEBHOOK_URL': 'Google Chat Webhook URL',
};

export default function SystemConfigPanel() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingEnv, setSavingEnv] = useState<string | null>(null); // Key being saved
    const [savedSuccess, setSavedSuccess] = useState<string | null>(null); // Key that was just saved

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const data = await getSystemConfigsAction();
            // Sort to make pricing come first potentially, or grouping logic later
            setConfigs(data || []);
        } catch (error) {
            console.error("Failed to load configs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        setSavingEnv(key);
        try {
            await updateSystemConfigAction(key, value);
            setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c)); // Optimistic update

            // Show success momentarily
            setSavedSuccess(key);
            setTimeout(() => setSavedSuccess(null), 2000);
        } catch (error) {
            alert('บันทึกไม่สำเร็จ');
        } finally {
            setSavingEnv(null);
        }
    };

    if (loading) return (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p>กำลังโหลดการตั้งค่าระบบ...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900 text-sm">ข้อควรระวัง</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        การแก้ไขค่าเหล่านี้จะมีผลทันทีต่อการคำนวณราคา (Price Calculation) และสิทธิ์ของผู้ใช้งานใหม่ (New User Rights)
                        กรุณาตรวจสอบความถูกต้องก่อนแก้ไข
                    </p>
                </div>
            </div>

            {/* Header Title */}
            <div className="flex items-center gap-3 px-2">
                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Parameters</h3>
                    <p className="text-gray-500 text-sm">จัดการตัวแปรระบบและราคา</p>
                </div>
            </div>

            {/* Config Cards List */}
            <div className="flex flex-col gap-4">
                {configs.length === 0 && (
                    <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                        ไม่พบข้อมูลการตั้งค่า
                    </div>
                )}

                {configs.map((config) => {
                    const style = getConfigStyle(config.key);
                    const Icon = style.icon;
                    const isSaving = savingEnv === config.key;
                    const isSuccess = savedSuccess === config.key;

                    return (
                        <div key={config.key} className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 md:items-center">
                            {/* Label & Icon */}
                            <div className="flex flex-1 items-start gap-4">
                                <div className={`p-3 rounded-2xl ${style.bg} ${style.color} shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                    <Icon size={24} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-base font-bold text-gray-900 block">
                                        {FRIENDLY_LABELS[config.key] || config.key}
                                    </label>
                                    <p className="text-xs text-gray-400 font-mono tracking-wide">
                                        KEY: {config.key}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {config.description}
                                    </p>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="md:w-1/2 lg:w-1/3 relative">
                                <div className={`relative transition-all duration-300 ${isSaving ? 'opacity-70' : ''}`}>
                                    <input
                                        type="text"
                                        defaultValue={config.value}
                                        onBlur={(e) => {
                                            if (e.target.value !== config.value) {
                                                handleSave(config.key, e.target.value);
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-bold text-center focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm group-hover:border-purple-200"
                                    />

                                    {/* Status Indicator inside input */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <AnimatePresence mode="wait">
                                            {isSaving ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                >
                                                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                                </motion.div>
                                            ) : isSuccess ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                >
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Success Message toast */}
                                <AnimatePresence>
                                    {isSuccess && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute top-full mt-1 right-0 text-xs font-semibold text-emerald-600 flex items-center gap-1"
                                        >
                                            <CheckCircle2 size={10} /> บันทึกเรียบร้อย
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
