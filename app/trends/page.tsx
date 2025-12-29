'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Calendar, TrendingUp, Moon, Sun, Sparkles, Clock, Heart, Star, AlertCircle, Book, PenTool, Users, Zap, Music } from 'lucide-react';

interface Song {
  title: string;
  album: string;
  year: number;
  lyrics: string;
  roberta_label: 'positive' | 'negative' | 'neutral';
  roberta_confidence: number;
  roberta_compound: number;
  textblob_polarity: number;
  textblob_subjectivity: number;
  love: number;
  heart: number;
  night: number;
  day: number;
  time: number;
  never: number;
  forever: number;
  [key: string]: any;
}

interface EraData {
  era: string;
  year: number;
  sentiment: number;
  love: number;
  heart: number;
  night: number;
  day: number;
  time: number;
  never: number;
  forever: number;
  color: string;
  album: string;
  totalSongs: number;
}

// Custom Tooltip Components
const KeywordTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">Era: {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mt-1">
            <p className="text-sm" style={{ color: entry.color }}>
              ● {entry.name}: <span className="font-semibold">{entry.value}</span> mentions
            </p>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">
          Total references in this era's lyrics
        </p>
      </div>
    );
  }
  return null;
};

const LoveTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const loveCount = payload[0].value;
    let interpretation = '';
    
    if (loveCount > 60) {
      interpretation = 'Love-Focused Era • Romantic Themes';
    } else if (loveCount > 40) {
      interpretation = 'Strong Love Themes • Relationship Focused';
    } else if (loveCount > 20) {
      interpretation = 'Moderate Love References • Emotional';
    } else {
      interpretation = 'Subtle Love Themes • Other Focuses';
    }

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">Era: {label}</p>
        <p className="text-sm text-gray-600">
          Love Mentions: <span className="font-semibold text-red-500">{loveCount}</span>
        </p>
        <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
          <p className="text-sm font-medium text-gray-800">
            💖 {interpretation}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          How often "love" appears in lyrics
        </p>
      </div>
    );
  }
  return null;
};

// Era Evolution Timeline Data
const eraEvolutionData = [
  {
    name: 'Taylor Swift',
    year: 2006,
    emoji: '💛',
    description: 'Country innocence, diary-style love songs. Simple storytelling with emotional honesty.',
    gradient: 'from-yellow-100 to-amber-50',
    icon: '🎸'
  },
  {
    name: 'Fearless',
    year: 2008,
    emoji: '✨',
    description: 'Fairytale optimism and romantic metaphors. Youthful confidence and hope.',
    gradient: 'from-yellow-100 to-white',
    icon: '👑'
  },
  {
    name: 'Speak Now',
    year: 2010,
    emoji: '💜',
    description: 'Self-expression through personal storytelling; lyrical independence.',
    gradient: 'from-purple-100 to-pink-50',
    icon: '📝'
  },
  {
    name: 'Red',
    year: 2012,
    emoji: '❤️',
    description: 'Passion and heartbreak collide. Raw, vivid emotion and lyrical maturity.',
    gradient: 'from-rose-200 to-red-100',
    icon: '🍁'
  },
  {
    name: '1989',
    year: 2014,
    emoji: '💖',
    description: 'Pop reinvention. City imagery, self-discovery, and polished poetic tone.',
    gradient: 'from-pink-100 to-sky-100',
    icon: '🏙️'
  },
  {
    name: 'Reputation',
    year: 2017,
    emoji: '🖤',
    description: 'Armor-clad writing about fame, love, and vengeance; darker poetic metaphors.',
    gradient: 'from-gray-800 to-red-400 text-white',
    icon: '🐍'
  },
  {
    name: 'Lover',
    year: 2019,
    emoji: '💗',
    description: 'Romantic rebirth and nostalgic peace. Soft, dreamy, pastel lyricism.',
    gradient: 'from-pink-200 to-rose-100',
    icon: '🦋'
  },
  {
    name: 'Folklore',
    year: 2020,
    emoji: '🌲',
    description: 'Indie-poetic storytelling, fictional characters, and nature metaphors.',
    gradient: 'from-slate-100 to-green-50',
    icon: '🧣'
  },
  {
    name: 'Evermore',
    year: 2020,
    emoji: '🍂',
    description: 'Reflective continuation of Folklore, quiet acceptance, and introspection.',
    gradient: 'from-amber-100 to-beige-50',
    icon: '☕'
  },
  {
    name: 'Midnights',
    year: 2022,
    emoji: '🌙',
    description: 'Confessional lyricism; sleepless thoughts, regrets, and self-reflection.',
    gradient: 'from-indigo-200 to-blue-100',
    icon: '🕛'
  },
  {
    name: 'The Tortured Poets Department',
    year: 2024,
    emoji: '🕊️',
    description: 'Literary melancholy, prose-style writing, mature vulnerability.',
    gradient: 'from-stone-100 to-gray-200',
    icon: '📚'
  },
  {
    name: 'The Life of a Showgirl',
    year: 2025,
    emoji: '🎭',
    description: 'Glamour meets vulnerability; reflections on fame, illusion, and identity.',
    gradient: 'from-pink-200 via-purple-100 to-yellow-100',
    icon: '🌟'
  }
];

