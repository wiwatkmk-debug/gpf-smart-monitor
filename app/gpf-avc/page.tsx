'use client';

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import React from 'react';
import { MOCK_GPF_ACCOUNT, INVESTMENT_PLANS } from '@/lib/mock-gpf-data';
import Link from 'next/link';
import {
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { getPortfolio, updatePortfolioHoldings } from '@/app/actions/portfolio';
import ImageImportModal from '@/components/ImageImportModal';
import PortfolioHistoryChart from '@/components/PortfolioHistoryChart';
import PDFDownloadButton from '@/components/reporting/PDFDownloadButton';

export default function GPFAVCPage() {
    // ... existing code ...

    const [isImportModalOpen, setImportModalOpen] = React.useState(false);
    const [holdings, setHoldings] = React.useState<any[]>([]);
    const [localBalance, setLocalBalance] = React.useState(0);
    const [account, setAccount] = React.useState<any>(MOCK_GPF_ACCOUNT);
    const [isLoading, setIsLoading] = React.useState(true);

    const currentPlan = INVESTMENT_PLANS.find(p => p.id === account.currentPlanId) || INVESTMENT_PLANS[0];

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPortfolio();
                setAccount(data);
                if (data.holdings && data.holdings.length > 0) {
                    setHoldings(data.holdings);
                    setLocalBalance(data.totalBalance);
                } else {
                    setLocalBalance(data.totalBalance);
                }
            } catch (error) {
                console.error('Failed to fetch portfolio:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleSavePortfolio = async (newHoldings: any[]) => {
        setHoldings(newHoldings);
        const newTotal = newHoldings.reduce((sum, h) => sum + h.value, 0);
        setLocalBalance(newTotal);

        // Save to DB via Server Action
        try {
            await updatePortfolioHoldings(newHoldings);
        } catch (error) {
            console.error('Failed to save portfolio:', error);
            alert('Could not save portfolio to database');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="py-6 flex flex-col gap-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        ระบบออมเพิ่ม กบข. <br />
                        (GPF AVC)
                    </h1>
                    <p className="text-gray-500">จัดการแผนการลงทุนและวางแผนเกษียณ</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-500">สมาชิกเลขที่</div>
                        <div className="font-mono font-bold text-lg">{account.memberId}</div>
                        {holdings.length > 0 && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                                Updated: {new Date().toLocaleDateString('th-TH')}
                            </div>
                        )}
                    </div>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                เข้าสู่ระบบ
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* Balance Card */}
                <motion.div variants={item} className="card">
                    <div className="text-sm text-gray-500 mb-1">ยอดเงินสะสมรวม</div>
                    <div className="text-3xl font-bold text-blue-600">
                        ฿{localBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </div>
                    {holdings.length > 0 ? (
                        <div className="mt-4 flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                            <span>Synced from Image (OCR)</span>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                            <span>▲ +5.2% จากปีที่แล้ว</span>
                        </div>
                    )}
                </motion.div>

                {/* Current Plan Card */}
                <motion.div variants={item} className="card">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">แผนการลงทุนปัจจุบัน</div>
                            <div className="text-xl font-bold text-gray-900">{currentPlan.name}</div>
                            <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold 
                ${currentPlan.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                    currentPlan.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'}`}>
                                ความเสี่ยง: {currentPlan.riskLevel === 'High' ? 'สูง' : currentPlan.riskLevel === 'Medium' ? 'ปานกลาง' : 'ต่ำ'}
                            </div>
                        </div>
                        <Link
                            href="/gpf-avc/plans"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                            เปลี่ยนแผน
                        </Link>
                    </div>
                </motion.div>

                {/* Contribution Rate Card */}
                <motion.div variants={item} className="card">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">อัตราออมเพิ่ม (ออมสิน)</div>
                            <div className="text-3xl font-bold text-orange-600">{account.contributionRate}%</div>
                            <div className="text-sm text-gray-500 mt-1">
                                คิดเป็น ฿{(account.salary * account.contributionRate / 100).toLocaleString()} / เดือน
                            </div>
                        </div>
                        <Link href="/gpf-avc/contributions" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
                            เปลี่ยนอัตรา
                        </Link>
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >

                {/* Left Column: Plan Allocation & History */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                {holdings.length > 0 ? 'มูลค่าปัจจุบันตามกองทุน' : 'สัดส่วนการลงทุนปัจจุบัน'}
                            </h2>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Update: ล่าสุด</span>
                        </div>

                        {holdings.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {holdings.map((h, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <div className="font-bold text-gray-900">{h.name}</div>
                                            <div className="text-xs text-gray-500">{h.units.toLocaleString()} units @ {h.navPerUnit.toFixed(4)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-blue-600">฿{h.value.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">{((h.value / localBalance) * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center">
                                <div className="h-64 w-full md:w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={currentPlan.allocation}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="percentage"
                                                animationBegin={500}
                                                animationDuration={1500}
                                            >
                                                {currentPlan.allocation.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number) => `${value}%`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full md:w-1/2 space-y-3">
                                    {currentPlan.allocation.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (index * 0.1) }}
                                            className="flex justify-between items-center p-2 rounded hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                <span className="text-gray-700">{item.assetClass}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{item.percentage}%</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">เกี่ยวกับแผนนี้</h3>
                            <p className="text-sm text-gray-600 mb-3">{currentPlan.description}</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {currentPlan.details.map((detail, idx) => (
                                    <li key={idx}>{detail}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Historical Chart */}
                    <PortfolioHistoryChart history={account.history || []} />
                </div>

                {/* Right Column: Quick Actions & Projections */}
                <div className="flex flex-col gap-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">เมนูด่วน</h2>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setImportModalOpen(true)}
                                className="block w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors bg-opacity-70 flex items-center gap-2"
                            >
                                <span className="text-xl">📸</span>
                                <div>
                                    <div className="font-semibold">นำเข้าพอร์ตลงทุน</div>
                                    <div className="text-xs opacity-70">จากรูปภาพ (OCR)</div>
                                </div>
                            </button>
                            <Link href="/gpf-avc/plans" className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors bg-opacity-50 flex items-center gap-2">
                                <span className="text-xl">🔄</span>
                                <div>
                                    <div className="font-semibold">เปลี่ยนแผนการลงทุน</div>
                                    <div className="text-xs opacity-70">ปรับสัดส่วนการลงทุน</div>
                                </div>
                            </Link>
                            <Link href="/gpf-avc/contributions" className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors bg-opacity-50 flex items-center gap-2">
                                <span className="text-xl">💰</span>
                                <div>
                                    <div className="font-semibold">ออมเพิ่มพิเศษ</div>
                                    <div className="text-xs opacity-70">เพิ่มเงินออมรายเดือน</div>
                                </div>
                            </Link>
                            <Link href="/gpf-avc/retirement" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <span className="text-xl">📈</span>
                                <div>
                                    <div className="font-semibold">วางแผนเกษียณ</div>
                                    <div className="text-xs opacity-70">คำนวณเงินเกษียณ</div>
                                </div>
                            </Link>

                            <div className="pt-2 border-t border-gray-100">
                                <PDFDownloadButton
                                    user={{ id: account.memberId || 'UNKNOWN', firstName: 'สมาชิก', lastName: 'กบข.' }}
                                    holdings={holdings}
                                    balance={localBalance}
                                    currentPlanId={currentPlan.id}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mini Projection */}
                    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl shadow-lg text-white relative overflow-hidden group" style={{ padding: '24px' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                        </div>
                        <h2 className="text-lg font-bold mb-2">เป้าหมายเกษียณ</h2>
                        <div className="text-sm text-blue-200 mb-4">คาดการณ์ ณ อายุ 60 ปี</div>

                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-bold">฿8.5M</span>
                            <span className="text-sm text-green-300 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                ตามเป้าหมาย
                            </span>
                        </div>

                        <div className="w-full bg-blue-800 rounded-full h-2 mb-4 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '45%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-green-400 h-2 rounded-full"
                            ></motion.div>
                        </div>

                        <Link href="/gpf-avc/retirement" className="block w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/30 backdrop-blur-sm text-center">
                            ดูรายละเอียดการคำนวณ
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Modal */}
            <ImageImportModal
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSave={handleSavePortfolio}
            />
        </div>
    );
}
