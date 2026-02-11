'use server';

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
    debug?: string; // For debugging purposes
}

export async function extractPortfolioFromImage(imageDataUrl: string): Promise<ExtractedPortfolioData> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('Gemini API key not configured on server.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 1.5 Flash for speed and vision capabilities
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Extract base64 data
    const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeTypeMatch = imageDataUrl.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

    const prompt = `
  Analyze this portfolio image (likely from GPF/Government Pension Fund app).
  Extract the following data for these specific funds:
  
  1. **Fixed Income Plan** (แผนตราสารหนี้ / GPF-FIX)
  2. **Thai Equity Plan** (แผนหุ้นไทย / GPF-EQ-TH)
  3. **Global Equity Plan** (แผนหุ้นต่างประเทศ / GPF-EQ-GL)
  4. **Gold Plan** (แผนทองคำ / GPF-GOLD)

  For each fund, extract:
  - Value (Baht)
  - Units
  - NAV per Unit

  Also extract the "Data Date" (วันที่ข้อมูล) if visible.

  Return ONLY valid JSON in this format:
  {
    "dataDate": "YYYY-MM-DD",
    "funds": [
      { "name": "แผนตราสารหนี้", "value": 123.45, "units": 12.34, "navPerUnit": 10.12 },
      ...
    ]
  }
  
  Rules:
  - Use 0 if a value is missing.
  - Remove all commas from numbers.
  - Return only JSON.
  `;

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            },
            prompt
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean code fences if present
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

        const data = JSON.parse(cleanText) as ExtractedPortfolioData;
        return data;

    } catch (error: any) {
        console.error('OCR Error:', error);
        throw new Error(`Failed to process image: ${error.message}`);
    }
}
