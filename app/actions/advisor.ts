'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GPFAccount, InvestmentPlan } from '@/types/gpf';
import { RiskResult } from '@/lib/risk-engine';

interface AdviceRequest {
    riskProfile: RiskResult;
    currentPortfolio: GPFAccount;
    recommendedPlans: InvestmentPlan[];
    userQuestionsAndAnswers: Record<string, string>;
}

export async function generateInvestmentAdvice(data: AdviceRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY; // Use server-side key

    if (!apiKey) {
        console.warn('Gemini API Key missing');
        return "ระบบ AI ขัดข้องชั่วคราว (API Key missing) - กรุณาติดต่อผู้ดูแลระบบ";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use faster/newer model

    // Prepare context for AI
    const portfolioSummary = data.currentPortfolio.holdings && data.currentPortfolio.holdings.length > 0
        ? data.currentPortfolio.holdings.map(h => `- ${h.name}: ${h.value.toLocaleString()} THB (${((h.value / data.currentPortfolio.totalBalance) * 100).toFixed(1)}%)`).join('\n')
        : "No detailed holdings available (Mock Data)";

    const historySummary = data.currentPortfolio.history && data.currentPortfolio.history.length > 0
        ? `History: Growing from ${data.currentPortfolio.history[0]?.totalBalance.toLocaleString()} to ${data.currentPortfolio.totalBalance.toLocaleString()}`
        : "No history available";

    const prompt = `
        You are an expert investment advisor for the Government Pension Fund (GPF/กบข.) of Thailand.
        Analyze the following member profile and provide personalized investment advice in Thai.

        **Member Profile:**
        - Risk Tolerance: ${data.riskProfile.label} (${data.riskProfile.level})
        - Current Plan: ${data.currentPortfolio.currentPlanId}
        - Total Balance: ${data.currentPortfolio.totalBalance.toLocaleString()} THB
        - Age/Service: (Infer from start date: ${data.currentPortfolio.startDate})

        **User Quiz Answers (Context):**
        ${Object.entries(data.userQuestionsAndAnswers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}

        **Current Portfolio Composition:**
        ${portfolioSummary}
        ${historySummary}

        **Risk Assessment Result:**
        - Description: ${data.riskProfile.description}
        - Recommended Plans: ${data.recommendedPlans.map(p => p.name).join(', ')}

        **Task:**
        Provide a concise, encouraging, and actionable recommendation in Thai (max 6-7 sentences).
        1. **Analyze Compatibility**: Does their current portfolio match their risk profile and quiz answers? (e.g., "Since you mentioned needing money in 3 years...")
        2. **Plan Recommendation**: Should they switch? Recommend specific plans.
        3. **Specific Benefits**: Why is this plan good for *them* specifically?
        4. **Encourage**: If they are doing well, tell them!

        **Tone:** Professional, Friendly, Encouraging (Thai language). Avoid generic financial disclaimer jargon; give actual advice based on the data.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini AI Error:', error);
        return "ขออภัย ระบบ AI ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้ กรุณาลองใหม่ภายหลัง";
    }
}
