import { extractPortfolioFromImage } from '../app/actions/extract-portfolio';
import { extractPortfolioFromPDF } from '../lib/pdf-processor';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn("⚠️ .env.local not found, relying on existing process.env");
}

async function runChaosTests() {
    console.log('🔥 Starting Chaos Tests...');

    // 1. Test OCR with Invalid Data
    console.log('\n🧪 Test 1: OCR with Invalid Base64 Image');
    try {
        await extractPortfolioFromImage('invalid-base64-string');
        console.error('❌ Failed: Should have thrown an error for invalid image');
    } catch (error: any) {
        console.log('✅ Passed: Caught expected error:', error.message);
    }

    // 2. Test PDF Extraction with Invalid Data
    console.log('\n🧪 Test 2: PDF Extraction with Invalid Data');
    try {
        await extractPortfolioFromPDF('invalid-pdf-data');
        console.error('❌ Failed: Should have thrown an error for invalid PDF');
    } catch (error: any) {
        console.log('✅ Passed: Caught expected error:', error.message);
    }

    // 3. Test OCR with "Huge" but fake payload
    console.log('\n🧪 Test 3: OCR with Huge Payload (10MB)');
    try {
        const hugeString = 'a'.repeat(10 * 1024 * 1024);
        await extractPortfolioFromImage(`data:image/png;base64,${hugeString}`);
        console.error('❌ Failed: Should have thrown error or timed out');
    } catch (error: any) {
        console.log('✅ Passed: System handled huge payload gracefully:', error.message);
    }

    // 4. Test PDF with Empty Data
    console.log('\n🧪 Test 4: PDF Extraction with Empty Payload');
    try {
        await extractPortfolioFromPDF('');
        console.error('❌ Failed: Should have thrown an error for empty PDF');
    } catch (error: any) {
        console.log('✅ Passed: Caught expected error:', error.message);
    }

    // 5. Concurrency Test
    console.log('\n🧪 Test 5: Concurrency / Rate Limit Check (5 parallel invalid requests)');
    try {
        const promises = Array(5).fill(null).map((_, i) =>
            extractPortfolioFromImage(`invalid-data-${i}`)
                .then(() => console.error(`❌ Request ${i} should have failed`))
                .catch(e => console.log(`✅ Request ${i} handled: ${e.message.substring(0, 50)}...`))
        );
        await Promise.all(promises);
        console.log('✅ Passed: System handled parallel requests without crashing');
    } catch (error: any) {
        console.error('❌ Failed: Concurrency test crashed logic', error);
    }

    console.log('\n🏁 Chaos Tests Completed');
}

runChaosTests().catch(console.error);
