import { RetirementPlan, RetirementProjection } from '@/types/portfolio';

interface RetirementInput {
    currentAge: number;
    retirementAge: number;
    currentSavings: number;
    monthlyContribution: number;
    expectedReturn: number; // Annual return as percentage
}

export function calculateRetirementProjection(input: RetirementInput): RetirementPlan {
    const yearsToRetirement = input.retirementAge - input.currentAge;
    const monthlyReturn = input.expectedReturn / 100 / 12;
    const projections: RetirementProjection[] = [];

    // Calculate future value with monthly contributions
    let currentValue = input.currentSavings;

    for (let year = 0; year <= yearsToRetirement; year++) {
        const age = input.currentAge + year;

        // Add projection for this year
        projections.push({
            age,
            portfolioValue: Math.round(currentValue),
        });

        // Calculate next year's value
        if (year < yearsToRetirement) {
            for (let month = 0; month < 12; month++) {
                currentValue = currentValue * (1 + monthlyReturn) + input.monthlyContribution;
            }
        }
    }

    const finalValue = projections[projections.length - 1].portfolioValue;

    // Calculate retirement readiness score (0-100)
    const targetRetirementFund = calculateTargetRetirementFund(input.retirementAge);
    const readinessScore = Math.min(100, Math.round((finalValue / targetRetirementFund) * 100));

    // Calculate recommended monthly contribution to reach target
    const recommendedMonthlyContribution = calculateRecommendedContribution(
        input.currentSavings,
        targetRetirementFund,
        yearsToRetirement,
        input.expectedReturn
    );

    return {
        currentAge: input.currentAge,
        retirementAge: input.retirementAge,
        currentSavings: input.currentSavings,
        monthlyContribution: input.monthlyContribution,
        expectedReturn: input.expectedReturn,
        projections,
        readinessScore,
        recommendedMonthlyContribution,
    };
}

function calculateTargetRetirementFund(retirementAge: number): number {
    // Estimate: Need 25x annual expenses
    // Assume monthly expenses of 30,000 THB in retirement
    const monthlyExpenses = 30000;
    const yearsInRetirement = 85 - retirementAge; // Assume living to 85
    return monthlyExpenses * 12 * yearsInRetirement;
}

function calculateRecommendedContribution(
    currentSavings: number,
    targetAmount: number,
    yearsToRetirement: number,
    expectedReturn: number
): number {
    if (yearsToRetirement <= 0) return 0;

    const monthlyReturn = expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;

    // Future value of current savings
    const futureValueOfSavings = currentSavings * Math.pow(1 + monthlyReturn, months);

    // Amount still needed
    const amountNeeded = targetAmount - futureValueOfSavings;

    if (amountNeeded <= 0) return 0;

    // Calculate monthly payment needed using future value of annuity formula
    // FV = PMT × [(1 + r)^n - 1] / r
    const monthlyPayment = amountNeeded / (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn));

    return Math.max(0, Math.round(monthlyPayment));
}

export function getRetirementAdvice(readinessScore: number): {
    status: 'excellent' | 'good' | 'fair' | 'needs-improvement';
    message: string;
    color: string;
} {
    if (readinessScore >= 90) {
        return {
            status: 'excellent',
            message: 'ยอดเยี่ยม! คุณอยู่ในเส้นทางที่ดีสำหรับการเกษียณที่มั่นคง',
            color: 'text-success',
        };
    } else if (readinessScore >= 70) {
        return {
            status: 'good',
            message: 'ดีมาก! คุณกำลังเดินหน้าไปในทิศทางที่ถูกต้อง',
            color: 'text-success',
        };
    } else if (readinessScore >= 50) {
        return {
            status: 'fair',
            message: 'พอใช้ได้ แต่ควรเพิ่มการออมเพื่อความมั่นคงมากขึ้น',
            color: 'text-warning',
        };
    } else {
        return {
            status: 'needs-improvement',
            message: 'ควรปรับแผนการออมเพื่อให้บรรลุเป้าหมายการเกษียณ',
            color: 'text-danger',
        };
    }
}
