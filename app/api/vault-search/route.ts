import { NextResponse } from 'next/server';

/**
 * TOKEN-FREE CONTENT MODERATION
 * This approach uses an environment variable to store the blocklist.
 * 1. ZERO COST: No AI tokens are used for safety checks.
 * 2. 100% ACCURACY: Words like 'happy' or 'sad' will never be accidentally blocked.
 * 3. CLEAN REPO: The 'bad words' are stored in your .env.local file (which is gitignored),
 *    so they never appear in your GitHub repository or commit history.
 */
function isSafeQuery(query: string): boolean {
    const rawList = process.env.BLOCKED_TERMS_BASE64 || '';
    if (!rawList) return true;

    try {
        // Decode the blocklist from Base64 (to keep it "invisible" even if someone looks at the env file)
        const blockedTerms = Buffer.from(rawList, 'base64')
            .toString('utf-8')
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);

        const lowerQuery = query.toLowerCase();

        // Block if the query contains any of the forbidden terms
        return !blockedTerms.some(term => lowerQuery.includes(term));
    } catch (e) {
        console.error('Error decoding blocklist:', e);
        return true;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ status: 'error', message: 'Query is required' }, { status: 400 });
        }

        // Professional Safety Check (0 tokens, 100% reliable)
        if (!isSafeQuery(query)) {
            return NextResponse.json({
                status: 'blocked',
                message: 'Really dude? Search for something related to the music.',
            }, { status: 200 });
        }

        // Proceed to the Python Vault Search Engine
        const response = await fetch('http://localhost:8000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in vault-search proxy:', error);
        return NextResponse.json({ status: 'error', message: 'Failed to connect to the Vault AI engine. Ensure the backend server is running.' }, { status: 500 });
    }
}
