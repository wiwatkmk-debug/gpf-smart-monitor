import { Fund, PortfolioData, HistoricalData, MarketIndicator, Alert } from '@/types/portfolio';

// Real GPF Portfolio Data (Updated: 23 Jan 2026)
export const mockFunds: Fund[] = [
    {
        id: 'gpf-fix-income',
        name: 'แผนตราสารหนี้',
        code: 'GPF-FIX',
        type: 'fixed-income',
        value: 195449.35,
        units: 8092.4373,
        navPerUnit: 24.1521,
        allocation: 29.6,
        return1M: 0.5,
        return3M: 1.5,
        return6M: 3.0,
        return1Y: 5.2,
        returnYTD: 2.1,
        riskLevel: 2,
    },
    {
        id: 'gpf-eq-th',
        name: 'แผนหุ้นไทย',
        code: 'GPF-EQ-TH',
        type: 'equity',
        value: 164667.18,
        units: 6916.5806,
        navPerUnit: 23.8076,
        allocation: 24.9,
        return1M: 2.1,
        return3M: 5.5,
        return6M: 11.8,
        return1Y: 17.2,
        returnYTD: 7.8,
        riskLevel: 4,
    },
    {
        id: 'gpf-eq-global',
        name: 'แผนหุ้นต่างประเทศ',
        code: 'GPF-EQ-GL',
        type: 'equity',
        value: 232248.96,
        units: 7057.0725,
        navPerUnit: 32.9101,
        allocation: 35.2,
        return1M: 1.8,
        return3M: 4.5,
        return6M: 10.2,
        return1Y: 16.5,
        returnYTD: 6.9,
        riskLevel: 5,
    },
    {
        id: 'gpf-gold',
        name: 'แผนทองคำ',
        code: 'GPF-GOLD',
        type: 'alternative',
        value: 68426.5,
        units: 1044.1837,
        navPerUnit: 65.5311,
        allocation: 10.4,
        return1M: 1.2,
        return3M: 3.8,
        return6M: 8.5,
        return1Y: 14.2,
        returnYTD: 5.5,
        riskLevel: 3,
    },
];

// Calculate portfolio totals from real data
const totalValue = mockFunds.reduce((sum, fund) => sum + fund.value, 0);
const weightedReturn = mockFunds.reduce((sum, fund) => sum + (fund.return1Y * fund.allocation / 100), 0);

export const mockPortfolio: PortfolioData = {
    totalValue: 660791.99, // Real total value
    todayChange: 2450.50, // Estimated daily change
    todayChangePercent: 0.37,
    totalReturn: totalValue * (weightedReturn / 100),
    totalReturnPercent: weightedReturn,
    funds: mockFunds,
    lastUpdated: new Date('2026-01-23'), // Date from screenshot
};

// Historical performance data (last 12 months) - Based on real portfolio
export const mockHistoricalData: HistoricalData[] = [
    { date: '2025-02', value: 580000 },
    { date: '2025-03', value: 595000 },
    { date: '2025-04', value: 588000 },
    { date: '2025-05', value: 605000 },
    { date: '2025-06', value: 618000 },
    { date: '2025-07', value: 625000 },
    { date: '2025-08', value: 615000 },
    { date: '2025-09', value: 630000 },
    { date: '2025-10', value: 640000 },
    { date: '2025-11', value: 650000 },
    { date: '2025-12', value: 655000 },
    { date: '2026-01', value: 660792 },
];

// Market indicators
export const mockMarketIndicators: MarketIndicator[] = [
    {
        id: 'set',
        name: 'ตลาดหลักทรัพย์ไทย',
        symbol: 'SET',
        value: 1456.82,
        change: 12.45,
        changePercent: 0.86,
        lastUpdated: new Date(),
    },
    {
        id: 'sp500',
        name: 'S&P 500',
        symbol: 'SPX',
        value: 5234.18,
        change: -8.32,
        changePercent: -0.16,
        lastUpdated: new Date(),
    },
    {
        id: 'dowjones',
        name: 'Dow Jones',
        symbol: 'DJI',
        value: 38456.23,
        change: 125.67,
        changePercent: 0.33,
        lastUpdated: new Date(),
    },
    {
        id: 'gold',
        name: 'ทองคำ',
        symbol: 'GOLD',
        value: 2042.50,
        change: 15.30,
        changePercent: 0.75,
        lastUpdated: new Date(),
    },
    {
        id: 'oil',
        name: 'น้ำมันดิบ',
        symbol: 'WTI',
        value: 78.45,
        change: -1.23,
        changePercent: -1.54,
        lastUpdated: new Date(),
    },
    {
        id: 'usdthb',
        name: 'USD/THB',
        symbol: 'USDTHB',
        value: 35.82,
        change: -0.15,
        changePercent: -0.42,
        lastUpdated: new Date(),
    },
];

// Alerts and notifications
export const mockAlerts: Alert[] = [
    {
        id: 'alert-1',
        type: 'warning',
        title: 'แนะนำปรับสมดุลพอร์ต',
        message: 'สัดส่วนหุ้นไทยสูงกว่าเป้าหมาย 5% ควรพิจารณาปรับสมดุล',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionRequired: true,
    },
    {
        id: 'alert-2',
        type: 'success',
        title: 'ผลตอบแทนดีเยี่ยม',
        message: 'พอร์ตของคุณทำผลตอบแทนสูงกว่าค่าเฉลี่ย 2.5% ในเดือนนี้',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: false,
        actionRequired: false,
    },
    {
        id: 'alert-3',
        type: 'info',
        title: 'อัพเดทตลาดโลก',
        message: 'ตลาดหุ้นสหรัฐฯ ปรับตัวขึ้น 0.5% หลังประกาศข้อมูลเศรษฐกิจ',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        read: true,
        actionRequired: false,
    },
    {
        id: 'alert-4',
        type: 'info',
        title: 'การลงทุนประจำเดือน',
        message: 'ระบบได้ทำการลงทุนประจำเดือนจำนวน 10,000 บาทเรียบร้อยแล้ว',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        actionRequired: false,
    },
];
