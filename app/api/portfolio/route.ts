import { NextResponse, NextRequest } from 'next/server';
import { getPortfolio } from '@/app/actions/portfolio';

export async function GET(request: NextRequest) {
    try {
        console.log("Fetching portfolio data...");

        // 1. Fetch real portfolio data from DB via Server Action
        const gpfAccount = await getPortfolio();

        // 2. Map GPFAccount (Backend) to PortfolioData (Frontend)
        const portfolio = {
            totalValue: gpfAccount.totalBalance,
            todayChange: 0, // Not tracked in DB yet
            todayChangePercent: 0,
            totalReturn: 0, // derived from holdings?
            totalReturnPercent: 0,
            lastUpdated: gpfAccount.lastUpdated ? new Date(gpfAccount.lastUpdated) : new Date(),
            funds: (gpfAccount.holdings || []).map((h, index) => ({
                id: `fund-${index}`, // Temporary ID
                name: h.name,
                code: h.name.substring(0, 10), // Temporary Generic Code
                type: 'equity', // Defaulting to equity for now, need lookup logic
                value: h.value,
                units: h.units,
                navPerUnit: h.navPerUnit,
                allocation: gpfAccount.totalBalance > 0 ? (h.value / gpfAccount.totalBalance) * 100 : 0,
                return1M: 0,
                return3M: 0,
                return6M: 0,
                return1Y: 0,
                returnYTD: 0,
                riskLevel: 3
            }))
        };

        // 3. Fetch historical data (currently part of getPortfolio result, but let's be explicit)
        // In the future, we might want to separate history fetching if it gets too heavy
        const historical = gpfAccount.history || [];

        return NextResponse.json({
            portfolio,
            historical,
        });
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portfolio data' },
            { status: 500 }
        );
    }
}
