import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Path to your JSON file - adjust based on where you placed it
    const filePath = join(process.cwd(), 'data', 'taylor_swift_roberta_analysis_v3.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const songsData = JSON.parse(fileContents);

    return NextResponse.json(songsData);
  } catch (error) {
    console.error('Error reading songs data:', error);

    // Return empty array if file not found
    return NextResponse.json([], { status: 200 });
  }
}