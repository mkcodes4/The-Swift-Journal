'use client';

import { useState, useEffect, JSX } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Smile, Frown, Meh, TrendingUp, Star, Heart, Music, ArrowLeft, Play, Pause, Filter } from 'lucide-react';

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
}

interface AlbumData {
  album: string;
  year: number;
  sentiment: number;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  songs: Song[];
}

// Use a more compatible interface for Recharts
interface SentimentDataItem {
  name: string;
  value: number;
  color: string;
  icon: JSX.Element;
  [key: string]: any;
}

type ViewMode = 'overview' | 'album-detail';

export default function SentimentPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  // Improved sentiment classification function
  const getAdjustedSentiment = (song: Song): 'positive' | 'negative' | 'neutral' => {
    const score = song.roberta_compound;
    
    // More balanced thresholds to reduce neutral bias
    if (score >= 0.2) return 'positive';    // Lowered from 0.3
    if (score <= -0.2) return 'negative';   // Raised from -0.3
    return 'neutral';
  };

  useEffect(() => {
    const loadSongs = async () => {
      try {
        console.log('🔄 Fetching real song data from API...');
        const response = await fetch('/api/songs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch songs: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🎵 Real songs loaded:', data.length, 'songs');
        
        if (data.length === 0) {
          throw new Error('No songs found in the dataset');
        }

        // Apply adjusted sentiment classification
        const songsWithAdjustedSentiment = data.map((song: Song) => ({
          ...song,
          roberta_label: getAdjustedSentiment(song)
        }));
        
        setSongs(songsWithAdjustedSentiment);
      } catch (error) {
        console.error('❌ Error loading songs:', error);
        setError(error instanceof Error ? error.message : 'Failed to load songs data');
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, []);

  // Calculate album sentiment with songs included
  const albumData: AlbumData[] = Object.entries(
    songs.reduce((acc: { [key: string]: Song[] }, song) => {
      if (!acc[song.album]) acc[song.album] = [];
      acc[song.album].push(song);
      return acc;
    }, {})
  ).map(([album, albumSongs]) => {
    const positive = albumSongs.filter(s => s.roberta_label === 'positive').length;
    const neutral = albumSongs.filter(s => s.roberta_label === 'neutral').length;
    const negative = albumSongs.filter(s => s.roberta_label === 'negative').length;
    const avgSentiment = albumSongs.reduce((sum, song) => sum + song.roberta_compound, 0) / albumSongs.length;
    const year = Math.min(...albumSongs.map(s => s.year)); // Get earliest year for the album
    
    return {
      album,
      year,
      sentiment: avgSentiment,
      positive,
      neutral,
      negative,
      total: albumSongs.length,
      songs: albumSongs
    };
  }).sort((a, b) => b.sentiment - a.sentiment);

  // Calculate sentiment distribution
  const sentimentData = [
    { 
      name: 'Positive', 
      value: songs.filter(s => s.roberta_label === 'positive').length,
      color: '#10b981'
    },
    { 
      name: 'Neutral', 
      value: songs.filter(s => s.roberta_label === 'neutral').length,
      color: '#6b7280'
    },
    { 
      name: 'Negative', 
      value: songs.filter(s => s.roberta_label === 'negative').length,
      color: '#ef4444'
    }
  ];

  // Most positive and negative songs
  const mostPositive = [...songs].sort((a, b) => b.roberta_compound - a.roberta_compound)[0];
  const mostNegative = [...songs].sort((a, b) => a.roberta_compound - b.roberta_compound)[0];

  // Yearly sentiment trend
  const yearlyTrend = Object.entries(
    songs.reduce((acc: { [key: string]: Song[] }, song) => {
      if (!acc[song.year]) acc[song.year] = [];
      acc[song.year].push(song);
      return acc;
    }, {})
  ).map(([year, yearSongs]) => ({
    year: parseInt(year),
    sentiment: yearSongs.reduce((sum, song) => sum + song.roberta_compound, 0) / yearSongs.length,
    songs: yearSongs.length
  })).sort((a, b) => a.year - b.year);

  // Stats for display
  const sentimentStats = [
    { 
      name: 'Positive', 
      value: songs.filter(s => s.roberta_label === 'positive').length,
      color: '#10b981',
      icon: <Smile className="w-6 h-6 text-green-600" />
    },
    { 
      name: 'Neutral', 
      value: songs.filter(s => s.roberta_label === 'neutral').length,
      color: '#6b7280', 
      icon: <Meh className="w-6 h-6 text-gray-600" />
    },
    { 
      name: 'Negative', 
      value: songs.filter(s => s.roberta_label === 'negative').length,
      color: '#ef4444',
      icon: <Frown className="w-6 h-6 text-red-600" />
    }
  ];

  const handleAlbumClick = (album: AlbumData) => {
    setSelectedAlbum(album);
    setViewMode('album-detail');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedAlbum(null);
    setSentimentFilter('all');
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-600" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Meh className="w-4 h-4 text-gray-600" />;
      default: return <Music className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter songs for album detail view
  const filteredAlbumSongs = selectedAlbum ? 
    sentimentFilter === 'all' 
      ? selectedAlbum.songs 
      : selectedAlbum.songs.filter(song => song.roberta_label === sentimentFilter)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Sentiment Analysis
            </h1>
            <p className="text-xl text-gray-600">
              Loading real Taylor Swift sentiment data...
            </p>
          </div>
          <div className="animate-pulse">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="era-card p-6 text-center">
                  <div className="h-8 bg-gray-200 rounded-full w-16 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="h-80 bg-gray-200 rounded-2xl"></div>
              <div className="h-80 bg-gray-200 rounded-2xl"></div>
            </div>
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
            <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Album Detail View
  if (viewMode === 'album-detail' && selectedAlbum) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {selectedAlbum.album}
              </h1>
              <p className="text-gray-600">{selectedAlbum.year} • {selectedAlbum.total} songs</p>
            </div>
          </div>

          {/* Album Summary */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="era-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Smile className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{selectedAlbum.positive}</span>
              </div>
              <p className="text-gray-600">Positive Songs</p>
              <p className="text-xs text-gray-400 mt-1">
                {((selectedAlbum.positive / selectedAlbum.total) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="era-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Meh className="w-6 h-6 text-gray-600" />
                <span className="text-2xl font-bold text-gray-600">{selectedAlbum.neutral}</span>
              </div>
              <p className="text-gray-600">Neutral Songs</p>
              <p className="text-xs text-gray-400 mt-1">
                {((selectedAlbum.neutral / selectedAlbum.total) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="era-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Frown className="w-6 h-6 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{selectedAlbum.negative}</span>
              </div>
              <p className="text-gray-600">Negative Songs</p>
              <p className="text-xs text-gray-400 mt-1">
                {((selectedAlbum.negative / selectedAlbum.total) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="era-card p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <span className={`text-2xl font-bold ${
                  selectedAlbum.sentiment > 0.2 ? 'text-green-600' :
                  selectedAlbum.sentiment < -0.2 ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {selectedAlbum.sentiment > 0 ? '+' : ''}{selectedAlbum.sentiment.toFixed(3)}
                </span>
              </div>
              <p className="text-gray-600">Avg Sentiment</p>
            </div>
          </div>

          {/* Sentiment Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSentimentFilter('all')}
              className={`px-4 py-2 rounded-full border transition-all ${
                sentimentFilter === 'all'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
              }`}
            >
              All Songs ({selectedAlbum.total})
            </button>
            <button
              onClick={() => setSentimentFilter('positive')}
              className={`px-4 py-2 rounded-full border transition-all ${
                sentimentFilter === 'positive'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              Positive ({selectedAlbum.positive})
            </button>
            <button
              onClick={() => setSentimentFilter('neutral')}
              className={`px-4 py-2 rounded-full border transition-all ${
                sentimentFilter === 'neutral'
                  ? 'bg-gray-600 text-white border-gray-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Neutral ({selectedAlbum.neutral})
            </button>
            <button
              onClick={() => setSentimentFilter('negative')}
              className={`px-4 py-2 rounded-full border transition-all ${
                sentimentFilter === 'negative'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
              }`}
            >
              Negative ({selectedAlbum.negative})
            </button>
          </div>

          {/* Songs List */}
          <div className="era-card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Songs {sentimentFilter !== 'all' && `(${sentimentFilter})`}
            </h2>
            <div className="grid gap-3">
              {filteredAlbumSongs.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getSentimentColor(song.roberta_label)}`}>
                      {getSentimentIcon(song.roberta_label)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Sentiment: <span className={`font-semibold ${
                          song.roberta_compound > 0.2 ? 'text-green-600' :
                          song.roberta_compound < -0.2 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {song.roberta_compound > 0 ? '+' : ''}{song.roberta_compound.toFixed(3)}
                        </span>
                        <span className="mx-2">•</span>
                        Confidence: {(song.roberta_confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getSentimentColor(song.roberta_label)}`}>
                      {song.roberta_label}
                    </span>
                    <Music className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview View
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Sentiment Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Emotional journey through {songs.length} Taylor Swift songs powered by RoBERTa AI
          </p>
          <div className="mt-4 text-sm text-purple-600 font-medium">
            📊 Click on any album to see detailed song-level sentiment analysis
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {sentimentStats.map((stat, index) => (
            <div key={index} className="era-card p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center gap-2 mb-3">
                {stat.icon}
                <span className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-600">{stat.name} Songs</p>
              <p className="text-xs text-gray-400 mt-1">
                {((stat.value / songs.length) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Sentiment Distribution */}
          <div className="era-card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overall Sentiment Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} songs`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Album Sentiment */}
          <div className="era-card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Album Sentiment Comparison ({albumData.length} Albums)
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={albumData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="album" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [Number(value).toFixed(3), 'Sentiment Score']}
                    labelFormatter={(label: string) => `Album: ${label}`}
                  />
                  <Bar dataKey="sentiment" fill="#8b5cf6" name="Avg Sentiment" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Yearly Trend */}
        <div className="era-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Yearly Sentiment Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [Number(value).toFixed(3), 'Sentiment Score']}
                  labelFormatter={(label: string) => `Year: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#7c3aed' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Extreme Songs */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Most Positive Song */}
          <div className="era-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smile className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Most Positive Song</h2>
            </div>
            {mostPositive && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{mostPositive.title}</h3>
                    <p className="text-gray-600">{mostPositive.album} • {mostPositive.year}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      +{mostPositive.roberta_compound.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(mostPositive.roberta_confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 text-sm italic">
                    "{mostPositive.lyrics.split(' ').slice(0, 20).join(' ')}..."
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Most Negative Song */}
          <div className="era-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Frown className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">Most Negative Song</h2>
            </div>
            {mostNegative && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{mostNegative.title}</h3>
                    <p className="text-gray-600">{mostNegative.album} • {mostNegative.year}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {mostNegative.roberta_compound.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(mostNegative.roberta_confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm italic">
                    "{mostNegative.lyrics.split(' ').slice(0, 20).join(' ')}..."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Album Breakdown - Clickable */}
        <div className="era-card p-6 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Album Analysis ({albumData.length} Albums)
            </h2>
            <span className="text-sm text-gray-500">Click any album for detailed analysis</span>
          </div>
          <div className="grid gap-4">
            {albumData.map((album, index) => (
              <div 
                key={index}
                onClick={() => handleAlbumClick(album)}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer group transform hover:scale-[1.02] duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                      {album.album}
                    </h3>
                    <span className="text-sm text-gray-500">({album.year})</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {album.total} songs • Sentiment: <span className={`font-semibold ${
                      album.sentiment > 0.2 ? 'text-green-600' :
                      album.sentiment < -0.2 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {album.sentiment > 0 ? '+' : ''}{album.sentiment.toFixed(3)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-green-600" title="Positive songs">
                    <Smile className="w-4 h-4" />
                    <span>{album.positive}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600" title="Neutral songs">
                    <Meh className="w-4 h-4" />
                    <span>{album.neutral}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600" title="Negative songs">
                    <Frown className="w-4 h-4" />
                    <span>{album.negative}</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}