'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Calendar, BarChart3, ArrowLeft, Trash2 } from 'lucide-react';
import { loadMonthlyData, deleteSnapshotsByYear, getAllYears, getLatestSnapshotForYear, type MonthlySnapshot } from '@/lib/historical-storage';

interface YearSummary {
    year: number;
    monthCount: number;
    latestDate: string;
    totalValue: number;
    source: 'pdf' | 'manual';
    months: MonthlySnapshot[];
}

export default function HistoryPage() {
    const router = useRouter();
    const [yearlyData, setYearlyData] = useState<YearSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [expandedYear, setExpandedYear] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const monthlyData = loadMonthlyData();
        const years = getAllYears();

        const summary: YearSummary[] = years.map(year => {
            const monthsForYear = monthlyData.monthly.filter(m => m.year === year);
            const latest = getLatestSnapshotForYear(year);

            return {
                year,
                monthCount: monthsForYear.length,
                latestDate: latest?.date || '',
                totalValue: latest?.totalValue || 0,
                source: latest?.source || 'pdf',
                months: monthsForYear
            };
        });

        setYearlyData(summary);
        setIsLoading(false);
    };

    const handleDelete = (year: number) => {
        if (deleteConfirm === year) {
            // Confirmed - delete the data
            deleteSnapshotsByYear(year);
            loadData();
            setDeleteConfirm(null);
        } else {
            // First click - ask for confirmation
            setDeleteConfirm(year);
            // Auto-reset after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (yearlyData.length === 0) {
        return (
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => router.push('/')}
                        className="mb-4 flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ArrowLeft size={16} />
                        กลับหน้าหลัก
                    </button>

                    <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-secondary)' }} />
                        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            ยังไม่มีข้อมูลประวัติ
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                            อัพโหลด PDF จาก กบข. เพื่อเริ่มติดตามประวัติพอร์ต
                        </p>
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                        >
                            ไปหน้าอัพโหลด PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate growth
    const growth = yearlyData.length > 1
        ? ((yearlyData[yearlyData.length - 1].totalValue - yearlyData[0].totalValue) / yearlyData[0].totalValue) * 100
        : 0;

    const latest = yearlyData[yearlyData.length - 1];
    const maxValue = Math.max(...yearlyData.map(d => d.totalValue));

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="mb-4 flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ArrowLeft size={16} />
                        กลับหน้าหลัก
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 size={32} style={{ color: 'var(--primary)' }} />
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            ประวัติพอร์ต
                        </h1>
                    </div>

                    <p style={{ color: 'var(--text-secondary)' }}>
                        ข้อมูลย้อนหลังจาก PDF (รายเดือน)
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Latest Value */}
                    <div className="rounded-xl p-4 border" style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    มูลค่าล่าสุด
                                </p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    ฿{latest.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {latest.latestDate} ({latest.monthCount} เดือน)
                                </p>
                            </div>
                            <Calendar size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                    </div>

                    {/* Growth */}
                    <div className="rounded-xl p-4 border" style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    การเติบโตรวม
                                </p>
                                <p className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    ตั้งแต่ปี {yearlyData[0].year}
                                </p>
                            </div>
                            <TrendingUp size={24} style={{ color: growth >= 0 ? '#10b981' : '#ef4444' }} />
                        </div>
                    </div>

                    {/* Years Tracked */}
                    <div className="rounded-xl p-4 border" style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    ติดตามมาแล้ว
                                </p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {yearlyData.length} ปี
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {yearlyData.reduce((sum, y) => sum + y.monthCount, 0)} เดือนทั้งหมด
                                </p>
                            </div>
                            <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                    </div>
                </div>

                {/* Timeline Chart */}
                <div className="rounded-xl p-6 mb-6 border" style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        เส้นเวลามูลค่าพอร์ต
                    </h2>
                    <div className="flex items-end gap-2 h-64">
                        {yearlyData.map((item, index) => {
                            const height = (item.totalValue / maxValue) * 100;
                            const prevValue = index > 0 ? yearlyData[index - 1].totalValue : item.totalValue;
                            const change = item.totalValue - prevValue;
                            const isPositive = change >= 0;

                            return (
                                <div key={item.year} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <div className="text-center mb-2">
                                        <p className="text-xs font-medium" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
                                            {index > 0 && (isPositive ? '+' : '')}{((change / prevValue) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div
                                        className="w-full rounded-t cursor-pointer hover:opacity-80 transition-opacity"
                                        style={{
                                            height: `${height}%`,
                                            backgroundColor: isPositive ? '#10b981' : '#ef4444',
                                            minHeight: '20px'
                                        }}
                                        title={`฿${item.totalValue.toLocaleString()}`}
                                    ></div>
                                    <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        {item.year}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl overflow-hidden border mb-6" style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}>
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            ตารางข้อมูลย้อนหลัง
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ backgroundColor: 'var(--hover-color)' }}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>ปี</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>เดือน</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>มูลค่า (บาท)</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>เปลี่ยนแปลง</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>แหล่งที่มา</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yearlyData.map((item, index) => {
                                    const prevValue = index > 0 ? yearlyData[index - 1].totalValue : null;
                                    const change = prevValue ? ((item.totalValue - prevValue) / prevValue) * 100 : null;

                                    return (
                                        <tr key={item.year} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                                                <span className="font-medium">{item.year}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                {item.monthCount} เดือน
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                                                ฿{item.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {change !== null ? (
                                                    <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)' }}>-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-2 py-1 rounded text-xs" style={{
                                                    backgroundColor: item.source === 'pdf' ? 'var(--primary)' : 'var(--text-secondary)',
                                                    color: 'white'
                                                }}>
                                                    {item.source === 'pdf' ? 'PDF' : 'Manual'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.year)}
                                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${deleteConfirm === item.year
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        }`}
                                                >
                                                    {deleteConfirm === item.year ? (
                                                        <>✓ ยืนยันลบ</>
                                                    ) : (
                                                        <>🗑️ ลบ</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Monthly Details */}
                <div className="rounded-xl border overflow-hidden" style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}>
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            รายละเอียดรายเดือน
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            คลิกที่ปีเพื่อดูข้อมูลแต่ละเดือน
                        </p>
                    </div>

                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {yearlyData.map((yearItem) => (
                            <div key={yearItem.year}>
                                {/* Year Header - Clickable */}
                                <button
                                    onClick={() => setExpandedYear(expandedYear === yearItem.year ? null : yearItem.year)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-50 transition-colors"
                                    style={{ backgroundColor: expandedYear === yearItem.year ? 'var(--hover-color)' : 'transparent' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                                            {yearItem.year}
                                        </span>
                                        <span className="text-sm px-2 py-1 rounded" style={{
                                            backgroundColor: 'var(--primary)',
                                            color: 'white'
                                        }}>
                                            {yearItem.monthCount} เดือน
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            ฿{yearItem.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {expandedYear === yearItem.year ? '▼' : '▶'}
                                        </span>
                                    </div>
                                </button>

                                {/* Monthly Details - Expandable */}
                                {expandedYear === yearItem.year && (
                                    <div className="px-4 py-3 space-y-3" style={{ backgroundColor: 'var(--hover-color)' }}>
                                        {yearItem.months.map((month) => (
                                            <div
                                                key={month.month}
                                                className="rounded-lg p-4 border"
                                                style={{
                                                    backgroundColor: 'var(--card-bg)',
                                                    borderColor: 'var(--border-color)'
                                                }}
                                            >
                                                {/* Month Header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                            เดือนที่ {month.month} - {getThaiMonth(month.month)}
                                                        </h3>
                                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                            {month.date}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                                            ฿{month.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                            รวมทั้งหมด
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Fund Details */}
                                                <div className="space-y-2">
                                                    {month.funds.map((fund, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="rounded p-3 border"
                                                            style={{
                                                                backgroundColor: 'var(--bg-primary)',
                                                                borderColor: 'var(--border-color)'
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                                                    {fund.name}
                                                                </h4>
                                                                <span className="font-bold" style={{ color: 'var(--primary)' }}>
                                                                    ฿{fund.value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div>
                                                                    <span style={{ color: 'var(--text-secondary)' }}>NAV/หน่วย:</span>
                                                                    <span className="ml-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                        ฿{fund.navPerUnit.toFixed(4)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: 'var(--text-secondary)' }}>จำนวนหน่วย:</span>
                                                                    <span className="ml-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                        {fund.units.toLocaleString('th-TH', { minimumFractionDigits: 4 })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Month Summary */}
                                                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                                    <div className="flex justify-between text-sm">
                                                        <span style={{ color: 'var(--text-secondary)' }}>
                                                            จำนวนกองทุน
                                                        </span>
                                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {month.funds.length} กองทุน
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to convert month number to Thai month name
function getThaiMonth(month: number): string {
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return months[month - 1] || '';
}
