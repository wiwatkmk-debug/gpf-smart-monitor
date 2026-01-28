import { NextResponse, NextRequest } from 'next/server';
import { mockPortfolio, mockHistoricalData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
    try {
        // Check if custom data is provided via request header
        const customDataHeader = request.headers.get('x-custom-portfolio');

        if (customDataHeader) {
            try {
                // Decode from base64 (supports Thai characters)
                const decoded = decodeURIComponent(escape(atob(customDataHeader)));
                const customData = JSON.parse(decoded);

                // Build portfolio from custom data
                const portfolio = {
                    ...mockPortfolio,
                    funds: customData.funds,
                    totalValue: customData.totalValue,
                };

                return NextResponse.json({
                    portfolio,
                    historical: mockHistoricalData,
                });
            } catch (parseError) {
                console.error('Error parsing custom data:', parseError);
                // Fall through to default data
            }
        }

        // Return default portfolio data from mockData.ts
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
