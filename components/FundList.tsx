'use client';

import { Fund } from '@/types/portfolio';
import { Wallet, TrendingUp, Globe, Coins, ChevronRight, PieChart } from 'lucide-react';

interface FundListProps {
    funds: Fund[];
}

const getFundIcon = (type: string, name: string) => {
    if (name.includes('ทองคำ') || type === 'alternative') return <Coins className="w-5 h-5 text-yellow-600" />;
    if (name.includes('ต่างประเทศ') || type === 'foreign') return <Globe className="w-5 h-5 text-blue-600" />;
    if (name.includes('หุ้น') || type === 'equity') return <TrendingUp className="w-5 h-5 text-red-600" />;
    return <Wallet className="w-5 h-5 text-emerald-600" />;
};

const getFundColorBg = (type: string, name: string) => {
    if (name.includes('ทองคำ')) return 'bg-yellow-100';
    if (name.includes('ต่างประเทศ')) return 'bg-blue-100';
    if (name.includes('หุ้น')) return 'bg-red-100';
    return 'bg-emerald-100';
};

export default function FundList({ funds }: FundListProps) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-gray-500" />
                    สินทรัพย์ในพอร์ต
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">
                    {funds.length} กองทุน
                </span>
            </div>

            <div className="divide-y divide-gray-100">
                {funds.map((fund) => (
                    <div
                        key={fund.id}
                        className="group p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getFundColorBg(fund.type, fund.name)} group-hover:scale-110 transition-transform`}>
                            {getFundIcon(fund.type, fund.name)}
                        </div>

                        {/* Middle: Name/Code */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate text-base mb-0.5">{fund.name}</h4>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                    {fund.code}
                                </span>
                                {fund.returnYTD !== undefined && (
                                    <span className={`${fund.returnYTD >= 0 ? 'text-emerald-600' : 'text-red-600'} font-medium`}>
                                        {fund.returnYTD >= 0 ? '+' : ''}{fund.returnYTD.toFixed(2)}% (YTD)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right: Values */}
                        <div className="text-right shrink-0">
                            <p className="font-bold text-base text-gray-900">
                                {fund.value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className="text-xs text-gray-500 flex flex-col items-end">
                                <span>{fund.units.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย</span>
                                <span className="text-[10px] opacity-70">NAV {fund.navPerUnit.toFixed(4)}</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>
        </div>
    );
}
