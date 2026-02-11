import { GPFAccount, InvestmentPlan } from '@/types/gpf';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
    {
        id: 'THAI_EQUITY',
        name: 'แผนตราสารทุนไทย (Thai Equity)',
        description: 'เน้นลงทุนในหุ้นไทยที่มีปัจจัยพื้นฐานดี มีศักยภาพในการเติบโต',
        riskLevel: 'High',
        historicalReturn: 8.50,
        details: [
            'เหมาะสำหรับสมาชิกที่รับความเสี่ยงได้สูง',
            'ต้องการผลตอบแทนสูงในระยะยาว',
            'มีความผันผวนสูงตามภาวะตลาดหุ้น'
        ],
        allocation: [
            { assetClass: 'หุ้นไทย', percentage: 100 }
        ]
    },
    {
        id: 'GLOBAL_EQUITY',
        name: 'แผนตราสารทุนต่างประเทศ (Global Equity)',
        description: 'เน้นลงทุนในหุ้นทั่วโลก เพื่อกระจายความเสี่ยงและหาโอกาสเติบโตในต่างประเทศ',
        riskLevel: 'High',
        historicalReturn: 9.20,
        details: [
            'เหมาะสำหรับสมาชิกที่ต้องการกระจายการลงทุนไปต่างประเทศ',
            'รับความเสี่ยงจากอัตราแลกเปลี่ยนได้',
            'คาดหวังผลตอบแทนสูงจากหุ้นเทคโนโลยีและหุ้นเติบโตทั่วโลก'
        ],
        allocation: [
            { assetClass: 'หุ้นต่างประเทศ', percentage: 100 }
        ]
    },
    {
        id: 'FIXED_INCOME',
        name: 'แผนตราสารหนี้ (Fixed Income)',
        description: 'เน้นลงทุนในพันธบัตรรัฐบาลและหุ้นกู้เอกชนที่มีความมั่นคงสูง',
        riskLevel: 'Low',
        historicalReturn: 2.50,
        details: [
            'เหมาะสำหรับสมาชิกที่ต้องการความปลอดภัยของเงินต้น',
            'รับความเสี่ยงได้ต่ำ',
            'ต้องการผลตอบแทนที่สม่ำเสมอแต่ไม่สูงมาก'
        ],
        allocation: [
            { assetClass: 'ตราสารหนี้ไทย', percentage: 80 },
            { assetClass: 'เงินฝาก', percentage: 20 }
        ]
    },
    {
        id: 'MIXED',
        name: 'แผนผสม (Mixed Fund)',
        description: 'กระจายการลงทุนในสินทรัพย์หลากหลายประเภท เพื่อสมดุลระหว่างความเสี่ยงและผลตอบแทน',
        riskLevel: 'Medium',
        historicalReturn: 5.50,
        details: [
            'เหมาะสำหรับสมาชิกที่ต้องการผลตอบแทนปานกลางถึงสูง',
            'รับความผันผวนได้ระดับหนึ่ง',
            'มีการกระจายความเสี่ยงอย่างดี'
        ],
        allocation: [
            { assetClass: 'หุ้นไทย', percentage: 20 },
            { assetClass: 'หุ้นต่างประเทศ', percentage: 20 },
            { assetClass: 'ตราสารหนี้', percentage: 40 },
            { assetClass: 'สินทรัพย์ทางเลือก', percentage: 20 }
        ]
    },
    {
        id: 'LIFEPATH_2045',
        name: 'Life Path 2045',
        description: 'แผนสมดุลตามอายุ สำหรับผู้ที่เกษียณช่วงปี พ.ศ. 2588 (ค.ศ. 2045)',
        riskLevel: 'Medium',
        historicalReturn: 6.80,
        details: [
            'ปรับสัดส่วนการลงทุนให้อัตโนมัติตามอายุ',
            'เริ่มจากเสี่ยงสูงและลดลงเมื่อใกล้เกษียณ',
            'เหมาะสำหรับผู้ที่ต้องการความสะดวก ไม่ต้องปรับแผนเอง'
        ],
        allocation: [
            { assetClass: 'หุ้น', percentage: 65 },
            { assetClass: 'ตราสารหนี้', percentage: 25 },
            { assetClass: 'อื่นๆ', percentage: 10 }
        ]
    },
    {
        id: 'LIFEPATH_2055',
        name: 'Life Path 2055',
        description: 'แผนสมดุลตามอายุ สำหรับผู้ที่เกษียณช่วงปี พ.ศ. 2598 (ค.ศ. 2055)',
        riskLevel: 'High',
        historicalReturn: 7.50,
        details: [
            'เน้นสัดส่วนหุ้นสูงกว่า Life Path 2045 เนื่องจากมีระยะเวลาลงทุนนานกว่า',
            'ปรับลดความเสี่ยงอัตโนมัติเมื่ออายุมากขึ้น'
        ],
        allocation: [
            { assetClass: 'หุ้น', percentage: 80 },
            { assetClass: 'ตราสารหนี้', percentage: 15 },
            { assetClass: 'อื่นๆ', percentage: 5 }
        ]
    },
    {
        id: 'LIFEPATH_2065',
        name: 'Life Path 2065',
        description: 'แผนสมดุลตามอายุ สำหรับผู้ที่เกษียณช่วงปี พ.ศ. 2608 (ค.ศ. 2065)',
        riskLevel: 'High',
        historicalReturn: 8.00,
        details: [
            'เน้นสัดส่วนหุ้นสูงสุด เพื่อสร้างผลตอบแทนระยะยาว',
            'เหมาะสำหรับสมาชิกอายุน้อยที่เพิ่งเริ่มทำงาน'
        ],
        allocation: [
            { assetClass: 'หุ้น', percentage: 90 },
            { assetClass: 'ตราสารหนี้', percentage: 10 }
        ]
    }
];

export const MOCK_GPF_ACCOUNT: GPFAccount = {
    memberId: 'GPF-12345678',
    name: 'คุณวิวัฒน์ (ตัวอย่าง)',
    currentPlanId: 'MIXED',
    totalBalance: 1250000.00,
    contributionRate: 5,
    salary: 55000,
    startDate: '2015-01-01',
    holdings: [],
    lastUpdated: new Date().toISOString(),
    history: [
        { date: '2025-01-01', totalBalance: 1200000, holdings: [] },
        { date: '2025-02-01', totalBalance: 1215000, holdings: [] },
        { date: '2025-03-01', totalBalance: 1208000, holdings: [] },
        { date: '2025-04-01', totalBalance: 1225000, holdings: [] },
        { date: '2025-05-01', totalBalance: 1230000, holdings: [] },
        { date: '2025-06-01', totalBalance: 1228000, holdings: [] },
        { date: '2025-07-01', totalBalance: 1240000, holdings: [] },
        { date: '2025-08-01', totalBalance: 1235000, holdings: [] },
        { date: '2025-09-01', totalBalance: 1245000, holdings: [] },
        { date: '2025-10-01', totalBalance: 1242000, holdings: [] },
        { date: '2025-11-01', totalBalance: 1248000, holdings: [] },
        { date: '2025-12-01', totalBalance: 1250000, holdings: [] }
    ]
};
