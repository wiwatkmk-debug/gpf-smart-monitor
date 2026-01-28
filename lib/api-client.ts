// API Client for fetching market data
export interface MarketData {
    set: {
        value: number;
        change: number;
        changePercent: number;
    };
    sp500: {
        value: number;
        change: number;
        changePercent: number;
    };
    gold: {
        value: number;
        change: number;
        changePercent: number;
    };
    usdthb: {
        value: number;
        change: number;
        changePercent: number;
    };
}

export async function fetchMarketData(): Promise<MarketData> {
    try {
        const response = await fetch('/api/market', {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error('Failed to fetch market data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching market data:', error);
        // Return fallback data
        return {
            set: { value: 1350.25, change: 12.5, changePercent: 0.93 },
            sp500: { value: 5250.5, change: 25.3, changePercent: 0.48 },
            gold: { value: 2050.75, change: -5.25, changePercent: -0.26 },
            usdthb: { value: 35.25, change: 0.15, changePercent: 0.43 },
        };
    }
}

export async function fetchPortfolioData() {
    try {
        // Check for custom data in localStorage
        let customData = null;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('gpf_portfolio_data');
            if (stored) {
                customData = stored;
            }
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add custom data to headers if available
        if (customData) {
            headers['x-custom-portfolio'] = customData;
        }

        const response = await fetch('/api/portfolio', {
            headers,
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!response.ok) {
            throw new Error('Failed to fetch portfolio data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        throw error;
    }
}