export default function TrendsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('evolution');

  // Clean background themes without animations
  const getBackgroundTheme = () => {
    switch (activeTab) {
      case 'daynight':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
      case 'love':
        return 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50';
      case 'evolution':
        return 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50';
      default:
        return 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50';
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    const loadSongs = async () => {
      try {
        console.log('🔄 Loading real song data for trends analysis...');
        const response = await fetch('/api/songs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch songs: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Real trends data loaded:', data.length, 'songs');
        
        if (data.length === 0) {
          throw new Error('No songs found in dataset');
        }
        
        setSongs(data);
      } catch (error) {
        console.error('❌ Error loading songs for trends:', error);
        setError(error instanceof Error ? error.message : 'Failed to load trends data');
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, []);

  const filteredSongs = songs;

  // Era mapping
  const eraMapping: { [key: string]: { era: string; color: string } } = {
    'Taylor Swift': { era: 'Debut', color: '#A2D5F2' },
    'Fearless': { era: 'Fearless', color: '#FFD966' },
    'Speak Now': { era: 'Speak Now', color: '#7B5E7B' },
    'Red': { era: 'Red', color: '#D32F2F' },
    '1989': { era: '1989', color: '#89CFF0' },
    'Reputation': { era: 'Reputation', color: '#1A1A1A' },
    'Lover': { era: 'Lover', color: '#FFB6C1' },
    'Folklore': { era: 'Folklore', color: '#C0C0C0' },
    'Evermore': { era: 'Evermore', color: '#D97C4E' },
    'Midnights': { era: 'Midnights', color: '#191970' },
    'The Tortured Poets Department': { era: 'TTPD', color: '#581845' }
  };

  // Yearly sentiment trend
  const yearlyTrend = Object.entries(
    filteredSongs.reduce((acc: { [key: string]: Song[] }, song) => {
      if (!acc[song.year]) acc[song.year] = [];
      acc[song.year].push(song);
      return acc;
    }, {})
  ).map(([year, yearSongs]) => ({
    year: parseInt(year),
    sentiment: yearSongs.reduce((sum, song) => sum + song.roberta_compound, 0) / yearSongs.length,
    love: yearSongs.reduce((sum, song) => sum + (song.love || 0), 0),
    heart: yearSongs.reduce((sum, song) => sum + (song.heart || 0), 0),
    night: yearSongs.reduce((sum, song) => sum + (song.night || 0), 0),
    day: yearSongs.reduce((sum, song) => sum + (song.day || 0), 0),
    time: yearSongs.reduce((sum, song) => sum + (song.time || 0), 0),
    never: yearSongs.reduce((sum, song) => sum + (song.never || 0), 0),
    forever: yearSongs.reduce((sum, song) => sum + (song.forever || 0), 0),
    songs: yearSongs.length
  })).sort((a, b) => a.year - b.year);

  // Era data calculation
  const eraData: EraData[] = Object.entries(
    filteredSongs.reduce((acc: { [key: string]: Song[] }, song) => {
      if (!acc[song.album]) acc[song.album] = [];
      acc[song.album].push(song);
      return acc;
    }, {})
  ).map(([album, albumSongs]) => {
    const year = Math.min(...albumSongs.map(s => s.year));
    const sentiment = albumSongs.reduce((sum, song) => sum + song.roberta_compound, 0) / albumSongs.length;
    
    const love = albumSongs.reduce((sum, song) => sum + (song.love || 0), 0);
    const heart = albumSongs.reduce((sum, song) => sum + (song.heart || 0), 0);
    const night = albumSongs.reduce((sum, song) => sum + (song.night || 0), 0);
    const day = albumSongs.reduce((sum, song) => sum + (song.day || 0), 0);
    const time = albumSongs.reduce((sum, song) => sum + (song.time || 0), 0);
    const never = albumSongs.reduce((sum, song) => sum + (song.never || 0), 0);
    const forever = albumSongs.reduce((sum, song) => sum + (song.forever || 0), 0);
    
    const eraInfo = eraMapping[album] || { era: album, color: '#6b7280' };
    
    return {
      era: eraInfo.era,
      year,
      sentiment,
      love,
      heart,
      night, 
      day,
      time,
      never,
      forever,
      color: eraInfo.color,
      album,
      totalSongs: albumSongs.length
    };
  }).sort((a, b) => a.year - b.year);

  // Day vs Night analysis
  const dayNightData = eraData.map(era => ({
    era: era.era,
    day: era.day,
    night: era.night,
    ratio: era.day > 0 ? (era.day / era.night) : 0
  }));

  // Love mentions over time
  const loveData = eraData.map(era => ({
    era: era.era,
    love: era.love,
    year: era.year,
    color: era.color
  }));

  const hasKeywordData = eraData.some(era => era.love > 0 || era.night > 0);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Lyrical Evolution
            </h1>
            <p className="text-xl text-gray-600">
              Analyzing Taylor Swift's songwriting journey...
            </p>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
            <div className="h-80 bg-gray-200 rounded-2xl mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-500 ${getBackgroundTheme()}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Lyrical Evolution
          </h1>
          <p className="text-xl text-gray-600">
            The artistic journey of Taylor Swift through {filteredSongs.length} songs
          </p>
    
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/40">
            {[
              { id: 'evolution', label: 'Era Evolution', icon: Music },
              { id: 'daynight', label: 'Day vs Night', icon: Moon },
              { id: 'love', label: 'Love Themes', icon: Heart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Era Evolution Timeline */}
        {activeTab === 'evolution' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Era Evolution Timeline
              </h2>
              <p className="text-gray-600 text-lg">
                Journey through Taylor's lyrical transformation from country beginnings to poetic mastery
              </p>
            </div>

            {/* Horizontal Scrollable Timeline */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 transform -translate-y-1/2 z-0"></div>
              
              <div className="flex overflow-x-auto pb-8 px-4 gap-6 snap-x snap-mandatory scrollbar-hide">
                {eraEvolutionData.map((era, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 snap-center transform transition-all duration-300 hover:scale-105"
                  >
                    <div className={`bg-gradient-to-br ${era.gradient} rounded-2xl p-6 shadow-lg border border-white/50 backdrop-blur-sm h-64 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
                      
                      {/* Era Header */}
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <span className="text-2xl">{era.emoji}</span>
                          <span className="text-3xl">{era.icon}</span>
                          <span className="text-2xl">{era.emoji}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{era.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">{era.year}</p>
                      </div>

                      {/* Description */}
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {era.description}
                        </p>
                      </div>

                      {/* Decorative Elements */}
                      <div className="flex justify-center gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-white/50 group-hover:bg-white/80 transition-all duration-300"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolution Insights */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="era-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Writing Style</h3>
                <p className="text-sm text-gray-600">
                  From simple diary entries to complex literary narratives and poetic confessionals
                </p>
              </div>

              <div className="era-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Narrative Voice</h3>
                <p className="text-sm text-gray-600">
                  Evolved from personal perspective to fictional characters and omniscient storytelling
                </p>
              </div>

              <div className="era-card p-6 bg-gradient-to-br from-green-50 to-emerald-50 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Emotional Depth</h3>
                <p className="text-sm text-gray-600">
                  Growth from surface emotions to profound psychological insights and vulnerability
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Day vs Night Analysis */}
        {activeTab === 'daynight' && (
          <div className="space-y-8">
            <div className="era-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <Moon className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Day vs Night in Taylor's Lyrics</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Explore how often Taylor references daytime vs nighttime themes across her eras.
              </p>
              {hasKeywordData ? (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dayNightData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="era" />
                        <YAxis />
                        <Tooltip content={<KeywordTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="day" 
                          stackId="1"
                          stroke="#fbbf24" 
                          fill="#fbbf24" 
                          name="Day References"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="night" 
                          stackId="1"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          name="Night References"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <span>☀️ Day References</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>🌙 Night References</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Moon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p>Day/Night keyword data not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Love Themes */}
        {activeTab === 'love' && (
          <div className="space-y-8">
            <div className="era-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800">Love in Taylor's Music</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Discover which eras focus most on love and romance themes.
              </p>
              {hasKeywordData ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loveData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="era" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip content={<LoveTooltip />} />
                      <Bar dataKey="love" name="Love Mentions">
                        {loveData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p>Love keyword data not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}