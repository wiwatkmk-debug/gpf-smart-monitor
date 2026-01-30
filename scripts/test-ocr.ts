
import { extractPortfolioFromImage } from '../app/actions/extract-portfolio';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });



async function testOCR() {
    const imagePath = '/Users/depa/.gemini/antigravity/brain/4211d197-4cb4-49f5-905d-109295dce1dd/sample_portfolio_image_1769697305580.png';

    if (!fs.existsSync(imagePath)) {
        console.error('Image not found:', imagePath);
        return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    console.log('🚀 Sending image to Gemini OCR...');
    try {
        const start = Date.now();
        const result = await extractPortfolioFromImage(base64Image);
        const duration = Date.now() - start;

        console.log(`✅ Success! (${duration}ms)`);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

testOCR();
