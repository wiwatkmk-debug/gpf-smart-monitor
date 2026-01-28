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
