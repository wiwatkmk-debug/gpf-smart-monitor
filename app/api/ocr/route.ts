import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image (JPG, PNG, WEBP)' },
                { status: 400 }
            );
        }

        console.log(`🖼️ Processing Image: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

        // Convert Image to base64
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString('base64');

        // Initialize Gemini Model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Analyze this image of a GPF (Government Pension Fund) portfolio or similar investment summary.
        Extract the following data into a strictly valid JSON format:
        {
          "portfolioSnapshot": {
            "year": number (current year if not visible),
            "monthlySnapshots": [
              {
                "month": number (1-12),
                "date": string (ISO date YYYY-MM-DD, e.g. "2026-01-31"),
                "funds": [
                  {
                    "name": string (Fund Name, e.g. "แผนผสม", "แผนตราสารทุนไทย"),
                    "code": string (Fund Code if visible, else generate from name),
                    "value": number (Total Value in THB),
                    "units": number (Units),
                    "navPerUnit": number (NAV),
                    "allocation": number (Percentage)
                  }
                ]
              }
            ]
          }
        }
        
        Rules:
        1. If multiple months are visible, extract all of them.
        2. If only one month/date is visible, create one snapshot.
        3. Remove ALL commas from numbers (e.g. "1,234.56" -> 1234.56).
        4. Do NOT include markdown code blocks (\`\`\`json). Just the raw JSON string.
        5. Default to today's date if no date is found.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            }
        ]);

        const response = result.response;
        const text = response.text();

        // Clean up markdown if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let extractedData;
        try {
            extractedData = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            throw new Error("Failed to parse Gemini response as JSON");
        }

        console.log('✅ Image OCR processed successfully');

        return NextResponse.json({
            success: true,
            data: extractedData
        });

    } catch (error: any) {
        console.error('❌ Error processing Image OCR:', error);
        return NextResponse.json(
            {
                error: 'Failed to process Image',
                message: error.message
            },
            { status: 500 }
        );
    }
}
