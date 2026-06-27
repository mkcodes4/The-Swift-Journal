'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ChatMessageContent({ content, role }: { content: string; role: Message['role'] }) {
    if (role === 'user') return <>{content}</>;

    const [answer, sourceBlock] = content.split(/\n\nBased on:\n/);
    const sources = sourceBlock
        ? sourceBlock.split('\n').map(item => item.replace(/^-\s*/, '').trim()).filter(Boolean)
        : [];

    return (
        <div className="space-y-3">
            <p className="whitespace-pre-line">{answer}</p>
            {sources.length > 0 && (
                <div className="border-t border-[#E5E2E0] pt-3">
                    <p className="font-bold italic text-[#8A6F33] mb-2">Based on:</p>
                    <ul className="space-y-1">
                        {sources.map(source => (
                            <li key={source} className="text-[12px] italic text-[#6F675F] leading-snug">
                                {source}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function ChatAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const friendlyError = (() => {
        if (!error?.message) return '';
        try {
            const parsed = JSON.parse(error.message);
            return parsed.error || error.message;
        } catch {
            return error.message;
        }
    })();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-body">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[320px] sm:w-[400px] h-[550px] bg-[#FAF9F6] rounded-md shadow-2xl border border-[#D8D1C8] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 bg-[#F7F4EE] text-[#1F1B18] flex justify-between items-center border-b border-[#E5E2E0]">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-9 w-9 items-center justify-center">
                                    <Bot className="w-6 h-6 text-[#C7A45D]" />
                                </div>
                                <div>
                                    <h3 className="font-headline text-lg italic leading-none">Swiftie-AI</h3>
                                    <p className="text-[9px] text-[#8A8178] uppercase tracking-[0.22em] mt-1 font-bold">Lyrical Archive Guide</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-[#E5E2E0]/60 p-2 rounded-sm transition-colors"
                            >
                                <X className="w-5 h-5 text-[#6F675F]" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6] scroll-smooth"
                        >
                            {messages.length === 0 && (
                                <div className="text-center py-12 px-6">
                                    <div className="w-14 h-14 bg-[#F7F4EE] border border-[#E5E2E0] rounded-sm flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Bot className="w-7 h-7 text-[#C7A45D]" />
                                    </div>
                                    <h4 className="font-headline text-xl text-[#1F1B18] mb-2 italic">&quot;I&apos;m feeling 22... questions?&quot;</h4>
                                    <p className="text-xs text-[#8A8178] leading-relaxed">
                                        Ask me about the metaphors in &quot;I Knew It, I Knew You&quot;, the transition from Folklore to Evermore, or the sentiment trends across eras!
                                    </p>
                                </div>
                            )}

                            {messages.map((m: Message) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-[#1F1B18] text-[#FAF9F6] rounded-br-sm'
                                        : 'bg-white/70 text-[#1F1B18] border border-[#E5E2E0] rounded-bl-sm prose-sm'
                                        }`}>
                                        <ChatMessageContent content={m.content} role={m.role} />
                                    </div>
                                </div>
                            ))}

                            {error && (
                                <div className="flex justify-center p-2">
                                    <div className="bg-[#FFF7F4] text-[#A52A2A] text-[11px] px-3 py-1 rounded-sm border border-[#F0D0C8]">
                                        Connection Error: {friendlyError}
                                    </div>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/70 border border-[#E5E2E0] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                        <div className="flex space-x-1.5">
                                            <div className="w-1.5 h-1.5 bg-[#C7A45D] rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-[#C7A45D] rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-[#C7A45D] rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Form */}
                        <div className="p-4 bg-[#F7F4EE] border-t border-[#E5E2E0]">
                            <form
                                onSubmit={handleSubmit}
                                className="relative group transition-all"
                            >
                                <input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask your Swiftie guide..."
                                    className="w-full pl-5 pr-12 py-3 bg-[#FAF9F6] border border-[#D8D1C8] rounded-sm text-sm text-[#1F1B18] placeholder:text-[#8A8178] focus:outline-none focus:border-[#C7A45D] focus:bg-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#1F1B18] text-[#C7A45D] rounded-sm disabled:opacity-40 hover:bg-[#2D2824] transition-all active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-[10px] text-center text-gray-400 mt-3 italic">
                                Analyzing the lyrics. Connecting the dots. 💎
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-[#F7F4EE] border border-[#D8D1C8] rounded-md shadow-xl shadow-[#1F1B18]/15 flex items-center justify-center text-[#1F1B18] relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(199,164,93,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.8),rgba(229,226,224,0.42))]" />
                <div className="absolute inset-2 rounded-sm border border-[#1F1B18]/10 transition-all duration-300 group-hover:inset-1.5 group-hover:border-[#1F1B18]/25" />
                {isOpen ? (
                    <Minimize2 className="w-7 h-7 z-10 animate-in spin-in-90 duration-300 text-[#1F1B18]" />
                ) : (
                    <div className="relative z-10 flex flex-col items-center">
                        <Bot className="w-7 h-7 text-[#1F1B18]" />
                        <div className="mt-0.5 h-0.5 w-1 rounded-full bg-[#1F1B18] animate-pulse" />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
