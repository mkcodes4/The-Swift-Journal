'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Quote, Activity, Zap, Star, Heart, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { getEraColor, getSentimentColor, Song } from '@/lib/utils';
import { useEffect } from 'react';

interface ExhibitModalProps {
    song: Song | null;
    isOpen: boolean;
    onClose: () => void;
    keyword?: string;
}

export default function ExhibitModal({ song, isOpen, onClose, keyword }: ExhibitModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!song) return null;

    const eraColors = getEraColor(song.album);
    const sentiments = getSentimentColor(song.roberta_label);

    // Prepare data for the Radar Chart
    // Note: We use some fallback or randomized values for visual richness if direct emotional keys aren't in the dataset
    // In a real scenario, this would come from the fusion_analysis_engine data
    // Prepare data for the Radar Chart using real V3 emotions if available
    const emotionalData = song.emotions ? [
        { subject: 'Joy', A: (song.emotions.joy || 0) * 100, fullMark: 100 },
        { subject: 'Sadness', A: (song.emotions.sadness || 0) * 100, fullMark: 100 },
        { subject: 'Anger', A: (song.emotions.anger || 0) * 100, fullMark: 100 },
        { subject: 'Fear', A: (song.emotions.fear || 0) * 100, fullMark: 100 },
        { subject: 'Surprise', A: (song.emotions.surprise || 0) * 100, fullMark: 100 },
    ] : [
        { subject: 'Joy', A: (song.roberta_label === 'positive' ? song.roberta_confidence * 100 : 20), fullMark: 100 },
        { subject: 'Sadness', A: (song.roberta_label === 'negative' ? song.roberta_confidence * 100 : 10), fullMark: 100 },
        { subject: 'Anger', A: (song.roberta_compound < -0.5 ? 60 : 15), fullMark: 100 },
        { subject: 'Fear', A: (song.textblob_subjectivity > 0.7 ? 50 : 20), fullMark: 100 },
        { subject: 'Surprise', A: (song.word_count > 500 ? 70 : 30), fullMark: 100 },
    ];

    // Function to highlight keywords in lyrics
    const highlightLyrics = (text: string) => {
        if (!keyword) return text;
        const keywords = keyword.split(',').map(k => k.trim());
        let highlightedText = text;
        keywords.forEach(kw => {
            if (kw) {
                const regex = new RegExp(`(${kw})`, 'gi');
                highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200/40 text-on-surface px-1 rounded font-bold underline decoration-yellow-500 underline-offset-4">$1</mark>');
            }
        });
        return highlightedText;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className={`relative w-full max-w-6xl h-[90vh] bg-surface rounded-sm overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col md:flex-row deckled-edge paper-grain`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 z-20 p-2 bg-on-surface/5 hover:bg-on-surface/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-on-surface" />
                        </button>

                        {/* Left Column: Visuals & Stats */}
                        <div className={`w-full md:w-2/5 p-12 flex flex-col border-r border-outline-variant/20 bg-surface-container-low`}>
                            <div className="mb-10 text-center md:text-left">
                                <span className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-outline mb-3 block">Archival Entry — {song.year}</span>
                                <h2 className="font-headline text-5xl italic mb-2">{song.title}</h2>
                                <p className="text-on-surface-variant font-body tracking-[0.1em] uppercase text-xs font-bold">{song.album}</p>
                            </div>

                            {/* Radar Chart */}
                            <div className="flex-grow flex flex-col justify-center items-center">
                                <div className="w-full h-[350px] mb-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={emotionalData}>
                                            <PolarGrid stroke="#e5e2e0" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#787770', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
                                            />
                                            <Radar
                                                name="Emotional DNA"
                                                dataKey="A"
                                                stroke="#5f5e5b"
                                                fill="#5f5e5b"
                                                fillOpacity={0.15}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-6 w-full">
                                    <div className="bg-white/50 border border-outline-variant/30 p-6 rounded-sm text-center">
                                        <Activity className="w-5 h-5 text-primary mx-auto mb-3 opacity-50" />
                                        <span className="block text-[10px] font-body uppercase font-bold text-outline tracking-wider mb-2">Sentiment</span>
                                        <span className="font-headline text-2xl italic text-on-surface">
                                            {song.roberta_compound > 0 ? '+' : ''}{song.roberta_compound.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="bg-white/50 border border-outline-variant/30 p-6 rounded-sm text-center">
                                        <Zap className="w-5 h-5 text-primary mx-auto mb-3 opacity-50" />
                                        <span className="block text-[10px] font-body uppercase font-bold text-outline tracking-wider mb-2">Lexicon</span>
                                        <span className="font-headline text-2xl italic text-on-surface">
                                            {song.word_count} <span className="text-xs uppercase NOT-italic">words</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Museum Footnote */}
                            <div className="mt-12 pt-8 border-t border-outline-variant/30 text-[10px] text-outline font-body uppercase tracking-[0.25em] leading-relaxed opacity-60">
                                Archives of The Swift Journal <br />
                                Reference: TS-{song.title.slice(0, 3).toUpperCase()}-{song.year} <br />
                                Certified Museum Artifact
                            </div>
                        </div>

                        {/* Right Column: Lyrics */}
                        <div className="w-full md:w-3/5 p-16 overflow-y-auto bg-surface-container-lowest relative">
                            <div className="flex items-center gap-4 mb-12 border-b border-outline-variant/20 pb-8">
                                <Quote className="w-10 h-10 text-primary/20" />
                                <h3 className="font-headline text-3xl italic">Lyrical Analysis</h3>
                            </div>

                            <div className="lyrics-content prose prose-stone max-w-none">
                                <p
                                    className="whitespace-pre-line font-body text-xl leading-[2.2] text-on-surface/90"
                                    dangerouslySetInnerHTML={{ __html: highlightLyrics(song.lyrics) }}
                                />
                            </div>

                            {/* Scroll Indicator */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30 animate-bounce">
                                <div className="w-[1px] h-12 bg-primary"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
