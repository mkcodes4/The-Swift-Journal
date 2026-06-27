import fs from 'fs';
import path from 'path';

export const maxDuration = 30;

const analysisPath = path.join(process.cwd(), 'data', 'taylor_swift_roberta_analysis_v3.json');
const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
const DEFAULT_BLOCKED_TERMS = [
    'fuck',
    'shit',
    'bitch',
    'asshole',
    'bastard',
    'dick',
    'piss',
    'crap',
];
const CLEANUP_REPLIES = [
    'Really, dude? Keep it clean and I will happily talk lyrics.',
    'Really, dude? The archive has standards. Try that again without the cheap language.',
    'Really, dude? I can do sharp analysis, not sewer dialogue.',
    'Really, dude? Rephrase it cleanly and we are back in business.',
];

// --- Rate Limiting ---
const RATE_LIMIT_MAX = 10;         // max requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitIp(req: Request): string {
    // Vercel forwards the real IP in x-forwarded-for
    const forwarded = req.headers.get('x-forwarded-for');
    return (forwarded ? forwarded.split(',')[0] : 'unknown').trim();
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    if (entry.count >= RATE_LIMIT_MAX) return true;

    entry.count++;
    return false;
}

// Periodic cleanup to prevent memory leaks in long-running instances
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
}, 5 * 60_000);

// --- Input Limits ---
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

type LyricSong = {
    title: string;
    album: string;
    lyrics: string;
};

type LyricSource = {
    title: string;
    album: string;
};

type LyricSearchResult = {
    context: string;
    sources: LyricSource[];
};

