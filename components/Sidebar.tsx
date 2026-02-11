'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    PieChart,
    History,
    TrendingUp,
    Scale,
    Bot,
    Settings,
    ChevronLeft,
    Menu,
    Crown
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';

const NAV_ITEMS = [
    {
        label: 'ภาพรวมพอร์ต',
        href: '/gpf-avc',
        icon: LayoutDashboard,
    },
    {
        label: 'ประวัติพอร์ต',
        href: '/history',
        icon: History,
    },
    {
        label: 'ปรับสมดุลพอร์ต',
        href: '/gpf-avc/rebalancing',
        icon: Scale,
    },
    {
        label: 'วางแผนเกษียณ',
        href: '/gpf-avc/retirement',
        icon: TrendingUp,
    },
    {
        label: 'ขอคำปรึกษา AI',
        href: '/gpf-avc/advisor',
        icon: Bot,
    },
    {
        label: 'จัดการข้อมูล (Admin)',
        href: '/admin/dashboard',
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Hide sidebar on authentication pages
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
        return null;
    }

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">GPF Monitor</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                    <PieChart size={18} className="text-white" />
                </div>
            </div>

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed top-0 inset-y-0 left-0 z-[60] bg-white/80 backdrop-blur-xl border-r border-white/20 transition-all duration-300 ease-in-out flex flex-col h-screen shadow-2xl md:shadow-none shrink-0",
                    isCollapsed ? "w-24" : "w-72",
                    // Mobile responsive classes
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Decorative Background Blurs */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-50/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-50/30 to-transparent pointer-events-none" />

                {/* Toggle Collapse Button (Desktop Only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-10 w-8 h-8 bg-white border border-purple-100 rounded-full items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-200 shadow-sm transition-all z-50 hover:scale-110"
                >
                    <ChevronLeft size={16} className={clsx("transition-transform duration-300", isCollapsed && "rotate-180")} />
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute right-4 top-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-[61]"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Logo Area */}
                <div className="h-24 flex items-center justify-center border-b border-gray-100/50 relative z-10">
                    <div className="flex items-center gap-3 overflow-hidden w-full" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/30">
                            <PieChart size={22} className="text-white" />
                        </div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col"
                                >
                                    <span className="font-bold text-xl text-gray-800 tracking-tight whitespace-nowrap">
                                        GPF Monitor
                                    </span>
                                    <span className="text-[10px] font-semibold text-purple-600 tracking-wider uppercase">
                                        Smart Assistant
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-8 space-y-2 overflow-y-auto relative z-10 custom-scrollbar" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={clsx(
                                    "flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "text-white shadow-lg shadow-purple-500/25"
                                        : "text-gray-500 hover:bg-purple-50 hover:text-purple-700"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {/* Active Background Layer */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-bg"
                                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                <div className="relative flex items-center w-full">
                                    <item.icon
                                        size={22}
                                        className={clsx(
                                            "shrink-0 transition-colors duration-300",
                                            isCollapsed ? "mx-auto" : "mr-6",
                                            isActive ? "text-white" : "text-gray-400 group-hover:text-purple-600"
                                        )}
                                    />

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="font-medium whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* Active Dot for Desktop */}
                                    {isActive && !isCollapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="ml-auto w-2 h-2 rounded-full bg-white/40"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Pro Member Card / Footer */}
                <div className="p-4 mx-2 mb-2 relative z-10">
                    {!isCollapsed ? (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden group">
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                                    <Crown size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Pro Member</div>
                                    <div className="text-[10px] text-gray-400">Valid until Dec 2026</div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-3 flex justify-between items-center text-xs text-gray-300">
                                <span>คุณวิวัฒน์</span>
                                {/* Clerk UserButton for Logout */}
                                <div className="hover:scale-105 transition-transform bg-white rounded-full p-0.5">
                                    <UserButton afterSignOutUrl="/sign-in" appearance={{
                                        elements: {
                                            avatarBox: "w-6 h-6"
                                        }
                                    }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg cursor-help group relative">
                                <Crown size={20} className="text-yellow-400" />
                                <div className="absolute left-full ml-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Pro Member
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Layout Spacer (Desktop Only) */}
            <div
                className={clsx(
                    "hidden md:block shrink-0 h-screen transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-24" : "w-72"
                )}
            />

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
