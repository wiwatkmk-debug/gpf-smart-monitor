export interface FundHolding {
    fundCode: string;
    fundName: string;
    name: string;
    value: number;
    units: number;
    navPerUnit: number;
    updatedAt: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface InvestmentPlan {
    id: string;
    name: string;
    description: string;
    riskLevel: RiskLevel;
    historicalReturn: number; // Annualized percentage
    details: string[];
    allocation: {
        assetClass: string;
        percentage: number;
    }[];
}

export interface HistorySnapshot {
    date: string;
    totalBalance: number;
    holdings: FundHolding[];
}

export interface GPFAccount {
    memberId: string;
    name: string;
    currentPlanId: string;
    totalBalance: number;
    contributionRate: number; // Percentage of salary (e.g. 3, 5, 10, ... 30)
    salary: number;
    startDate: string; // Membership start date
    holdings?: FundHolding[];
    lastUpdated?: string;
    history?: HistorySnapshot[];
}

export interface Contribution {
    id: string;
    date: string;
    amount: number;
    type: 'Monthly' | 'LumpSum';
    status: 'Completed' | 'Pending';
}
