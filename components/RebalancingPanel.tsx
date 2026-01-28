'use client';

import { RebalancingRecommendation } from '@/types/portfolio';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Lightbulb } from 'lucide-react';

interface RebalancingPanelProps {
    recommendations: RebalancingRecommendation[];
}

export default function RebalancingPanel({ recommendations }: RebalancingPanelProps) {
    const hasRecommendations = recommendations.length > 0;

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    คำแนะนำปรับสมดุลพอร์ต
                </h3>
            </div>

            {!hasRecommendations ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                        <MinusCircle className="w-8 h-8 text-success" />
                    </div>
                    <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        พอร์ตของคุณสมดุลดีแล้ว
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        ไม่จำเป็นต้องปรับสมดุลในขณะนี้
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recommendations.map((rec) => (
                        <div
                            key={rec.fundId}
                            className="p-4 rounded-lg border"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {rec.fundName}
                                    </h4>
                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        {rec.reason}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        rec.action === 'buy'
                                            ? 'success'
                                            : rec.action === 'sell'
                                                ? 'danger'
                                                : 'info'
                                    }
                                >
                                    {rec.action === 'buy' && <ArrowUpCircle className="w-3 h-3 mr-1 inline" />}
                                    {rec.action === 'sell' && <ArrowDownCircle className="w-3 h-3 mr-1 inline" />}
                                    {rec.action === 'buy' ? 'ซื้อเพิ่ม' : rec.action === 'sell' ? 'ขาย' : 'คงไว้'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        สัดส่วนปัจจุบัน
                                    </p>
                                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {rec.currentAllocation.toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        สัดส่วนแนะนำ
                                    </p>
                                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {rec.targetAllocation.toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        จำนวนเงิน
                                    </p>
                                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        ฿{rec.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="btn btn-primary w-full mt-4">
                        ดูรายละเอียดการปรับสมดุล
                    </button>
                </div>
            )}
        </Card>
    );
}