let songData: LyricSong[] = [];
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
- Do not use profanity, slurs, insults, or hateful language.
- Keep responses short (2-4 sentences).
- If context is provided, use it for accuracy. If not, just chat naturally. 
- Avoid academic words like "juxtaposition" or "thematic".`;

function streamText(text: string): Response {
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
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBlockedTerms(): string[] {
    const encoded = process.env.BLOCKED_TERMS_BASE64 || '';
    if (!encoded) return DEFAULT_BLOCKED_TERMS;

    try {
        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        const customTerms = decoded.trim().startsWith('[')
            ? JSON.parse(decoded)
            : decoded.split(/[\n,]/);

        if (!Array.isArray(customTerms)) return DEFAULT_BLOCKED_TERMS;

        return [
            ...DEFAULT_BLOCKED_TERMS,
            ...customTerms
                .map(term => String(term).trim().toLowerCase())
                .filter(Boolean),
        ];
    } catch (error) {
        console.error('Failed to parse blocked terms:', error);
        return DEFAULT_BLOCKED_TERMS;
    }
}

function hasBlockedLanguage(text: string): boolean {
    const normalized = text.toLowerCase();
    return getBlockedTerms().some(term => {
        const escaped = escapeRegex(term);
        return new RegExp(`(^|\\W)${escaped}(?=\\W|$)`, 'i').test(normalized);
    });
}

function getCleanupReply(text: string): string {
    let hash = 0;
    for (const char of text) hash = (hash + char.charCodeAt(0)) % CLEANUP_REPLIES.length;
    return CLEANUP_REPLIES[hash];
}

function findRelevantLyrics(query: string): LyricSearchResult {
    const lowerQuery = query.toLowerCase();

    // Ignore search for simple greetings
    const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'morning', 'afternoon', 'evening'];
    if (greetings.includes(lowerQuery.trim().replace(/[!?.]/g, ''))) return { context: '', sources: [] };

    const stopWords = new Set(['what', 'song', 'talks', 'about', 'this', 'that', 'with', 'your', 'from', 'tell', 'the', 'is', 'it']);
    const keywords = lowerQuery
        .split(/\W+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    if (keywords.length === 0) return { context: '', sources: [] };

    const ranked = songData.map(song => {
        const text = `${song.title} ${song.album} ${song.lyrics}`.toLowerCase();
        const matchCount = keywords.reduce((count, k) => text.includes(k) ? count + 1 : count, 0);
        return { ...song, matchCount };
    })
        .filter(s => s.matchCount >= 1) // At least one keyword match
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 3);

    // If matchCount is low (only common words), don't force context
    if (ranked.length === 0 || (ranked[0].matchCount === 1 && keywords.length > 2)) {
        return { context: '', sources: [] };
    }

    const context = "FACTUAL LYRICS DATA:\n" + ranked.map(m =>
        `- Song: ${m.title} (Album: ${m.album})\n  Lyrics: ${m.lyrics.substring(0, 300)}...`
    ).join('\n');

    const sources = ranked.map(({ title, album }) => ({ title, album }));
    return { context, sources };
}

function appendSources(text: string, sources: LyricSource[]): string {
    if (sources.length === 0) return text;

    const uniqueSources = sources.filter((source, index, list) =>
        list.findIndex(item => item.title === source.title && item.album === source.album) === index
    );

    const sourceList = uniqueSources
        .map(source => `- ${source.title} - ${source.album}`)
        .join('\n');

    return `${text}\n\nBased on:\n${sourceList}`;
}

export async function POST(req: Request) {
    try {
        // --- Rate Limit Check ---
        const ip = getRateLimitIp(req);
        if (isRateLimited(ip)) {
            return Response.json(
                { error: 'Too many requests. Please wait a moment before sending another message.' },
                { status: 429 }
            );
        }

        // --- Parse & Validate Input ---
        let body: { messages?: unknown };
        try {
            body = await req.json();
        } catch {
            return Response.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
        }

        const { messages } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: 'messages must be a non-empty array.' }, { status: 400 });
        }

        if (messages.length > MAX_MESSAGES) {
            return Response.json(
                { error: `Too many messages in context. Maximum allowed is ${MAX_MESSAGES}.` },
                { status: 400 }
            );
        }

        for (const msg of messages) {
            if (typeof msg?.content !== 'string') {
                return Response.json({ error: 'Each message must have a string content field.' }, { status: 400 });
            }
            if (msg.content.length > MAX_MESSAGE_LENGTH) {
                return Response.json(
                    { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters per message.` },
                    { status: 400 }
                );
            }
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

        if (!apiKey) {
            return Response.json(
                { error: 'The Gemini API key is missing. Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the app.' },
                { status: 500 }
            );
        }

        const lastUserMessage = (messages[messages.length - 1] as { role: string; content: string }).content;

        if (hasBlockedLanguage(lastUserMessage)) {
            return streamText(getCleanupReply(lastUserMessage));
        }

        const lyricSearch = findRelevantLyrics(lastUserMessage);

        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
            { role: 'model', parts: [{ text: "I am ready to provide simple and accurate Taylor Swift analysis." }] },
            ...(lyricSearch.context ? [{ role: 'user', parts: [{ text: lyricSearch.context }] }] : []),
            ...messages.map((m: { role: string, content: string }) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
        ];

        let response: Response | null = null;
        let lastErrorBody = '';
        let modelUsed = GEMINI_MODELS[0];

        for (const model of GEMINI_MODELS) {
            modelUsed = model;
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents }),
                }
            );

            if (response.ok) break;

            lastErrorBody = await response.text();
            console.error('Gemini API Error:', model, response.status, lastErrorBody);

            const shouldTryFallback = response.status === 429 || response.status >= 500;
            if (!shouldTryFallback) break;
        }

        if (!response || !response.ok) {
            const status = response?.status || 500;

            let message = `The AI service is not responding right now. Status: ${status}.`;

            if (status === 400) {
                message = 'The AI request was rejected. This is often caused by an unsupported model name or request format.';
            } else if (status === 401 || status === 403) {
                message = 'The Gemini API key is invalid, missing access, or not enabled for this project.';
            } else if (status === 429) {
                message = 'The Gemini API quota is exhausted or rate-limited. Wait a bit, switch keys, or enable more quota.';
            } else if (status >= 500) {
                message = `Gemini is having a server-side issue right now. Status: ${status}. The app tried ${GEMINI_MODELS.length} models.`;
            }

            return Response.json({ error: message, providerStatus: status, model: modelUsed, details: lastErrorBody.slice(0, 500) }, { status });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'I could not find an answer.';
        const cleanText = hasBlockedLanguage(text)
            ? 'I can answer that cleanly, but I am skipping the rough wording. Ask me again and I will keep it classy.'
            : text;

        return streamText(appendSources(cleanText, lyricSearch.sources));

    } catch (error) {
        console.error('API Error:', error);
        return Response.json(
            { error: 'Something broke while preparing the chat reply. Check the terminal for the detailed error.' },
            { status: 500 }
        );
    }
}
