import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedFundData {
  name: string;
  value: number;
  units: number;
  navPerUnit: number;
}

export interface ExtractedPortfolioData {
  funds: ExtractedFundData[];
  dataDate?: string;
}

export async function extractDataFromImage(imageDataUrl: string): Promise<ExtractedPortfolioData> {
  // Trim API key to prevent hidden whitespace issues
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // List of currently supported Gemini models (as of January 2026)
  // Using Gemini 2.5 models - Gemini 1.5 and 2.0 are deprecated
  const modelsToTry = [
    'gemini-2.5-flash',      // ⭐ Recommended: Fast, cost-effective, good for image extraction
    'gemini-2.5-flash-lite', // Backup: Even faster, higher rate limits
    'gemini-2.5-pro'         // Fallback: More powerful for complex tasks
  ];

  // Detect MIME type from data URL
  const mimeTypeMatch = imageDataUrl.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

  if (!base64Data) {
    throw new Error('Invalid image data URL');
  }

  const prompt = `
คุณเป็น AI ที่ช่วยอ่านข้อมูลพอร์ตการลงทุนจาก กบข. (กองทุนบำเหน็จบำนาญข้าราชการ)

จากภาพที่ให้มา กรุณาดึงข้อมูลต่อไปนี้:

1. **แผนตราสารหนี้** (Fixed Income / Debt Instrument)
   - มูลค่า (บาท)
   - จำนวนหน่วย
   - NAV ต่อหน่วย (บาท)

2. **แผนหุ้นไทย** (Thai Equity)
   - มูลค่า (บาท)
   - จำนวนหน่วย
   - NAV ต่อหน่วย (บาท)

3. **แผนหุ้นต่างประเทศ** (Foreign Equity / Global Equity)
   - มูลค่า (บาท)
   - จำนวนหน่วย
   - NAV ต่อหน่วย (บาท)

4. **แผนทองคำ** (Gold)
   - มูลค่า (บาท)
   - จำนวนหน่วย
   - NAV ต่อหน่วย (บาท)

5. **วันที่ข้อมูล** (ถ้ามี)

กรุณาตอบในรูปแบบ JSON เท่านั้น ดังนี้:

{
  "dataDate": "YYYY-MM-DD หรือ null ถ้าไม่มี",
  "funds": [
    {
      "name": "แผนตราสารหนี้",
      "value": 0,
      "units": 0,
      "navPerUnit": 0
    },
    {
      "name": "แผนหุ้นไทย",
      "value": 0,
      "units": 0,
      "navPerUnit": 0
    },
    {
      "name": "แผนหุ้นต่างประเทศ",
      "value": 0,
      "units": 0,
      "navPerUnit": 0
    },
    {
      "name": "แผนทองคำ",
      "value": 0,
      "units": 0,
      "navPerUnit": 0
    }
  ]
}

**หมายเหตุ:**
- ถ้าไม่พบข้อมูลกองทุนใด ให้ใส่ 0
- ตัวเลขต้องเป็นตัวเลขล้วน ไม่มีเครื่องหมาย , หรือ ฿
- ตอบเฉพาะ JSON เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม
`;

  let lastError = null;

  // Try each model until one works
  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Trying Gemini API (${modelName})...`);
      // Let the library choose the appropriate API version automatically
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
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

      const data = JSON.parse(jsonMatch[0]) as ExtractedPortfolioData;
      console.log('✅ Data extracted successfully:', data);
      return data;

    } catch (error: any) {
      console.warn(`❌ Failed with ${modelName}:`, error.message);
      lastError = error;

      // If we hit quota, it's better to wait than to try other models immediately
      // but the loop will continue to try others which might have different quotas
      if (error.message.includes('quota') || error.message.includes('429')) {
        console.warn('Quota reached. Suggest waiting 30 seconds.');
      }

      // Continue to next model if it's a 404 (Not Found)
    }
  }

  // If we reach here, all models failed
  console.error('❌ All Gemini models failed. Last error:', lastError);

  if (lastError instanceof Error) {
    if (lastError.message.includes('quota') || lastError.message.includes('429')) {
      throw new Error('ใช้งานเกินขีดจำกัด (Quota Limit) กรุณารอสัก 30 วินาทีแล้วลองใหม่อีกครั้ง');
    }
    if (lastError.message.includes('API key')) {
      throw new Error('API key ไม่ถูกต้อง กรุณาตรวจสอบ Gemini API key');
    }
  }

  throw new Error('ไม่สามารถอ่านข้อมูลจากภาพได้: ' + (lastError instanceof Error ? lastError.message : 'Unknown error'));
}
