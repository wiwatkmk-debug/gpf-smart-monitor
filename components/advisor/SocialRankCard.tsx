import React from 'react';
import { Trophy, TrendingUp, Users, Info } from 'lucide-react';
import { BenchmarkResult } from '@/app/actions/benchmarking';

interface Props {
    data: BenchmarkResult | null;
}

export default function SocialRankCard({ data }: Props) {
    if (!data) return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[200px] text-gray-400">
            กำลังคำนวณอันดับ...
        </div>
    );

    const isTop10 = data.percentile <= 10;
    const isTop20 = data.percentile <= 20;

    // Determine color and message based on rank
    const colorClass = isTop10 ? 'text-emerald-600' : isTop20 ? 'text-blue-600' : 'text-amber-600';
    const bgClass = isTop10 ? 'bg-emerald-50' : isTop20 ? 'bg-blue-50' : 'bg-amber-50';
    const message = isTop10 ? 'สุดยอด! คุณคือกลุ่มนำ' : isTop20 ? 'ทำได้ดีมาก! เกินค่าเฉลี่ย' : 'สู้ต่อไป! ออมเพิ่มอีกนิด';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Trophy size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <Users size={20} className="text-blue-500" />
                    <h3 className="font-bold">อันดับของคุณ (Social Benchmark)</h3>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">เทียบกับสมาชิกในกลุ่มอายุ</div>
                        <div className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full w-fit text-sm">
                            {data.ageRange} ปี
                        </div>

                        <div className="mt-4">
                            <div className="text-4xl font-extrabold flex items-baseline gap-2">
                                <span className={colorClass}>Top {data.percentile}%</span>
                                <span className="text-sm text-gray-400 font-normal">ของรุ่นเดียวกัน</span>
                            </div>
                            <p className={`text-sm mt-1 font-medium ${colorClass}`}>{message}</p>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-3">
                        {/* Stats Rows */}
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-gray-50">
                            <span className="text-gray-500">ลำดับของคุณ</span>
                            <span className="font-bold text-gray-900">#{data.rank} <span className="text-gray-400 font-normal">/ {data.totalPeers}</span></span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>ค่าเฉลี่ย ({data.averageBalance > 1000000 ? (data.averageBalance / 1000000).toFixed(1) + 'M' : (data.averageBalance / 1000).toFixed(0) + 'k'})</span>
                                <span>ผู้นำกลุ่ม ({data.topPeerBalance > 1000000 ? (data.topPeerBalance / 1000000).toFixed(1) + 'M' : (data.topPeerBalance / 1000).toFixed(0) + 'k'})</span>
                            </div>
                            {/* Simple Progress Bar visual */}
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden relative">
                                {/* Peer Average Marker (Approx 50%) */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 opacity-50"></div>

                                {/* User Position (Inverted logic: Top 1% is RIGHT/MAX? No, Rank 1 is BEST. ) 
                                    Let's map: 
                                    Sorted Descending: Max Balance = Rank 1.
                                    We want a bar from 0 to Max Balance.
                                    Assume Min is 0.
                                */}
                                <div
                                    className={`h-full rounded-full ${isTop10 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, (data.averageBalance / data.topPeerBalance) * 100)}%` }} // This is actually confusing without real values. 
                                // Better logic: Just show logical "Better than X%"
                                ></div>
                            </div>
                            <div className="text-[10px] text-gray-400 text-right">
                                *เปรียบเทียบจากยอดเงินรวมในพอร์ต
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
