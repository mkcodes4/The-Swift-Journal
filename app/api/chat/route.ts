import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;

const analysisPath = path.join(process.cwd(), 'data', 'taylor_swift_roberta_analysis.json');
let songData: any[] = [];
try {
    const fileContent = fs.readFileSync(analysisPath, 'utf-8');
    songData = JSON.parse(fileContent);
} catch (e) {
    console.error('Failed to load song data:', e);
}

const SYSTEM_INSTRUCTION = `You are "Swiftie-AI", a lyrics expert for The Swift Journal.
Style Guidelines:
- Use simple, clear, and proper English.
- NO markdown formatting (no bolding, no asterisks **).
- Keep responses short (2-4 sentences).
- If context is provided, use it for accuracy. If not, just chat naturally. 
- Avoid academic words like "juxtaposition" or "thematic".`;

function findRelevantLyrics(query: string): string {
    const lowerQuery = query.toLowerCase();

    // Ignore search for simple greetings
    const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'morning', 'afternoon', 'evening'];
    if (greetings.includes(lowerQuery.trim().replace(/[!?.]/g, ''))) return '';

    const stopWords = new Set(['what', 'song', 'talks', 'about', 'this', 'that', 'with', 'your', 'from', 'tell', 'the', 'is', 'it']);
    const keywords = lowerQuery
        .split(/\W+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    if (keywords.length === 0) return '';

    const ranked = songData.map(song => {
        const text = `${song.title} ${song.album} ${song.lyrics}`.toLowerCase();
        const matchCount = keywords.reduce((count, k) => text.includes(k) ? count + 1 : count, 0);
        return { ...song, matchCount };
    })
        .filter(s => s.matchCount >= 1) // At least one keyword match
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 3);

    // If matchCount is low (only common words), don't force context
    if (ranked.length === 0 || (ranked[0].matchCount === 1 && keywords.length > 2)) return '';

    return "FACTUAL LYRICS DATA:\n" + ranked.map(m =>
        `- Song: ${m.title} (Album: ${m.album})\n  Lyrics: ${m.lyrics.substring(0, 300)}...`
    ).join('\n');
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

        const lastUserMessage = messages[messages.length - 1].content;
        const lyricsContext = findRelevantLyrics(lastUserMessage);

        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
            { role: 'model', parts: [{ text: "I am ready to provide simple and accurate Taylor Swift analysis." }] },
            ...(lyricsContext ? [{ role: 'user', parts: [{ text: lyricsContext }] }] : []),
            ...messages.map((m: { role: string, content: string }) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
        ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', response.status, errorBody);
            throw new Error(`Gemini API Error`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'I could not find an answer.';

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(text)}\n`));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'x-vercel-ai-data-stream': 'v1',
            },
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
