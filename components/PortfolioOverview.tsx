import { PortfolioData } from '@/types/portfolio';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface PortfolioOverviewProps {
    portfolio: PortfolioData;
}

export default function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
    return (
        <div className="mb-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <p className="text-emerald-100 text-lg mb-2 font-medium">มูลค่าเงินในบัญชี (บาท)</p>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-sm">
                        {portfolio.totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>

                    <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full">
                        <span className="text-emerald-50 text-sm">ข้อมูล ณ วันที่</span>
                        <span className="text-white font-medium text-sm">
                            {format(portfolio.lastUpdated, 'd MMM yyyy', { locale: th })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
