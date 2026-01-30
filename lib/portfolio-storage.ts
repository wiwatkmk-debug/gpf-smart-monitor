// Portfolio data storage using localStorage

import { PortfolioData, Fund } from '@/types/portfolio';

const STORAGE_KEY = 'gpf_portfolio_data';

export interface StoredPortfolioData {
    funds: Fund[];
    totalValue: number;
    dataDate: string;        // วันที่ข้อมูล
    lastUpdated: string;     // วันที่บันทึก
}

export function savePortfolioData(data: StoredPortfolioData): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving portfolio data:', error);
        throw new Error('Failed to save portfolio data');
    }
}

export function loadPortfolioData(): StoredPortfolioData | null {
    if (typeof window === 'undefined') return null;

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;

        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

export function hasCustomData(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearPortfolioData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

const HISTORY_KEY = 'gpf_rebalancing_history';
import { RebalancingTransaction } from '@/types/rebalancing';

export function saveRebalancingHistory(transaction: RebalancingTransaction): void {
    if (typeof window === 'undefined') return;

    try {
        const history = loadRebalancingHistory();
        history.unshift(transaction); // Add new at the beginning
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving rebalancing history:', error);
    }
}

export function loadRebalancingHistory(): RebalancingTransaction[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(HISTORY_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading rebalancing history:', error);
        return [];
    }
}
