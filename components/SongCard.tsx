'use client';

import { useState } from 'react';
import { Music, Heart, Star, Sparkles, Quote, Search, Activity, TrendingUp } from 'lucide-react';
import Confetti from './Confetti';
import { getEraColor, getSentimentColor } from '@/lib/utils';

interface SongCardProps {
  song: {
    title: string;
    album: string;
    year: number;
    lyrics: string;
    roberta_label: 'positive' | 'negative' | 'neutral';
    roberta_confidence: number;
    roberta_compound: number;
    word_count: number;
    [key: string]: any;
  };
  keyword?: string;
  count?: number;
}

export default function SongCard({ song, keyword, count, onOpenExhibit }: SongCardProps & { onOpenExhibit?: (song: any) => void }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const eraColors = getEraColor(song.album);

  const handleClick = () => {
    if (song.roberta_label === 'positive' && song.roberta_confidence > 0.8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    if (onOpenExhibit) {
      onOpenExhibit(song);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Star className="w-4 h-4 text-green-600" />;
      case 'negative': return <Heart className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Music className="w-4 h-4 text-blue-600" />;
      default: return <Music className="w-4 h-4 text-gray-600" />;
    }
  };

  // Function to find and highlight keyword lines
  const getKeywordLines = () => {
    if (!keyword) return null;

    const keywords = keyword.split(',').map(k => k.trim().toLowerCase());
    const lines = song.lyrics.split('\n');
    const keywordLines: string[] = [];

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      // Check if any of the keywords appear in this line
      const hasKeyword = keywords.some(kw => lowerLine.includes(kw));
      if (hasKeyword && line.trim().length > 0) {
        keywordLines.push(line);
      }
    });

    return keywordLines.slice(0, 2); // Return first 2 matching lines for a cleaner card
  };

  // Function to highlight keywords in text
  const highlightKeywords = (text: string) => {
    if (!keyword) return text;

    const keywords = keyword.split(',').map(k => k.trim());
    let highlightedText = text;

    keywords.forEach(kw => {
      if (kw) {
        const regex = new RegExp(`(${kw})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200/60 text-gray-900 px-1 rounded font-semibold">$1</mark>');
      }
    });

    return highlightedText;
  };

  const keywordLines = getKeywordLines();
  const hasKeywordMatches = keywordLines && keywordLines.length > 0;

  return (
    <>
      {showConfetti && <Confetti />}

      <div
        className={`museum-card p-6 rounded-2xl bg-white/80 backdrop-blur-md border ${eraColors.border} cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500`}
        onClick={handleClick}
      >
        {/* Era background tint */}
        <div className={`absolute inset-0 ${eraColors.bg} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}></div>

        {/* Top bar */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className={`era-badge ${eraColors.bg} ${eraColors.text} mb-2 inline-block`}>Exhibit No. {song.year}</span>
              <h3 className="font-bodoni font-bold text-xl text-on-surface group-hover:text-primary transition-colors leading-tight">
                {song.title}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1 tracking-tight">
                {song.album}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getSentimentIcon(song.roberta_label)}
              <div className="text-[10px] font-bold text-on-surface-variant/40 tracking-widest">{((song.roberta_confidence || 0) * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Keyword Match Preview */}
          {hasKeywordMatches && (
            <div className="mt-4 mb-4 space-y-2">
              {keywordLines.map((line, index) => (
                <p
                  key={index}
                  className="text-xs text-on-surface-variant italic leading-relaxed line-clamp-2 border-l-2 border-primary/20 pl-3"
                  dangerouslySetInnerHTML={{ __html: highlightKeywords(line) }}
                />
              ))}
            </div>
          )}

          {/* Collection Status */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                Data Point {song.word_count}
              </span>
            </div>
            <div className="group-hover:translate-x-1 transition-transform">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
