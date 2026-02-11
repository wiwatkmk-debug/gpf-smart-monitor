'use client';

import { useState, useEffect } from 'react';
import { getAdminStats, toggleUserRole, grantSubscriptionAction } from '@/app/actions/admin';
import { Shield, ShieldAlert, Users, Wallet, UserCog, Settings, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle, Crown, Trash2, LayoutDashboard, Sliders } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import SystemConfigPanel from '@/components/admin/SystemConfigPanel';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [prices, setPrices] = useState<{ monthly: string; quarterly: string; yearly: string }>({
        monthly: '199',
        quarterly: '599',
        yearly: '1990'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'settings'>('overview');
    const [requests, setRequests] = useState<any[]>([]);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'danger' | 'warning';
        showInput?: boolean;
        inputValue?: string; // Current input value
        inputPlaceholder?: string;
        onConfirm: (inputValue?: string) => Promise<void>;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [stats, configs, pendingRequests] = await Promise.all([
                getAdminStats(),
                import('@/app/actions/admin').then(mod => mod.getSystemConfigsAction()),
                import('@/app/actions/subscription').then(mod => mod.getSubscriptionRequests())
            ]);

            setData(stats);
            setRequests(pendingRequests);

            // Parse prices from configs
            if (configs) {
                const priceMap = {
                    monthly: configs.find((c: any) => c.key === 'SUBSCRIPTION_PRICE_MONTHLY')?.value || '199',
                    quarterly: configs.find((c: any) => c.key === 'SUBSCRIPTION_PRICE_QUARTERLY')?.value || '599',
                    yearly: configs.find((c: any) => c.key === 'SUBSCRIPTION_PRICE_YEARLY')?.value || '1990',
                };
                setPrices(priceMap);
            }

            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Access Denied)");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        await loadData(); // Re-use loadData for refreshing
    };

    const handleToggleRole = (userId: string, currentRole: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'ยืนยันการเปลี่ยนสิทธิ์?',
            message: `คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้งานนี้จาก ${currentRole} เป็น ${currentRole === 'ADMIN' ? 'USER' : 'ADMIN'} ใช่หรือไม่?`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    await toggleUserRole(userId, currentRole as any);
                    loadStats();
                } catch (err) {
                    alert('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์');
                }
            }
        });
    };

    const handleGrantSubscription = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'ต่ออายุสมาชิก (Grant Subscription)',
            message: 'กรุณาระบุจำนวนเดือนที่ต้องการต่ออายุสมาชิก:',
            type: 'info',
            showInput: true,
            inputValue: '1',
            inputPlaceholder: 'จำนวนเดือน (เช่น 1, 3, 12)',
            onConfirm: async (val) => {
                const months = parseInt(val || '0');
                if (isNaN(months) || months < 1) {
                    alert("กรุณาระบุจำนวนเดือนที่ถูกต้อง (อย่างน้อย 1 เดือน)");
                    return;
                }

                try {
                    await grantSubscriptionAction(userId, months);
                    loadStats();
                } catch (e) {
                    alert("เกิดข้อผิดพลาด");
                }
            }
        });
    };

    const handleApproveUser = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'ยืนยันการอนุมัติ?',
            message: 'คุณต้องการอนุมัติผู้ใช้งานนี้ให้เข้าสู่ระบบใช่หรือไม่?',
            type: 'info',
            onConfirm: async () => {
                const { approveUser } = await import('@/app/actions/admin');
                await approveUser(userId);
                loadStats();
            }
        });
    };

    const handleRejectUser = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'ยืนยันการปฏิเสธ?',
            message: 'คุณต้องการปฏิเสธผู้ใช้งานนี้ใช่หรือไม่?',
            type: 'danger',
            onConfirm: async () => {
                const { rejectUser } = await import('@/app/actions/admin');
                await rejectUser(userId);
                loadStats();
            }
        });
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล Admin...</div>;
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
            <ShieldAlert size={64} className="text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">เข้าถึงถูกปฏิเสธ (Access Denied)</h1>
            <p className="text-gray-500">{error}</p>
        </div>
    );

    return (
        <div className="py-6 md:py-10 max-w-7xl mx-auto flex flex-col gap-8" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-200 hidden md:block">
                        <Shield size={32} />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                            <span className="md:hidden p-1.5 bg-purple-600 rounded-lg text-white shadow-md inline-flex"><Shield size={20} /></span>
                            แดชบอร์ดผู้ดูแลระบบ
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base">จัดการผู้ใช้งาน, สมาชิกรายเดือน และตั้งค่าระบบ</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/50 shadow-sm flex gap-4 relative overflow-x-auto md:overflow-visible no-scrollbar">
                    {/* Sliding Background */}
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`relative z-10 px-8 py-3 rounded-xl text-base font-bold transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'overview' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {activeTab === 'overview' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <LayoutDashboard size={20} />
                            ภาพรวม & ผู้ใช้
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`relative z-10 px-8 py-3 rounded-xl text-base font-bold transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'settings' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {activeTab === 'settings' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Settings size={20} />
                            ตั้งค่าระบบ
                        </span>
                    </button>
                </div>
            </div>

            {activeTab === 'settings' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SystemConfigPanel />
                </div>
            ) : (
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stat-card flex items-center gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ผู้ใช้งานทั้งหมด</p>
                                <h3 className="text-2xl font-bold">{data.stats.totalUsers} คน</h3>
                            </div>
                        </div>
                        <div className="stat-card flex items-center gap-4">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">พอร์ตที่เชื่อมต่อแล้ว</p>
                                <h3 className="text-2xl font-bold">{data.stats.totalPortfolios} พอร์ต</h3>
                            </div>
                        </div>
                        <div className="stat-card flex items-center gap-4">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">มูลค่าทรัพย์สินรวม (AUM)</p>
                                <h3 className="text-2xl font-bold">
                                    {(data.stats.totalAUM / 1000000).toLocaleString('th-TH', { maximumFractionDigits: 2 })} M
                                    <span className="text-xs text-gray-400 ml-1">บาท</span>
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests Section */}
                    {data.stats.pendingRequests > 0 && (
                        <div className="bg-amber-50 rounded-3xl shadow-sm border border-amber-200 overflow-hidden mb-8">
                            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-amber-100/50">
                                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5" />
                                    คำขอเข้าใช้งานที่รออนุมัติ ({data.stats.pendingRequests})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-amber-100/30 text-amber-900 text-sm font-medium">
                                        <tr>
                                            <th className="p-4 pl-6">ผู้ใช้งาน / อีเมล</th>
                                            <th className="p-4">วันที่ขอ</th>
                                            <th className="p-4 text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                        {data.users.filter((u: any) => u.status === 'PENDING').map((user: any) => (
                                            <tr key={user.id} className="hover:bg-amber-100/20 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="font-medium text-gray-900">{user.email}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{user.id}</div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {format(new Date(user.createdAt), 'd MMM yyyy HH:mm', { locale: th })}
                                                </td>
                                                <td className="p-4 text-center flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApproveUser(user.id)}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm flex items-center gap-1"
                                                    >
                                                        <CheckCircle size={14} /> อนุมัติ
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectUser(user.id)}
                                                        className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-1"
                                                    >
                                                        <XCircle size={14} /> ปฏิเสธ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="card p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <UserCog className="w-5 h-5 text-gray-500" />
                                รายชื่อผู้ใช้งาน & สมาชิก
                            </h3>
                        </div>

                        {/* Mobile View: Card List */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {data.users.map((user: any) => (
                                <div key={user.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    {/* Header: Email & Action */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-purple-900 break-all">{user.email}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id.substring(0, 8)}...</div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {data.currentUserRole === 'ADMIN' && (
                                                <button
                                                    onClick={() => handleToggleRole(user.id, user.role)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 bg-gray-50 rounded-lg"
                                                >
                                                    <Shield size={16} />
                                                </button>
                                            )}
                                            {data.currentUserRole === 'ADMIN' && (
                                                <button
                                                    onClick={() => handleRejectUser(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">สถานะ</div>
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : user.role === 'SUPPORT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                <span className={`text-xs font-medium ${user.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">แพ็กเกจ</div>
                                            {user.subscriptionPlan === 'PREMIUM' ? (
                                                <span className="text-amber-600 font-bold flex items-center gap-1 text-xs">
                                                    <Crown className="w-3 h-3" /> Premium
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs">Free / Trial</span>
                                            )}
                                            {user.subscriptionEndsAt && (
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    หมด: {format(new Date(user.subscriptionEndsAt), 'd MMM yy', { locale: th })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">มูลค่าพอร์ต</span>
                                            <span className="font-bold text-gray-900">
                                                {user.portfolio
                                                    ? `฿${user.portfolio.totalBalance.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`
                                                    : '-'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm font-medium">
                                        <th className="p-4 pl-6 whitespace-nowrap">User / Email</th>
                                        <th className="p-4 whitespace-nowrap">Role / Status</th>
                                        <th className="p-4 whitespace-nowrap">Subscription</th>
                                        <th className="p-4 text-right whitespace-nowrap">Portfolio Value</th>
                                        <th className="p-4 text-center whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.users.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 pl-6">
                                                <div className="font-medium text-gray-900 truncate max-w-[200px]" title={user.email}>
                                                    {user.email}
                                                </div>
                                                <div className="text-xs text-gray-400 font-mono">{user.id.substring(0, 8)}...</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${user.role === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : user.role === 'SUPPORT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                    <span className={`text-xs ${user.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {user.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {user.subscriptionPlan === 'PREMIUM' ? (
                                                        <span className="text-amber-600 font-bold flex items-center gap-1">
                                                            <Settings className="w-3 h-3" /> Premium
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">Free / Trial</span>
                                                    )}
                                                </div>
                                                {user.subscriptionEndsAt && (
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(user.subscriptionEndsAt) < new Date() ? 'หมดอายุ: ' : 'หมด: '}
                                                        {format(new Date(user.subscriptionEndsAt), 'd MMM yy', { locale: th })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-medium text-sm">
                                                {user.portfolio
                                                    ? user.portfolio.totalBalance.toLocaleString('th-TH', { maximumFractionDigits: 0 })
                                                    : <span className="text-gray-300">-</span>
                                                }
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {data.currentUserRole === 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleToggleRole(user.id, user.role)}
                                                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title={user.role === 'ADMIN' ? 'ลดสิทธิ์ Admin' : 'ตั้งเป็น Admin'}
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {data.currentUserRole === 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleGrantSubscription(user.id)}
                                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="ต่ออายุสมาชิก (Billing)"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal && confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-4 rounded-full ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' :
                                confirmModal.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                <AlertTriangle size={32} />
                            </div>

                            <div className="w-full">
                                <h3 className="text-xl font-bold text-gray-900">{confirmModal.title}</h3>
                                <p className="text-gray-500 mt-2">{confirmModal.message}</p>

                                {confirmModal.showInput && (
                                    <div className="mt-4">
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-lg font-bold"
                                            value={confirmModal.inputValue}
                                            onChange={(e) => setConfirmModal({ ...confirmModal, inputValue: e.target.value })}
                                            placeholder={confirmModal.inputPlaceholder}
                                            autoFocus
                                        />

                                        {/* Quick Select Buttons */}
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            <button
                                                onClick={() => setConfirmModal({ ...confirmModal, inputValue: '1' })}
                                                className={`px-2 py-2 text-sm font-medium rounded-lg transition-all border flex flex-col items-center gap-1 ${confirmModal.inputValue === '1'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <span>1 เดือน</span>
                                                <span className={`text-[10px] ${confirmModal.inputValue === '1' ? 'text-blue-100' : 'text-gray-400'}`}>฿{prices.monthly}</span>
                                            </button>
                                            <button
                                                onClick={() => setConfirmModal({ ...confirmModal, inputValue: '3' })}
                                                className={`px-2 py-2 text-sm font-medium rounded-lg transition-all border flex flex-col items-center gap-1 ${confirmModal.inputValue === '3'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <span>3 เดือน</span>
                                                <span className={`text-[10px] ${confirmModal.inputValue === '3' ? 'text-blue-100' : 'text-gray-400'}`}>฿{prices.quarterly}</span>
                                            </button>
                                            <button
                                                onClick={() => setConfirmModal({ ...confirmModal, inputValue: '12' })}
                                                className={`px-2 py-2 text-sm font-medium rounded-lg transition-all border flex flex-col items-center gap-1 ${confirmModal.inputValue === '12'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <span>1 ปี</span>
                                                <span className={`text-[10px] ${confirmModal.inputValue === '12' ? 'text-blue-100' : 'text-gray-400'}`}>฿{prices.yearly}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirmModal.showInput && (!confirmModal.inputValue || parseInt(confirmModal.inputValue) < 1)) {
                                            alert("กรุณาระบุจำนวนเดือนที่ถูกต้อง");
                                            return;
                                        }

                                        await confirmModal.onConfirm(confirmModal.inputValue);
                                        setConfirmModal(null);
                                    }}
                                    className={`flex-1 px-4 py-2 text-white rounded-xl font-medium shadow-md transition-colors ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                                        confirmModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                                            'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
