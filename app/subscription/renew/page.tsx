'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { submitSubscriptionRequest } from '@/app/actions/subscription';
import { getSystemConfigsAction } from '@/app/actions/admin';

export default function RenewalPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY' | null>(null);
    const [slipImage, setSlipImage] = useState<File | null>(null);
    const [prices, setPrices] = useState({ monthly: '199', quarterly: '599', yearly: '1199' });
    const [bankInfo, setBankInfo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            const configs = await getSystemConfigsAction();
            const monthly = configs.find(c => c.key === 'SUBSCRIPTION_PRICE_MONTHLY')?.value || '199';
            const quarterly = configs.find(c => c.key === 'SUBSCRIPTION_PRICE_QUARTERLY')?.value || '599';
            const yearly = configs.find(c => c.key === 'SUBSCRIPTION_PRICE_YEARLY')?.value || '1990';
            const bank = configs.find(c => c.key === 'BANK_INFO')?.value || 'กรุณาติดต่อ Admin';

            setPrices({ monthly, quarterly, yearly });
            setBankInfo(bank);
        };
        loadConfig();
    }, []);

    const handleSubmit = async () => {
        if (!selectedPlan || !slipImage) return;

        setLoading(true);
        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(slipImage);
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const price = selectedPlan === 'MONTHLY' ? parseFloat(prices.monthly) :
                    selectedPlan === 'QUARTERLY' ? parseFloat(prices.quarterly) :
                        parseFloat(prices.yearly);

                await submitSubscriptionRequest(selectedPlan, price, base64);

                alert("ส่งหลักฐานการโอนเงินเรียบร้อย กรุณารอเจ้าหน้าที่ตรวจสอบ");
                router.push('/gpf-avc'); // Back to dashboard
            };
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full overflow-hidden">
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Settings className="w-6 h-6" /> ต่ออายุสมาชิก
                    </h1>
                    <p className="text-blue-100 mt-2">ปลดล็อกฟีเจอร์พรีเมียมเต็มรูปแบบ</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 text-sm font-medium">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>1</span>
                            เลือกแผน
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>2</span>
                            ชำระเงิน
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 3 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>3</span>
                            แจ้งโอน
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 text-center">เลือกแผนสมาชิกที่คุณต้องการ</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setSelectedPlan('MONTHLY')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedPlan === 'MONTHLY' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
                                >
                                    <span className="font-bold text-gray-900">1 เดือน</span>
                                    <span className="text-2xl font-bold text-blue-600">฿{prices.monthly}</span>
                                    <span className="text-xs text-gray-500">เหมาะสำหรับการทดลอง</span>
                                </button>
                                <button
                                    onClick={() => setSelectedPlan('QUARTERLY')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedPlan === 'QUARTERLY' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
                                >
                                    <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Save 10%</div>
                                    <span className="font-bold text-gray-900">3 เดือน</span>
                                    <span className="text-2xl font-bold text-blue-600">฿{prices.quarterly}</span>
                                    <span className="text-xs text-gray-500">ยอดนิยม 🔥</span>
                                </button>
                                <button
                                    onClick={() => setSelectedPlan('YEARLY')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedPlan === 'YEARLY' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
                                >
                                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Save 20%</div>
                                    <span className="font-bold text-gray-900">1 ปี</span>
                                    <span className="text-2xl font-bold text-blue-600">฿{prices.yearly}</span>
                                    <span className="text-xs text-gray-500">คุ้มค่าที่สุด</span>
                                </button>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    disabled={!selectedPlan}
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center">
                            <h2 className="text-xl font-bold text-gray-800">ช่องทางการชำระเงิน</h2>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <p className="text-gray-500 mb-2">กรุณาโอนเงินยอด</p>
                                <div className="text-4xl font-bold text-blue-600 mb-6">
                                    ฿{selectedPlan === 'MONTHLY' ? prices.monthly : selectedPlan === 'QUARTERLY' ? prices.quarterly : prices.yearly}
                                </div>
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="font-medium text-gray-900">{bankInfo}</p>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900">ย้อนกลับ</button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                >
                                    โอนเงินแล้ว (แจ้งโอน)
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 text-center">หลักฐานการโอนเงิน</h2>

                            <ImageUpload onImageUpload={setSlipImage} />

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-900">ย้อนกลับ</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!slipImage || loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งโอน'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
