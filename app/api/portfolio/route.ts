import { NextResponse } from 'next/server';
import { mockPortfolio, mockHistoricalData } from '@/lib/mockData';

export async function GET() {
    try {
        // Return portfolio data from mockData.ts
        // In the future, this could fetch from a database
        const portfolioData = {
            portfolio: mockPortfolio,
            historical: mockHistoricalData,
        };

        return NextResponse.json(portfolioData);
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portfolio data' },
            { status: 500 }
        );
    }
}
