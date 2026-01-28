import Header from '@/components/Header';
import PortfolioOverview from '@/components/PortfolioOverview';
import PortfolioChart from '@/components/PortfolioChart';
import AllocationChart from '@/components/AllocationChart';
import FundList from '@/components/FundList';
import MarketIndicators from '@/components/MarketIndicators';
import RebalancingPanel from '@/components/RebalancingPanel';
import AlertsPanel from '@/components/AlertsPanel';
import RetirementPlanner from '@/components/RetirementPlanner';
import { mockPortfolio, mockHistoricalData, mockMarketIndicators, mockAlerts } from '@/lib/mockData';
import { generateRebalancingRecommendations } from '@/lib/rebalancingEngine';

export default function Home() {
  const rebalancingRecommendations = generateRebalancingRecommendations(
    mockPortfolio.funds,
    mockPortfolio.totalValue,
    {
      currentAge: 35,
      retirementAge: 60,
      riskTolerance: 'moderate',
    }
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header />

        {/* Portfolio Overview */}
        <PortfolioOverview portfolio={mockPortfolio} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PortfolioChart data={mockHistoricalData} />
          </div>
          <div className="lg:col-span-1">
            <AllocationChart funds={mockPortfolio.funds} />
          </div>
        </div>

        {/* Market Indicators */}
        <div className="mb-6">
          <MarketIndicators indicators={mockMarketIndicators} />
        </div>

        {/* Rebalancing and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RebalancingPanel recommendations={rebalancingRecommendations} />
          <AlertsPanel alerts={mockAlerts} />
        </div>

        {/* Fund List */}
        <div className="mb-6">
          <FundList funds={mockPortfolio.funds} />
        </div>

        {/* Retirement Planner */}
        <div className="mb-6">
          <RetirementPlanner />
        </div>

        {/* Footer */}
        <footer className="text-center py-6">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            © 2026 GPF Smart Monitor - เกษียณมั่นคง ด้วยการวางแผนอัจฉริยะ
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            ข้อมูลที่แสดงเป็นข้อมูลจำลองเพื่อการสาธิต
          </p>
        </footer>
      </div>
    </div>
  );
}
