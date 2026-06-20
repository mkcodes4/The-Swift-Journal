'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[320px] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Sparkles className="w-5 h-5 text-yellow-200" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Swiftie-AI Agent</h3>
                                    <p className="text-[10px] text-purple-100">AI Lyrical Expert</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-white scroll-smooth"
                        >
                            {messages.length === 0 && (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Bot className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <h4 className="font-bold text-purple-900 mb-2 italic">"I'm feeling 22... questions?"</h4>
                                    <p className="text-xs text-purple-600/70 leading-relaxed">
                                        Ask me about the metaphors in "I Knew It, I Knew You", the transition from Folklore to Evermore, or the sentiment trends across eras!
                                    </p>
                                </div>
                            )}

                            {messages.map((m: Message) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-none'
                                        : 'bg-white text-gray-700 border border-purple-50 rounded-bl-none prose-sm'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {error && (
                                <div className="flex justify-center p-2">
                                    <div className="bg-red-50 text-red-600 text-[11px] px-3 py-1 rounded-full border border-red-100">
                                        Connection Error: {error.message}
                                    </div>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-purple-50 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex space-x-1.5">
                                            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Form */}
                        <div className="p-4 bg-white border-t border-purple-100">
                            <form
                                onSubmit={handleSubmit}
                                className="relative group transition-all"
                            >
                                <input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask your Swiftie guide..."
                                    className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-purple-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-95"
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
                className="w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center text-white relative group overflow-hidden"
            >
                {/* Particle effects on hover */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition duration-500"></div>
                {isOpen ? (
                    <Minimize2 className="w-7 h-7 z-10 animate-in spin-in-90 duration-300" />
                ) : (
                    <div className="relative z-10 flex flex-col items-center">
                        <Bot className="w-7 h-7" />
                        <div className="h-0.5 w-1 bg-white rounded-full mt-0.5 animate-pulse" />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
