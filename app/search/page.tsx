'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Music, Sparkles, Filter, X, TrendingUp, Zap, Target, Heart, Star, Plus } from 'lucide-react';
import SongCard from '@/components/SongCard';
import Confetti from '@/components/Confetti';

interface Song {
  title: string;
  album: string;
  year: number;
  lyrics: string;
  word_count: number;
  roberta_label: 'positive' | 'negative' | 'neutral';
  roberta_confidence: number;
  roberta_compound: number;
  textblob_polarity: number;
  textblob_subjectivity: number;
  [key: string]: any;
}

// Enhanced Taylor Swift keywords organized by theme
const KEYWORD_CATEGORIES = {
  '💖 Love & Heart': ['love', 'heart', 'baby', 'darling', 'sweet', 'kiss', 'lover', 'romance'],
  '🌙 Time & Night': ['midnight', 'night', 'dark', 'moon', 'time', 'forever', 'never', 'always', 'memory'],
  '🎭 Emotions': ['tears', 'smile', 'happy', 'sad', 'cry', 'pain', 'hurt', 'hope', 'dream', 'fear'],
  '🌈 Colors': ['red', 'blue', 'golden', 'white', 'black', 'paint', 'gray', 'pink', 'purple'],
  '🌧️ Weather': ['rain', 'storm', 'snow', 'winter', 'summer', 'wind', 'fire', 'lightning'],
  '📍 Places': ['home', 'city', 'street', 'road', 'new york', 'london', 'paris', 'california'],
  '👑 Taylor Themes': ['prince', 'princess', 'castle', 'fairytale', 'ghost', 'angel', 'devil', 'story'],
  '💔 Relationships': ['break', 'leave', 'stay', 'wait', 'promise', 'friend', 'enemy', 'together']
};

const ALL_KEYWORDS = Object.values(KEYWORD_CATEGORIES).flat();

// Helper function to count word occurrences in lyrics
const countWordOccurrences = (lyrics: string, word: string): number => {
  if (!lyrics || !word) return 0;
  
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  const matches = lyrics.match(regex);
  return matches ? matches.length : 0;
};

