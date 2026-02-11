import { Fund } from '@/types/portfolio';
import { FundHolding } from '@/types/gpf';

/**
 * Map fund code to fund type and risk level
 * This is a simple mapping based on common GPF fund codes
 */
export function mapFundCodeToMetadata(fundCode: string): {
    type: 'equity' | 'fixed-income' | 'property' | 'alternative';
    riskLevel: number;
} {
    const code = fundCode.toUpperCase();

    // Equity funds (high risk)
    if (code.includes('EQ') || code.includes('EQUITY') || code.includes('หุ้น')) {
        return { type: 'equity', riskLevel: 5 };
    }

    // Fixed income / Bond funds (low-medium risk)
    if (code.includes('FI') || code.includes('FIXED') || code.includes('BOND') || code.includes('หนี้')) {
        return { type: 'fixed-income', riskLevel: 2 };
    }

    // Money market funds (very low risk)
    if (code.includes('MM') || code.includes('MONEY') || code.includes('ตลาดเงิน')) {
        return { type: 'fixed-income', riskLevel: 1 };
    }

    // Property / Real estate funds (medium-high risk)
    if (code.includes('PROP') || code.includes('REIT') || code.includes('อสังหา')) {
        return { type: 'property', riskLevel: 4 };
    }

    // Mixed / Balanced funds (medium risk)
    if (code.includes('MX') || code.includes('MIXED') || code.includes('BAL') || code.includes('ผสม')) {
        return { type: 'equity', riskLevel: 3 };
    }

    // Alternative investments (high risk)
    if (code.includes('ALT') || code.includes('INFRA') || code.includes('COMMODITY')) {
        return { type: 'alternative', riskLevel: 4 };
    }

    // Default to balanced/mixed if unknown
    return { type: 'equity', riskLevel: 3 };
}

/**
 * Transform FundHolding array to Fund array for rebalancing engine
 */
export function transformHoldingsToFunds(
    holdings: FundHolding[],
    totalValue: number
): Fund[] {
    if (!holdings || holdings.length === 0) {
        return [];
    }

    return holdings.map((holding) => {
        const metadata = mapFundCodeToMetadata(holding.fundCode);
        const allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;

        return {
            id: holding.fundCode,
            name: holding.fundName,
            code: holding.fundCode,
            type: metadata.type,
            value: holding.value,
            units: holding.units,
            navPerUnit: holding.units > 0 ? holding.value / holding.units : 0,
            allocation: allocation,
            return1M: 0, // Not available in current data
            return3M: 0,
            return6M: 0,
            return1Y: 0,
            returnYTD: 0,
            riskLevel: metadata.riskLevel as 1 | 2 | 3 | 4 | 5,
        };
    });
}
