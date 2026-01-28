export interface Fund {
    id: string;
    name: string;
    code: string;
    type: 'equity' | 'fixed-income' | 'property' | 'alternative';
    value: number;
    units: number;
    navPerUnit: number;
    allocation: number; // percentage
    return1M: number;
    return3M: number;
    return6M: number;
    return1Y: number;
    returnYTD: number;
    riskLevel: 1 | 2 | 3 | 4 | 5;
}

export interface PortfolioData {
    totalValue: number;
    todayChange: number;
    todayChangePercent: number;
    totalReturn: number;
    totalReturnPercent: number;
    funds: Fund[];
    lastUpdated: Date;
}

export interface HistoricalData {
    date: string;
    value: number;
}

export interface MarketIndicator {
    id: string;
    name: string;
    symbol?: string;
    value: number;
    change: number;
    changePercent: number;
    lastUpdated?: Date;
    icon?: string;
}

export interface RebalancingRecommendation {
    fundId: string;
    fundName: string;
    currentAllocation: number;
    targetAllocation: number;
    action: 'buy' | 'sell' | 'hold';
    amount: number;
    reason: string;
}

export interface Alert {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionRequired?: boolean;
}

export interface RetirementProjection {
    age: number;
    portfolioValue: number;
}

export interface RetirementPlan {
    currentAge: number;
    retirementAge: number;
    currentSavings: number;
    monthlyContribution: number;
    expectedReturn: number;
    projections: RetirementProjection[];
    readinessScore: number;
    recommendedMonthlyContribution: number;
}
