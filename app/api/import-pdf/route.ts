import { NextRequest, NextResponse } from 'next/server';
import { extractPortfolioFromPDF } from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'File must be a PDF' },
                { status: 400 }
            );
        }

        // Convert PDF to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;

        console.log(`📄 Processing PDF: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

        // Extract data from PDF
        const extractedData = await extractPortfolioFromPDF(dataUrl);

        console.log('✅ PDF processed successfully');

        return NextResponse.json({
            success: true,
            data: extractedData
        });

    } catch (error: any) {
        console.error('❌ Error processing PDF:', error);
        return NextResponse.json(
            {
                error: 'Failed to process PDF',
                message: error.message
            },
            { status: 500 }
        );
    }
}
