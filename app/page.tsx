'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PortfolioOverview from '@/components/PortfolioOverview';
import PortfolioChart from '@/components/PortfolioChart';
import AllocationChart from '@/components/AllocationChart';
import FundList from '@/components/FundList';
import MarketIndicators from '@/components/MarketIndicators';
import RebalancingPanel from '@/components/RebalancingPanel';
import AlertsPanel from '@/components/AlertsPanel';
import RetirementPlanner from '@/components/RetirementPlanner';
import { mockAlerts } from '@/lib/mockData';
import { generateRebalancingRecommendations } from '@/lib/rebalancingEngine';
import { fetchPortfolioData, fetchMarketData } from '@/lib/api-client';
import type { PortfolioData, HistoricalData, MarketIndicator } from '@/types/portfolio';

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch portfolio and market data in parallel
      const [portfolioResponse, marketData] = await Promise.all([
        fetchPortfolioData(),
        fetchMarketData(),
      ]);

      setPortfolio(portfolioResponse.portfolio);
      setHistoricalData(portfolioResponse.historical);

      // Convert market data to MarketIndicator format
      const indicators: MarketIndicator[] = [
        {
          id: 'set',
          name: 'SET Index',
          value: marketData.set.value,
          change: marketData.set.change,
          changePercent: marketData.set.changePercent,
          icon: 'TrendingUp',
        },
        {
          id: 'sp500',
          name: 'S&P 500',
          value: marketData.sp500.value,
          change: marketData.sp500.change,
          changePercent: marketData.sp500.changePercent,
          icon: 'TrendingUp',
        },
        {
          id: 'gold',
          name: 'Gold (USD/oz)',
          value: marketData.gold.value,
          change: marketData.gold.change,
          changePercent: marketData.gold.changePercent,
          icon: 'Coins',
        },
        {
          id: 'usdthb',
          name: 'USD/THB',
          value: marketData.usdthb.value,
          change: marketData.usdthb.change,
          changePercent: marketData.usdthb.changePercent,
          icon: 'DollarSign',
        },
      ];

      setMarketIndicators(indicators);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

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

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'เกิดข้อผิดพลาด'}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const rebalancingRecommendations = generateRebalancingRecommendations(
    portfolio.funds,
    portfolio.totalValue,
    {
      currentAge: 35,
      retirementAge: 60,
      riskTolerance: 'moderate',
    }
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <Header />
          <button
            onClick={loadData}
            className="px-4 py-2 glass rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            รีเฟรช
          </button>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview portfolio={portfolio} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PortfolioChart data={historicalData} />
          </div>
          <div className="lg:col-span-1">
            <AllocationChart funds={portfolio.funds} />
          </div>
        </div>

        {/* Market Indicators */}
        <div className="mb-6">
          <MarketIndicators indicators={marketIndicators} />
        </div>

        {/* Rebalancing and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RebalancingPanel recommendations={rebalancingRecommendations} />
          <AlertsPanel alerts={mockAlerts} />
        </div>

        {/* Fund List */}
        <div className="mb-6">
          <FundList funds={portfolio.funds} />
        </div>

        {/* Retirement Planner */}
        <RetirementPlanner />
      </div>
    </div>
  );
}
