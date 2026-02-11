import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simulate API call - in production, this would call real APIs
        // For now, return realistic mock data that changes slightly
        const now = new Date();
        const variance = Math.sin(now.getTime() / 100000) * 20; // Creates realistic variation

        const marketData = {
            set: {
                value: 1350.25 + variance,
                change: 12.5 + (variance / 10),
                changePercent: 0.93 + (variance / 1000),
            },
            msci: {
                value: 3450.75 + (variance * 1.5),
                change: 15.3 + (variance / 8),
                changePercent: 0.45 + (variance / 2500),
            },
            globalBond: {
                value: 4.25 + (variance / 100), // Yield %
                change: 0.05 + (variance / 500),
                changePercent: 1.2 + (variance / 4000),
            },
            gold: {
                value: 2050.75 - (variance / 2),
                change: -5.25 - (variance / 20),
                changePercent: -0.26 - (variance / 5000),
            },
            usdthb: {
                value: 35.25 + (variance / 50),
                change: 0.15 + (variance / 100),
                changePercent: 0.43 + (variance / 3000),
            },
        };

        return NextResponse.json(marketData);
    } catch (error) {
        console.error('Error fetching market data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market data' },
            { status: 500 }
        );
    }
}
