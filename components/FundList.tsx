'use client';

import { useState } from 'react';
import { Fund } from '@/types/portfolio';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FundListProps {
    funds: Fund[];
}

const RISK_LABELS = {
    1: 'ต่ำมาก',
    2: 'ต่ำ',
    3: 'ปานกลาง',
    4: 'สูง',
    5: 'สูงมาก',
};

const TYPE_LABELS = {
    equity: 'หุ้น',
    'fixed-income': 'ตราสารหนี้',
    property: 'อสังหาริมทรัพย์',
    alternative: 'ทางเลือก',
};

export default function FundList({ funds }: FundListProps) {
    const [expandedFund, setExpandedFund] = useState<string | null>(null);

    const toggleFund = (fundId: string) => {
        setExpandedFund(expandedFund === fundId ? null : fundId);
    };

    return (
        <Card>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                รายละเอียดกองทุน
            </h3>

            <div className="space-y-3">
                {funds.map((fund) => (
                    <div
                        key={fund.id}
                        className="border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
                        style={{ borderColor: 'var(--border-color)' }}
                        onClick={() => toggleFund(fund.id)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {fund.name}
                                    </h4>
                                    <Badge variant="default" className="text-xs">
                                        {fund.code}
                                    </Badge>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {TYPE_LABELS[fund.type]} · ความเสี่ยง: {RISK_LABELS[fund.riskLevel]}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                    ฿{fund.value.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {fund.allocation.toFixed(1)}%
                                </p>
                            </div>
                            {expandedFund === fund.id ? (
                                <ChevronUp className="w-5 h-5 ml-2" style={{ color: 'var(--text-secondary)' }} />
                            ) : (
                                <ChevronDown className="w-5 h-5 ml-2" style={{ color: 'var(--text-secondary)' }} />
                            )}
                        </div>

                        {expandedFund === fund.id && (
                            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4" style={{ borderColor: 'var(--border-color)' }}>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        1 เดือน
                                    </p>
                                    <p className={`font-semibold ${fund.return1M >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {fund.return1M > 0 && '+'}{fund.return1M.toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        3 เดือน
                                    </p>
                                    <p className={`font-semibold ${fund.return3M >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {fund.return3M > 0 && '+'}{fund.return3M.toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        6 เดือน
                                    </p>
                                    <p className={`font-semibold ${fund.return6M >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {fund.return6M > 0 && '+'}{fund.return6M.toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        1 ปี
                                    </p>
                                    <p className={`font-semibold ${fund.return1Y >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {fund.return1Y > 0 && '+'}{fund.return1Y.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
