
import { INVESTMENT_PLANS } from './mock-gpf-data';
import { InvestmentPlan } from '@/types/gpf';

export interface Question {
    id: number;
    text: string;
    options: {
        label: string;
        score: number;
    }[];
}

export const RISK_QUIZ: Question[] = [
    {
        id: 1,
        text: "อายุของท่าน (Age Group)",
        options: [
            { label: "มากกว่า 55 ปี", score: 1 },
            { label: "45 - 55 ปี", score: 2 },
            { label: "35 - 44 ปี", score: 3 },
            { label: "น้อยกว่า 35 ปี", score: 4 },
        ]
    },
    {
        id: 2,
        text: "ประสบการณ์การลงทุน (Experience)",
        options: [
            { label: "ไม่มีประสบการณ์ (ฝากออมทรัพย์อย่างเดียว)", score: 1 },
            { label: "เคยซื้อกองทุนรวมตราสารหนี้/พันธบัตร", score: 2 },
            { label: "เคยซื้อกองทุนหุ้น หรือเล่นหุ้นบ้าง", score: 3 },
            { label: "เชี่ยวชาญ ลงทุนในสินทรัพย์หลากหลาย", score: 4 },
        ]
    },
    {
        id: 3,
        text: "ระยะเวลาที่ท่านคาดว่าจะถือครองเงินลงทุนนี้",
        options: [
            { label: "น้อยกว่า 1 ปี", score: 1 },
            { label: "1 - 3 ปี", score: 2 },
            { label: "3 - 5 ปี", score: 3 },
            { label: "มากกว่า 5 ปี", score: 4 },
        ]
    },
    {
        id: 4,
        text: "หากเงินลงทุนของท่านลดลง 20% ท่านจะรู้สึกอย่างไร",
        options: [
            { label: "เครียดมาก รับไม่ได้เลย (ขายทันที)", score: 1 },
            { label: "กังวล แต่พอรอได้ระยะสั้น", score: 2 },
            { label: "เข้าใจว่าเป็นเรื่องปกติของตลาด (ถือรอได้)", score: 3 },
            { label: "เป็นโอกาสในการซื้อเพิ่ม (ชอบความเสี่ยง)", score: 4 },
        ]
    },
    {
        id: 5,
        text: "เป้าหมายหลักในการลงทุนของท่าน",
        options: [
            { label: "เน้นเงินต้นปลอดภัย ไม่หายแน่นอน", score: 1 },
            { label: "ชนะเงินเฟ้อเล็กน้อย เสี่ยงได้นิดหน่อย", score: 2 },
            { label: "ต้องการสะสมความมั่งคั่งระยะยาว", score: 3 },
            { label: "ต้องการผลตอบแทนสูงสุด เทียบเท่าตลาดหุ้น", score: 4 },
        ]
    }
];

export interface RiskResult {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    label: string;
    description: string;
    recommendedPlanIds: string[];
}

export function calculateRiskProfile(answers: Record<number, number>): RiskResult {
    let score = 0;
    for (const key in answers) {
        score += answers[key];
    }

    // Max score = 20 (4x5), Min = 5 (1x5)
    if (score <= 10) {
        return {
            score,
            level: 'Low',
            label: 'เสี่ยงต่ำ (Conservative)',
            description: 'เน้นคุ้มครองเงินต้น ไม่ชอบความผันผวน เหมาะกับแผนที่มั่นคง',
            recommendedPlanIds: ['FIXED_INCOME'] // Money Market is generic, using Fixed Income
        };
    } else if (score <= 15) {
        return {
            score,
            level: 'Medium',
            label: 'เสี่ยงปานกลาง (Moderate)',
            description: 'รับความผันผวนได้บ้างเพื่อโอกาสรับผลตอบแทนที่สูงกว่าเงินฝาก',
            recommendedPlanIds: ['MIXED', 'LIFEPATH_2045']
        };
    } else {
        return {
            score,
            level: 'High',
            label: 'เสี่ยงสูง (Aggressive)',
            description: 'ต้องการผลตอบแทนสูง รับความผันผวนได้ดี ลงทุนระยะยาวได้',
            recommendedPlanIds: ['THAI_EQUITY', 'GLOBAL_EQUITY', 'LIFEPATH_2065']
        };
    }
}

export function getRecommendedPlans(ids: string[]): InvestmentPlan[] {
    return INVESTMENT_PLANS.filter(p => ids.includes(p.id));
}
