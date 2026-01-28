import { Fund, RebalancingRecommendation } from '@/types/portfolio';

interface RebalancingInput {
    currentAge: number;
    retirementAge: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

// Target allocation based on age and risk profile
function getTargetAllocation(input: RebalancingInput): Record<string, number> {
    // Base allocation on years to retirement
    let equityPercent = 100 - input.currentAge; // Rule of thumb: 100 - age

    // Adjust based on risk tolerance
    if (input.riskTolerance === 'conservative') {
        equityPercent = Math.max(20, equityPercent - 20);
    } else if (input.riskTolerance === 'aggressive') {
        equityPercent = Math.min(80, equityPercent + 10);
    }

    const fixedIncomePercent = 100 - equityPercent - 10; // Reserve 10% for alternatives

    return {
        equity: equityPercent,
        'fixed-income': fixedIncomePercent,
        property: 5,
        alternative: 5,
    };
}

export function generateRebalancingRecommendations(
    funds: Fund[],
    totalValue: number,
    input: RebalancingInput = {
        currentAge: 35,
        retirementAge: 60,
        riskTolerance: 'moderate',
    }
): RebalancingRecommendation[] {
    const targetAllocation = getTargetAllocation(input);
    const recommendations: RebalancingRecommendation[] = [];

    // Calculate current allocation by type
    const currentByType: Record<string, number> = {};
    funds.forEach(fund => {
        currentByType[fund.type] = (currentByType[fund.type] || 0) + fund.allocation;
    });

    // Generate recommendations for each fund
    funds.forEach(fund => {
        const targetForType = targetAllocation[fund.type] || 0;
        const currentForType = currentByType[fund.type] || 0;

        // Calculate proportional adjustment for this fund within its type
        const fundsOfSameType = funds.filter(f => f.type === fund.type);
        const proportionalTarget = (targetForType / fundsOfSameType.length);
        const allocationDiff = proportionalTarget - fund.allocation;

        let action: 'buy' | 'sell' | 'hold' = 'hold';
        let reason = '';

        if (Math.abs(allocationDiff) > 2) { // Only recommend if difference > 2%
            if (allocationDiff > 0) {
                action = 'buy';
                reason = `เพิ่มสัดส่วนเพื่อให้สอดคล้องกับอายุและความเสี่ยงที่รับได้`;
            } else {
                action = 'sell';
                reason = `ลดสัดส่วนเพื่อควบคุมความเสี่ยงให้เหมาะสมกับอายุ`;
            }

            const amountToAdjust = (allocationDiff / 100) * totalValue;

            recommendations.push({
                fundId: fund.id,
                fundName: fund.name,
                currentAllocation: fund.allocation,
                targetAllocation: proportionalTarget,
                action,
                amount: Math.abs(amountToAdjust),
                reason,
            });
        }
    });

    // Sort by amount (largest adjustments first)
    return recommendations.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

export function calculateRebalancingImpact(
    recommendations: RebalancingRecommendation[]
): {
    totalAdjustment: number;
    riskReduction: number;
    expectedReturnChange: number;
} {
    const totalAdjustment = recommendations.reduce((sum, rec) => sum + Math.abs(rec.amount), 0);

    // Simplified risk and return calculations
    const riskReduction = recommendations.filter(r => r.action === 'sell').length * 0.5;
    const expectedReturnChange = recommendations.reduce((sum, rec) => {
        return sum + (rec.action === 'buy' ? 0.1 : -0.1);
    }, 0);

    return {
        totalAdjustment,
        riskReduction,
        expectedReturnChange,
    };
}
