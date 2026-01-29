import { extractPortfolioFromPDF } from './lib/pdf-processor';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testMonthlyExtraction() {
    try {
        // Read PDF file - testing 2024
        const pdfPath = '/Users/depa/Library/CloudStorage/GoogleDrive-wiwat@mrws.ac.th/My Drive/0. วิวัฒน์/00 กบข/TransactionUnitDetail_13617451_2024.pdf';
        const pdfData = fs.readFileSync(pdfPath);
        const base64Data = pdfData.toString('base64');

        console.log('🤖 Extracting monthly data from PDF 2024...\n');

        const result = await extractPortfolioFromPDF(base64Data);

        console.log('✅ Extraction successful!\n');
        console.log('📅 Year:', result.portfolioSnapshot.year);
        console.log('📊 Months found:', result.portfolioSnapshot.monthlySnapshots.length);
        console.log('\n📋 Monthly data:\n');

        result.portfolioSnapshot.monthlySnapshots.forEach((snapshot, index) => {
            console.log(`\n--- เดือนที่ ${snapshot.month} (${snapshot.date}) ---`);
            console.log(`จำนวนกองทุน: ${snapshot.funds.length}`);

            let totalValue = 0;
            snapshot.funds.forEach(fund => {
                console.log(`  • ${fund.name}:`);
                console.log(`    NAV: ฿${fund.navPerUnit.toFixed(4)}`);
                console.log(`    หน่วย: ${fund.units.toFixed(4)}`);
                console.log(`    มูลค่า: ฿${fund.value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`);
                totalValue += fund.value;
            });

            console.log(`  📈 รวม: ฿${totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`);
        });

        console.log('\n✅ Done!\n');

    } catch (error: any) {
        console.error('❌ Error:', error);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
    }
}

testMonthlyExtraction();
