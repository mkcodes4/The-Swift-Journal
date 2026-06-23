import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'data', 'taylor_swift_roberta_summary_v3.json');
        const fileContents = readFileSync(filePath, 'utf8');
        const summaryData = JSON.parse(fileContents);
        return NextResponse.json(summaryData);
    } catch (error) {
        console.error('Error reading sentiment summary data:', error);
        return NextResponse.json({}, { status: 200 });
    }
}