// Helper function to find related words (basic stemming)
const findRelatedWords = (word: string): string[] => {
  const related: string[] = [word];
  
  // Basic pluralization
  if (word.endsWith('s')) {
    related.push(word.slice(0, -1)); // Remove 's' for singular
  } else {
    related.push(word + 's'); // Add 's' for plural
  }
  
  // Common word variations
  const variations: { [key: string]: string[] } = {
    'friend': ['friends', 'friendship', 'friendly'],
    'love': ['loves', 'loved', 'loving', 'lover'],
    'heart': ['hearts', 'hearted'],
    'time': ['times', 'timing'],
    'night': ['nights', 'nighttime'],
    'day': ['days', 'daytime'],
    'dream': ['dreams', 'dreaming', 'dreamer'],
    'cry': ['cries', 'crying', 'cried'],
    'smile': ['smiles', 'smiling', 'smiled'],
    'tear': ['tears', 'tearing'],
    'rain': ['rains', 'raining', 'rainy'],
    'storm': ['storms', 'stormy'],
    'snow': ['snows', 'snowing', 'snowy'],
    'break': ['breaks', 'breaking', 'broken'],
    'leave': ['leaves', 'leaving', 'left'],
    'stay': ['stays', 'staying', 'stayed'],
    'wait': ['waits', 'waiting', 'waited']
  };
  
  if (variations[word]) {
    related.push(...variations[word]);
  }
  
  return [...new Set(related)]; // Remove duplicates
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredKeyword, setHoveredKeyword] = useState('');

  // Load songs data
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const response = await fetch('/api/songs');
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('Error loading songs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    if (!searchTerm && selectedKeywords.length === 0) return songs;
    
    const term = searchTerm.toLowerCase().trim();
    
    return songs.filter(song => {
      const inLyrics = term ? song.lyrics.toLowerCase().includes(term) : false;
      const inTitle = term ? song.title.toLowerCase().includes(term) : false;
      
      // Check if song contains ALL selected keywords (using keyword counts from model OR lyrics search)
      const hasAllKeywords = selectedKeywords.length > 0 
        ? selectedKeywords.every(keyword => {
            // First check if the keyword exists in the model data
            if (song[keyword] > 0) return true;
            
            // If not in model data, search in lyrics
            return countWordOccurrences(song.lyrics.toLowerCase(), keyword) > 0;
          })
        : true;
      
      return (inLyrics || inTitle || selectedKeywords.length > 0) && hasAllKeywords;
    });
  }, [searchTerm, selectedKeywords, songs]);

  // Enhanced keyword suggestions that include related words
  const enhancedPopularKeywords = useMemo(() => {
    const baseKeywords = ALL_KEYWORDS.slice(0, 12);
    const enhanced: string[] = [];
    
    baseKeywords.forEach(keyword => {
      enhanced.push(keyword);
      // Add a few related words for better discovery
      const related = findRelatedWords(keyword).slice(0, 2); // Limit to 2 related words
      enhanced.push(...related);
    });
    
    return [...new Set(enhanced)].slice(0, 20); // Remove duplicates and limit
  }, []);

  const handleKeywordSelect = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      // Remove if already selected
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      // Add to selected keywords
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
    
    if (keyword === 'love' || keyword === 'happy') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleSearchAdd = () => {
    if (searchTerm.trim() && !selectedKeywords.includes(searchTerm.trim().toLowerCase())) {
      setSelectedKeywords([...selectedKeywords, searchTerm.trim().toLowerCase()]);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchAdd();
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keywordToRemove));
  };

  const clearAllKeywords = () => {
    setSelectedKeywords([]);
  };

  // Calculate total occurrences for display
  const getTotalOccurrences = (song: Song, keywords: string[]): number => {
    return keywords.reduce((total, keyword) => {
      // Use model data if available, otherwise count in lyrics
      const modelCount = song[keyword] || 0;
      const lyricsCount = countWordOccurrences(song.lyrics.toLowerCase(), keyword);
      return total + Math.max(modelCount, lyricsCount);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/2 mx-auto mb-12"></div>
            <div className="h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-8 shadow-inner"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-inner animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {showConfetti && <Confetti />}
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-4 h-4 bg-pink-300 rounded-full opacity-60 animate-bounce"></div>
      <div className="fixed top-40 right-20 w-6 h-6 bg-purple-300 rounded-full opacity-40 animate-pulse"></div>
      <div className="fixed bottom-32 left-20 w-3 h-3 bg-blue-300 rounded-full opacity-70 animate-bounce delay-300"></div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header with sparkle effect */}
        <div className="text-center mb-12 relative">
          <div className="absolute -top-4 -left-4 animate-spin-slow">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-gradient bg-300%">
            Keyword Explorer
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Discover patterns and themes across <span className="font-bold text-purple-500">{songs.length}</span> Taylor Swift songs
          </p>
          <div className="absolute -top-4 -right-4 animate-ping">
            <Star className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {/* Search Bar with enhanced styling - Now with Add button */}
        <div className="max-w-2xl mx-auto mb-8 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-30"></div>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 w-6 h-6 z-10" />
            <input
              type="text"
              placeholder="✨ Search for any word in lyrics (friends, love, heart, etc.)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="relative w-full pl-12 pr-16 py-4 text-lg border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
            />
            <button
              onClick={handleSearchAdd}
              disabled={!searchTerm.trim()}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Search for any word in lyrics • Press Enter or click + to add as keyword
          </p>
        </div>

        {/* Selected Keywords Display */}
        {selectedKeywords.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6 animate-fade-in">
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <Target className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-sm text-gray-600 font-medium">Active keywords:</span>
              {selectedKeywords.map((keyword, index) => (
                <div 
                  key={keyword} 
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200 shadow-lg transform hover:scale-105 transition-transform animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Sparkles className="w-4 h-4" />
                  {keyword}
                  <button 
                    onClick={() => removeKeyword(keyword)} 
                    className="ml-1 hover:text-purple-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={clearAllKeywords}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
              >
                Clear all
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Showing songs that contain ALL selected keywords (searches entire lyrics)
            </p>
          </div>
        )}

        {/* Popular Keywords with enhanced styling */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Zap className="w-6 h-6 text-yellow-500 animate-bounce" />
            <h3 className="text-lg font-semibold text-gray-700 bg-white/50 px-4 py-1 rounded-full">Popular Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {enhancedPopularKeywords.map(keyword => (
              <button
                key={keyword}
                onClick={() => handleKeywordSelect(keyword)}
                onMouseEnter={() => setHoveredKeyword(keyword)}
                onMouseLeave={() => setHoveredKeyword('')}
                className={`px-4 py-3 rounded-2xl border-2 transition-all duration-300 font-medium shadow-lg transform hover:scale-110 ${
                  selectedKeywords.includes(keyword)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-xl scale-105'
                    : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 border-purple-100 hover:border-purple-300 hover:shadow-xl'
                } ${hoveredKeyword === keyword ? 'ring-2 ring-purple-300' : ''}`}
              >
                {keyword === 'love' && <Heart className="w-4 h-4 inline mr-1 text-red-400" />}
                {selectedKeywords.includes(keyword) && <Star className="w-4 h-4 inline mr-1 text-yellow-300" />}
                {keyword}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Includes common words and their variations (friend → friends, love → loves, etc.)
          </p>
        </div>

        {/* Results Summary with animation */}
        <div className="max-w-4xl mx-auto mb-6 text-center animate-fade-in">
          <p className="text-lg text-gray-700 font-medium">
            Found <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              {filteredSongs.length}
            </span> songs
            {selectedKeywords.length > 0 && ` containing ${selectedKeywords.length} keyword${selectedKeywords.length > 1 ? 's' : ''}`}
            {searchTerm && !selectedKeywords.includes(searchTerm.toLowerCase()) && ` with "${searchTerm}"`}
          </p>
          {selectedKeywords.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Keywords: {selectedKeywords.join(', ')}
            </p>
          )}
        </div>

        {/* Results Grid with staggered animation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song, index) => (
            <div 
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <SongCard
                song={song}
                keyword={selectedKeywords.join(', ')}
                count={getTotalOccurrences(song, selectedKeywords)}
              />
            </div>
          ))}
        </div>

        {filteredSongs.length === 0 && !loading && (
          <div className="text-center py-16 animate-bounce-in">
            <div className="relative inline-block">
              <Music className="w-20 h-20 text-gray-400 mx-auto mb-4 animate-float" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            <p className="text-gray-500 text-xl font-medium mb-2">No songs found matching your search.</p>
            <p className="text-gray-400 font-medium">
              Try searching for common words like "love", "heart", "time", "night", etc. ✨
            </p>
          </div>
        )}

        {/* Bingo Mode Hint with enhanced styling */}
        {filteredSongs.length > 5 && (
          <div className="max-w-2xl mx-auto mt-12 p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-3xl border-2 border-purple-200 text-center shadow-xl transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-slow">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-4 animate-spin-slow" />
              <div className="absolute inset-0 bg-yellow-200 rounded-full blur-lg opacity-30 animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Advanced Search Active!
            </h3>
            <p className="text-gray-600 text-lg font-medium">
              Your search is scanning all lyrics for matches. 
              Try adding more keywords to narrow down results! 🎯
            </p>
          </div>
        )}
      </div>
    </div>
  );
}