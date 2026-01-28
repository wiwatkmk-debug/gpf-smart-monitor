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
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Detect MIME type from data URL
  const mimeTypeMatch = imageDataUrl.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

  // Convert data URL to base64
  const base64Data = imageDataUrl.split(',')[1];

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

  try {
    console.log('🤖 Calling Gemini API...');
    console.log('MIME type:', mimeType);
    console.log('API Key present:', !!apiKey);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API response received');
    console.log('Response text:', text);

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Could not find JSON in response:', text);
      throw new Error('Could not extract JSON from AI response');
    }

    const data = JSON.parse(jsonMatch[0]) as ExtractedPortfolioData;

    console.log('✅ Data extracted successfully:', data);

    return data;
  } catch (error) {
    console.error('❌ Error extracting data from image:', error);

    // Provide more specific error message
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        throw new Error('API key ไม่ถูกต้อง กรุณาตรวจสอบ Gemini API key');
      } else if (error.message.includes('quota') || error.message.includes('QUOTA')) {
        throw new Error('API quota หมด กรุณารอสักครู่แล้วลองใหม่');
      } else if (error.message.includes('JSON')) {
        throw new Error('AI ไม่สามารถอ่านข้อมูลจากภาพได้ กรุณาลองใช้ภาพที่ชัดกว่า');
      } else if (error.message.includes('blocked') || error.message.includes('SAFETY')) {
        throw new Error('ภาพถูกบล็อกโดย AI safety filter กรุณาลองภาพอื่น');
      }
    }

    throw new Error('ไม่สามารถอ่านข้อมูลจากภาพได้ กรุณาลองใหม่อีกครั้ง: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
