import { PortfolioData } from '@/types/portfolio';
import StatCard from './ui/StatCard';
import { Wallet, TrendingUp, PiggyBank, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface PortfolioOverviewProps {
    portfolio: PortfolioData;
}

export default function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
    return (
        <div className="mb-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    ภาพรวมพอร์ต
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    อัพเดทล่าสุด: {format(portfolio.lastUpdated, 'dd MMM yyyy HH:mm น.', { locale: th })}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="มูลค่าพอร์ตรวม"
                    value={`฿${portfolio.totalValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`}
                    icon={<Wallet className="w-5 h-5" />}
                    className="col-span-1 md:col-span-2"
                />

                <StatCard
                    title="การเปลี่ยนแปลงวันนี้"
                    value={`฿${Math.abs(portfolio.todayChange).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`}
                    change={portfolio.todayChange}
                    changePercent={portfolio.todayChangePercent}
                    icon={<TrendingUp className="w-5 h-5" />}
                    trend={portfolio.todayChange >= 0 ? 'up' : 'down'}
                />

                <StatCard
                    title="ผลตอบแทนรวม"
                    value={`฿${Math.abs(portfolio.totalReturn).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`}
                    changePercent={portfolio.totalReturnPercent}
                    icon={<PiggyBank className="w-5 h-5" />}
                    trend={portfolio.totalReturn >= 0 ? 'up' : 'down'}
                />
            </div>
        </div>
    );
}
