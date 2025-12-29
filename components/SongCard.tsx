'use client';

import { useState } from 'react';
import { Music, Heart, Star, Sparkles, Quote, Search } from 'lucide-react';
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

export default function SongCard({ song, keyword, count }: SongCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const eraColors = getEraColor(song.album);

  const handleCelebration = () => {
    if (song.roberta_label === 'positive' && song.roberta_confidence > 0.8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setIsExpanded(!isExpanded);
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

    return keywordLines.slice(0, 3); // Return first 3 matching lines
  };

  // Function to highlight keywords in text
  const highlightKeywords = (text: string) => {
    if (!keyword) return text;

    const keywords = keyword.split(',').map(k => k.trim());
    let highlightedText = text;

    keywords.forEach(kw => {
      if (kw) {
        const regex = new RegExp(`(${kw})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-1 rounded font-semibold">$1</mark>');
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
        className={`lyric-card ${eraColors.border} cursor-pointer group relative overflow-hidden`}
        onClick={handleCelebration}
      >
        {/* Era background tint */}
        <div className={`absolute inset-0 ${eraColors.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

        {/* Sparkle effect for positive high-confidence songs */}
        {song.roberta_label === 'positive' && song.roberta_confidence > 0.7 && (
          <Sparkles className="absolute top-3 right-3 w-4 h-4 text-yellow-500 animate-pulse" />
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors">
                {song.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {song.album} • {song.year}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {getSentimentIcon(song.roberta_label)}
            </div>
          </div>

          {/* Sentiment Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${getSentimentColor(song.roberta_label)}`}>
            <span className="capitalize">{song.roberta_label}</span>
            <span className="text-xs opacity-75">
              {(song.roberta_confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Keyword Highlight */}
          {keyword && count && count > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-flex items-center gap-2">
              <Search className="w-3 h-3" />
              "{keyword}" × {count}
            </div>
          )}

          {/* Keyword Match Preview (always show if there are matches) */}
          {hasKeywordMatches && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-3 h-3 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-700">Keyword Matches:</span>
              </div>
              <div className="space-y-1">
                {keywordLines.map((line, index) => (
                  <p 
                    key={index}
                    className="text-xs text-gray-700 italic leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightKeywords(line) }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Expanded Lyrics */}
          {isExpanded && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-purple-600">Lyrics Preview</span>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <p 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightKeywords(song.lyrics.slice(0, 300) + (song.lyrics.length > 300 ? '...' : ''))
                  }}
                />
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>Words: {song.word_count}</span>
                <span>Sentiment: {song.roberta_compound > 0 ? '+' : ''}{song.roberta_compound.toFixed(3)}</span>
              </div>
            </div>
          )}

          {/* Show hint if expanded but no keyword matches found */}
          {isExpanded && keyword && !hasKeywordMatches && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 text-center">
              💡 Keyword found in other parts of the lyrics
            </div>
          )}

          {/* Hover effect */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-300/50 rounded-xl transition-all duration-300 pointer-events-none"></div>
        </div>
      </div>
    </>
  );
}