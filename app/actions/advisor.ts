'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GPFAccount, InvestmentPlan } from '@/types/gpf';
import { RiskResult } from '@/lib/risk-engine';
import { currentUser } from '@clerk/nextjs/server';

interface AdviceRequest {
    riskProfile: RiskResult;
    currentPortfolio: GPFAccount;
    recommendedPlans: InvestmentPlan[];
    userQuestionsAndAnswers: Record<string, string>;
}

export async function generateInvestmentAdvice(data: AdviceRequest): Promise<string> {
    const user = await currentUser();
    if (!user) return "กรุณาเข้าสู่ระบบก่อนใช้งาน";

    // 1. Check Subscription
    const { checkSubscription } = await import('@/lib/subscription');
    const sub = await checkSubscription(user.id);

    if (!sub.allowed) {
        return `⚠️ ขออภัย สิทธิ์การใช้งานของคุณหมดอายุแล้ว (${sub.reason}) กรุณาติดต่อ Admin เพื่อต่ออายุ`;
    }

    const apiKey = process.env.GEMINI_API_KEY; // Use server-side key

    if (!apiKey) {
        console.warn('Gemini API Key missing');
        return "ระบบ AI ขัดข้องชั่วคราว (API Key missing) - กรุณาติดต่อผู้ดูแลระบบ";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // ... existing logic
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use faster/newer model

    // Prepare context for AI
    const portfolioSummary = data.currentPortfolio.holdings && data.currentPortfolio.holdings.length > 0
        ? data.currentPortfolio.holdings.map(h => `- ${h.name}: ${h.value.toLocaleString()} THB (${((h.value / data.currentPortfolio.totalBalance) * 100).toFixed(1)}%)`).join('\n')
        : "No detailed holdings available (Mock Data)";

    // ... continue code code

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

export interface HealthCheckResult {
    grade: string; // A, B, C, D, F
    score: number; // 0-100
    color: string; // hex code or tailwind class
    summary: string;
    keyFactors: { name: string; status: 'GOOD' | 'WARNING' | 'CRITICAL'; desc: string }[];
}

export async function analyzePortfolioHealth(data: AdviceRequest): Promise<HealthCheckResult> {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const { checkSubscription } = await import('@/lib/subscription');
    const sub = await checkSubscription(user.id);
    if (!sub.allowed) throw new Error("Subscription Expired");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        You are a harsh but fair financial teacher grading a student's investment portfolio.
        Analyze this GPF (Government Pension Fund) member's portfolio and give it a letter grade (A-F).

        **Profile:**
        - Risk Level: ${data.riskProfile.label}
        - Current Plan: ${data.currentPortfolio.currentPlanId}
        - Balance: ${data.currentPortfolio.totalBalance.toLocaleString()} THB
        - User Answers: ${JSON.stringify(data.userQuestionsAndAnswers)}

        **Criteria for Grading:**
        - **Consistency**: Does plan match risk level? (Mismatch = penalty)
        - **Diversification**: Is the plan diversified? (Single asset = penalty)
        - **Sufficiency**: Based on balance/age (infer from start date), will they have enough?

        **Output JSON Schema:**
        {
            "grade": "A" | "B" | "C" | "D" | "F",
            "score": number (0-100),
            "color": "text-emerald-600" | "text-blue-600" | "text-yellow-600" | "text-orange-600" | "text-red-600",
            "summary": "Short 2-sentence teacher's comment in Thai",
            "keyFactors": [
                { "name": "Risk Compatibility", "status": "GOOD" | "WARNING" | "CRITICAL", "desc": "Brief reason in Thai" },
                { "name": "Diversification", "status": "GOOD" | "WARNING" | "CRITICAL", "desc": "Brief reason in Thai" },
                { "name": "Retirement Readiness", "status": "GOOD" | "WARNING" | "CRITICAL", "desc": "Brief reason in Thai" }
            ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Health Check Error:", error);
        return {
            grade: "?",
            score: 0,
            color: "text-gray-400",
            summary: "ระบบไม่สามารถประมวลผลได้ในขณะนี้",
            keyFactors: []
        };
    }
}
