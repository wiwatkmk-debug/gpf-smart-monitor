import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FundData {
  name: string;
  value: number;
  units: number;
  navPerUnit: number;
}

export interface MonthlySnapshot {
  month: number; // 1-12
  date: string;  // YYYY-MM-DD
  funds: FundData[];
}

export interface PDFPortfolioData {
  year: number;
  monthlySnapshots: MonthlySnapshot[];
}

export interface Transaction {
  date: string;
  type: string;
  fundName: string;
  units: number;
  nav: number;
  amount: number;
}

export interface PDFExtractedData {
  portfolioSnapshot: PDFPortfolioData;
  transactions: Transaction[];
}

export async function extractPortfolioFromPDF(pdfDataUrl: string): Promise<PDFExtractedData> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Detect if it's a data URL or base64
  let base64Data: string;
  let mimeType = 'application/pdf';

  if (pdfDataUrl.startsWith('data:')) {
    const match = pdfDataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
      throw new Error('Invalid PDF data URL format');
    }
    mimeType = match[1];
    base64Data = match[2];
  } else {
    base64Data = pdfDataUrl;
  }

  const prompt = `
คุณเป็น AI ที่ช่วยอ่านข้อมูลพอร์ตการลงทุนจาก กบข. (กองทุนบำเหน็จบำนาญข้าราชการ)

จากไฟล์ PDF กรุณาดึงข้อมูล **ทุกเดือน** ที่ปรากฏในตาราง:

**วิธีการทำงาน:**
1. อ่านตารางธุรกรรมทั้งหมด
2. แบ่งกลุ่มตามเดือน (มกราคม, กุมภาพันธ์, มีนาคม, ... ธันวาคม)
3. สำหรับแต่ละเดือน หา**บรรทัดสุดท้าย**ของเดือนนั้น
4. ดึงข้อมูลยอดคงเหลือของแต่ละกองทุนจากบรรทัดนั้น

**ข้อมูลที่ต้องดึงสำหรับแต่ละเดือน:**

สำหรับแต่ละแผนการลงทุนที่มีข้อมูล:
- **แผนตราสารหนี้** (Fixed Income / ตราสารหนี้)
- **แผนหุ้นไทย** (Thai Equity / หุ้นไทย)
- **แผนหุ้นต่างประเทศ** (Foreign Equity / หุ้นต่างประเทศ)
- **แผนลงทุนพื้นฐานทั่วไป** (General / ลงทุนพื้นฐาน)

ดึงค่า 3 ตัวจากบรรทัดสุดท้ายของเดือน:
1. **มูลค่าต่อหน่วย (NAV)** - จากคอลัมน์ "มูลค่าต่อหน่วย"
2. **จำนวนหน่วย** - จากคอลัมน์ "จำนวนหน่วย"
3. **มูลค่ารวม (บาท)** - จากคอลัมน์ "จำนวนเงิน"

**กฎสำคัญ:**
- หาเฉพาะแผนที่**มีข้อมูลจริง** (มีจำนวนหน่วย > 0)
- ถ้าเดือนใดไม่มีธุรกรรม ให้ข้ามเดือนนั้น
- ถ้าแผนใดไม่มีข้อมูล (จำนวนหน่วย = 0 หรือ -) ไม่ต้องใส่
- แปลงวันที่จาก พ.ศ. เป็น ค.ศ. (เช่น 2568 → 2025)
- แปลงเดือนไทยเป็นตัวเลข (มกราคม=1, กุมภาพันธ์=2, ... ธันวาคม=12)

จากตัวอย่างนี้:
- **มกราคม**: หุ้นไทย (NAV=30.5, หน่วย=100, เงิน=3050), ตราสารหนี้ (NAV=25.2, หน่วย=80, เงิน=2016)
- **กุมภาพันธ์**: หุ้นไทย (NAV=31.0, หน่วย=200, เงิน=6200), ตราสารหนี้ (NAV=25.5, หน่วย=160, เงิน=4080)

**รูปแบบ JSON ที่ต้องการ:**

{
  "year": 2025,
  "monthlySnapshots": [
    {
      "month": 1,
      "date": "2025-01-28",
      "funds": [
        {
          "name": "แผนหุ้นไทย",
          "navPerUnit": 30.5,
          "units": 100.0,
          "value": 3050.0
        },
        {
          "name": "แผนตราสารหนี้",
          "navPerUnit": 25.2,
          "units": 80.0,
          "value": 2016.0
        }
      ]
    },
    {
      "month": 2,
      "date": "2025-02-25",
      "funds": [
        {
          "name": "แผนหุ้นไทย",
          "navPerUnit": 31.0,
          "units": 200.0,
          "value": 6200.0
        },
        {
          "name": "แผนตราสารหนี้",
          "navPerUnit": 25.5,
          "units": 160.0,
          "value": 4080.0
        }
      ]
    }
  ]
}

**ข้อกำหนด:**
- ส่งเฉพาะเดือนที่มีข้อมูล (อาจจะไม่ครบ 12 เดือน)
- เรียงลำดับเดือนจากน้อยไปมาก (1, 2, 3, ...)
- date ใช้วันที่จากบรรทัดสุดท้ายของเดือนนั้น
- ตอบเฉพาะ JSON ไม่ต้องมีคำอธิบาย
`;

  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Trying PDF extraction with ${modelName}...`);
      const currentModel = genAI.getGenerativeModel({ model: modelName });

      const result = await currentModel.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]);

      const response = await result.response;
      const text = response.text();
      console.log(`✅ Success with ${modelName}`);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response does not contain valid JSON');
      }

      const portfolioData = JSON.parse(jsonMatch[0]) as PDFPortfolioData;

      // For now, return empty transactions array
      // We can add transaction extraction later if needed
      return {
        portfolioSnapshot: portfolioData,
        transactions: []
      };

    } catch (error: any) {
      console.warn(`❌ Failed with ${modelName}:`, error.message);
      lastError = error;
    }
  }

  // If all models failed
  console.error('❌ All Gemini models failed. Last error:', lastError);
  throw new Error('ไม่สามารถอ่านข้อมูลจาก PDF ได้: ' + (lastError instanceof Error ? lastError.message : 'Unknown error'));
}
