'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line
} from 'recharts';
import {
  Activity, Quote, Layers, Maximize2, Award
} from 'lucide-react';
import { Song } from '@/lib/utils';
import ExhibitModal from '@/components/ExhibitModal';

const ALBUM_META: Record<string, { year: number; color: string; shortName: string; icon: string }> = {
  'Taylor Swift':                   { year: 2006, color: '#829377', shortName: 'Debut', icon: '🌱' },
  'Fearless':                       { year: 2008, color: '#D4AF37', shortName: 'Fearless', icon: '👑' },
  'Speak Now':                      { year: 2010, color: '#9B59B6', shortName: 'Speak Now', icon: '💌' },
  'Red':                            { year: 2012, color: '#A52A2A', shortName: 'Red', icon: '🧣' },
  '1989':                           { year: 2014, color: '#5DADE2', shortName: '1989', icon: '🏙️' },
  'Reputation':                     { year: 2017, color: '#2C3E50', shortName: 'Reputation', icon: '🐍' },
  'Lover':                          { year: 2019, color: '#EC7063', shortName: 'Lover', icon: '💗' },
  'Folklore':                       { year: 2020, color: '#7FB3D5', shortName: 'folklore', icon: '🌲' },
  'Evermore':                       { year: 2020, color: '#D35400', shortName: 'evermore', icon: '🍁' },
  'Midnights':                      { year: 2022, color: '#1B2631', shortName: 'Midnights', icon: '🌙' },
  'The Tortured Poets Department':  { year: 2024, color: '#566573', shortName: 'TTPD', icon: '🖋️' },
  'The Life of a Showgirl':         { year: 2025, color: '#B5838D', shortName: 'Showgirl', icon: '🎭' },
  'Toy Story 5':                    { year: 2026, color: '#C97C5D', shortName: 'TS5', icon: '🧸' }
};

// Statically define ALBUM_ORDER to prevent JS from sorting numeric keys (like '1989') first.
const ALBUM_ORDER = [
  'Taylor Swift',
  'Fearless',
  'Speak Now',
  'Red',
  '1989',
  'Reputation',
  'Lover',
  'Folklore',
  'Evermore',
  'Midnights',
  'The Tortured Poets Department',
  'The Life of a Showgirl',
  'Toy Story 5'
];

const MOTIFS = [
  { key: 'love', label: 'Love', interp: 'This counts how often love is directly named. A high number usually means the album spends more time on romance, devotion, or heartbreak.' },
  { key: 'heart', label: 'Heart', interp: 'Heart words usually point to emotional stakes. They often show up when a song is talking about being moved, hurt, or attached.' },
  { key: 'memory', label: 'Memory', interp: 'Memory words show when songs are looking backward. More memory usually means the album is revisiting old moments instead of staying in the present.' },
  { key: 'time', label: 'Time', interp: 'Time words show how often the writing talks about waiting, endings, growing up, or moments slipping away.' },
  { key: 'night', label: 'Night', interp: 'Night words often mark secrecy, loneliness, reflection, or late-night overthinking.' },
  { key: 'rain', label: 'Rain', interp: 'Rain can signal sadness, release, or a dramatic turning point in the story of a song.' },
  { key: 'gold', label: 'Gold', interp: 'Gold usually points to something precious, nostalgic, glowing, or idealized.' },
  { key: 'forever', label: 'Forever', interp: 'Forever words show promises and big emotional stakes. Sometimes they are hopeful; sometimes they hurt because the promise breaks.' },
  { key: 'never', label: 'Never', interp: 'Never words often show refusal, regret, finality, or a hard emotional boundary.' },
  { key: 'pain', label: 'Pain', interp: 'Pain words are direct signs of hurt. When this is high, the song usually names emotional damage clearly.' },
  { key: 'fear', label: 'Fear', interp: 'Fear words point to vulnerability, hesitation, or the anxiety of losing something important.' },
  { key: 'dream', label: 'Dream', interp: 'Dream words can mean hope, fantasy, escape, or the sadness of something imagined but not reached.' },
  { key: 'hope', label: 'Hope', interp: 'Hope words show optimism and recovery. They are the brighter counterweight to grief or pain.' },
  { key: 'tears', label: 'Tears', interp: 'Tears mark visible sadness or release. They can mean heartbreak, but also emotional relief.' },
  { key: 'fire', label: 'Fire', interp: 'Fire words usually suggest intensity, anger, transformation, or burning something down to start over.' },
] as const;

type KeywordReadable = Record<string, unknown>;

type EmotionSummary = {
  avgJoy: number;
  avgSadness: number;
  avgAnger: number;
  avgFear: number;
  avgSurprise: number;
};

type ChartClickState = {
  activeLabel?: string;
};

type LineDotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  payload: {
    album: string;
    meta: {
      color: string;
    };
  };
};

function getAlbumIndex(album: string): number {
  const idx = ALBUM_ORDER.indexOf(album);
  return idx >= 0 ? idx : ALBUM_ORDER.length - 1;
}

export default function InsightsLab() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interaction states
  const [selectedAlbumForDrawer, setSelectedAlbumForDrawer] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string>('Red');
  const [compareB, setCompareB] = useState<string>('Reputation');
  const [activeModalSong, setActiveModalSong] = useState<Song | null>(null);
  const [activeMotif, setActiveMotif] = useState<string | null>('love');

  useEffect(() => {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        setIsLoading(false);
      });
  }, []);

  // Computation Layer
  const processedData = useMemo(() => {
    if (songs.length === 0) return null;

    // 1. Calculate song level emotions & details
    const songsWithMetrics = songs.map(song => {
      const joy = (song.happy || 0) + (song.smile || 0) + (song.hope || 0) + ((song.love || 0) * 0.5);
      const sadness = (song.tears || 0) + (song.sad || 0) + (song.cry || 0) + (song.pain || 0) + (song.lonely || 0);
      const anger = (song.angry || 0) + (song.mad || 0) + (song.hurt || 0) + (song.betrayal || 0);
      const fear = (song.scared || 0) + (song.fear || 0);
      const surprise = (song.dream || 0) + ((song.never || 0) * 0.3);

      const maxVal = Math.max(joy, sadness, anger, fear, surprise, 0.001);
      let primaryEmotion = 'neutral';
      if (maxVal > 0.1) {
        if (maxVal === joy) primaryEmotion = 'joy';
        else if (maxVal === sadness) primaryEmotion = 'sadness';
        else if (maxVal === anger) primaryEmotion = 'anger';
        else if (maxVal === fear) primaryEmotion = 'fear';
        else if (maxVal === surprise) primaryEmotion = 'surprise';
      }

      // Volatility (std dev of signed score in windows)
      let volatility = 0;
      if (song.sentiment_windows && song.sentiment_windows.length >= 2) {
        const scores = song.sentiment_windows.map(w => w.signed_score);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        volatility = Math.sqrt(variance);
      }

      const rawComplexity = (song.textblob_subjectivity || 0.5) * (Math.log(song.word_count || 100) / 10);

      // Motifs
      const wordCount = song.word_count || 100;
      const loveDensity = ((song.love || 0) + (song.heart || 0) + (song.kiss || 0) + (song.darling || 0) + (song.sweet || 0)) / wordCount;
      const nightDensity = ((song.night || 0) + (song.midnight || 0) + (song.moon || 0) + (song.dark || 0) + (song.dusk || 0)) / wordCount;
      const natureDensity = ((song.rain || 0) + (song.storm || 0) + (song.fire || 0) + (song.ocean || 0) + (song.river || 0) + (song.sky || 0) + (song.star || 0)) / wordCount;
      const colorDensity = ((song.red || 0) + (song.blue || 0) + (song.gold || 0) + (song.black || 0) + (song.white || 0) + (song.silver || 0)) / wordCount;
      const timeDensity = ((song.time || 0) + (song.forever || 0) + (song.never || 0) + (song.memory || 0) + (song.remember || 0)) / wordCount;
      const relDensity = ((song.lover || 0) + (song.friend || 0) + (song.enemy || 0) + (song.together || 0) + (song.apart || 0)) / wordCount;

      return {
        ...song,
        joy,
        sadness,
        anger,
        fear,
        surprise,
        primaryEmotion,
        volatility,
        rawComplexity,
        loveDensity,
        nightDensity,
        natureDensity,
        colorDensity,
        timeDensity,
        relDensity
      };
    });

    // Normalize song complexity to 0-1
    const complexities = songsWithMetrics.map(s => s.rawComplexity);
    const minComp = Math.min(...complexities);
    const maxComp = Math.max(...complexities);
    const songsNormalized = songsWithMetrics.map(s => ({
      ...s,
      complexity: maxComp > minComp ? (s.rawComplexity - minComp) / (maxComp - minComp) : 0.5
    }));

    // Group by Album
    const albums = Array.from(new Set(songsNormalized.map(s => s.album)))
      .filter(album => ALBUM_ORDER.includes(album))
      .sort((a, b) => getAlbumIndex(a) - getAlbumIndex(b));

    const albumSummaries = albums.map(album => {
      const albumSongs = songsNormalized.filter(s => s.album === album);
      const avgSentiment = albumSongs.reduce((sum, s) => sum + s.roberta_compound, 0) / albumSongs.length;
      const avgComplexity = albumSongs.reduce((sum, s) => sum + s.complexity, 0) / albumSongs.length;
      const avgVolatility = albumSongs.reduce((sum, s) => sum + s.volatility, 0) / albumSongs.length;
      
      const avgJoy = albumSongs.reduce((sum, s) => sum + s.joy, 0) / albumSongs.length;
      const avgSadness = albumSongs.reduce((sum, s) => sum + s.sadness, 0) / albumSongs.length;
      const avgAnger = albumSongs.reduce((sum, s) => sum + s.anger, 0) / albumSongs.length;
      const avgFear = albumSongs.reduce((sum, s) => sum + s.fear, 0) / albumSongs.length;
      const avgSurprise = albumSongs.reduce((sum, s) => sum + s.surprise, 0) / albumSongs.length;

      const loveDensity = albumSongs.reduce((sum, s) => sum + s.loveDensity, 0) / albumSongs.length;
      const nightDensity = albumSongs.reduce((sum, s) => sum + s.nightDensity, 0) / albumSongs.length;
      const natureDensity = albumSongs.reduce((sum, s) => sum + s.natureDensity, 0) / albumSongs.length;
      const colorDensity = albumSongs.reduce((sum, s) => sum + s.colorDensity, 0) / albumSongs.length;
      const timeDensity = albumSongs.reduce((sum, s) => sum + s.timeDensity, 0) / albumSongs.length;
      const relDensity = albumSongs.reduce((sum, s) => sum + s.relDensity, 0) / albumSongs.length;
      const avgWordCount = albumSongs.reduce((sum, s) => sum + (s.word_count || 0), 0) / albumSongs.length;

      const totalKeywords = albumSongs.reduce((sum, s) => {
        return sum + (((s as KeywordReadable).love as number) || 0) + (songKeywordsCount(s as KeywordReadable));
      }, 0) / albumSongs.length;

      // Find extreme songs
      const mostPositiveSong = [...albumSongs].sort((a, b) => b.roberta_compound - a.roberta_compound)[0];
      const mostNegativeSong = [...albumSongs].sort((a, b) => a.roberta_compound - b.roberta_compound)[0];
      const mostVolatileSong = [...albumSongs].sort((a, b) => b.volatility - a.volatility)[0];
      const mostComplexSong = [...albumSongs].sort((a, b) => b.complexity - a.complexity)[0];

      return {
        album,
        meta: ALBUM_META[album],
        avgSentiment,
        avgComplexity,
        avgVolatility,
        avgJoy,
        avgSadness,
        avgAnger,
        avgFear,
        avgSurprise,
        loveDensity,
        nightDensity,
        natureDensity,
        colorDensity,
        timeDensity,
        relDensity,
        avgWordCount,
        totalKeywords,
        mostPositiveSong,
        mostNegativeSong,
        mostVolatileSong,
        mostComplexSong,
        songsCount: albumSongs.length
      };
    });

    // Helper: count non-zero keyword categories
    function songKeywordsCount(s: KeywordReadable): number {
      let count = 0;
      const keys = ['love', 'heart', 'tears', 'smile', 'happy', 'sad', 'cry', 'pain', 'angry', 'mad', 'hurt', 'scared', 'fear', 'hope', 'dream', 'lonely', 'regret', 'trust', 'betrayal', 'rain', 'storm', 'fire', 'ocean', 'river', 'sky', 'star', 'night', 'midnight', 'moon', 'dark', 'red', 'blue', 'gold', 'black', 'white', 'time', 'forever', 'never', 'memory', 'remember'];
      keys.forEach(k => {
        const value = (s[k] as number) || 0;
        if (value > 0) count += value;
      });
      return count;
    }

    // Normalize components across all albums to compute Emotional Evolution Index (EEI)
    const joyVals = albumSummaries.map(a => a.avgJoy);
    const sadVals = albumSummaries.map(a => a.avgSadness);
    const angerVals = albumSummaries.map(a => a.avgAnger);
    const fearVals = albumSummaries.map(a => a.avgFear);
    const volVals = albumSummaries.map(a => a.avgVolatility);

    const maxJoy = Math.max(...joyVals), minJoy = Math.min(...joyVals);
    const maxSad = Math.max(...sadVals), minSad = Math.min(...sadVals);
    const maxAng = Math.max(...angerVals), minAng = Math.min(...angerVals);
    const maxFear = Math.max(...fearVals), minFear = Math.min(...fearVals);
    const maxVol = Math.max(...volVals), minVol = Math.min(...volVals);

    const albumSummariesWithEEI = albumSummaries.map(a => {
      const nJoy = maxJoy > minJoy ? (a.avgJoy - minJoy) / (maxJoy - minJoy) : 0.5;
      const nSad = maxSad > minSad ? (a.avgSadness - minSad) / (maxSad - minSad) : 0.5;
      const nAng = maxAng > minAng ? (a.avgAnger - minAng) / (maxAng - minAng) : 0.5;
      const nFear = maxFear > minFear ? (a.avgFear - minFear) / (maxFear - minFear) : 0.5;
      const nVol = maxVol > minVol ? (a.avgVolatility - minVol) / (maxVol - minVol) : 0.5;

      // EEI Formula
      const rawEEI = (a.avgSentiment * 0.4)
        + (nJoy * 0.2)
        - (nSad * 0.15)
        - (nAng * 0.1)
        - (nFear * 0.05)
        + ((1 - nVol) * 0.1);

      return { ...a, rawEEI };
    });

    const eeiVals = albumSummariesWithEEI.map(a => a.rawEEI);
    const minEEI = Math.min(...eeiVals);
    const maxEEI = Math.max(...eeiVals);

    const finalAlbumSummaries = albumSummariesWithEEI.map(a => ({
      ...a,
      eei: maxEEI > minEEI ? (a.rawEEI - minEEI) / (maxEEI - minEEI) : 0.5
    }));

    return {
      songs: songsNormalized,
      albumSummaries: finalAlbumSummaries
    };
  }, [songs]);

  // Comparison & Recommendations calculations
  const comparisonData = useMemo(() => {
    if (!processedData) return null;
    const albumA = processedData.albumSummaries.find(a => a.album === compareA);
    const albumB = processedData.albumSummaries.find(a => a.album === compareB);
    if (!albumA || !albumB) return null;

    // Helper: compute similarity between any two album vectors
    const computeSimilarity = (a: typeof albumA, b: typeof albumB) => {
      const aVec = [
        a.avgJoy, a.avgSadness, a.avgAnger, a.avgFear,
        (a.avgSentiment + 1) / 2, a.avgVolatility, a.avgComplexity
      ];
      const bVec = [
        b.avgJoy, b.avgSadness, b.avgAnger, b.avgFear,
        (b.avgSentiment + 1) / 2, b.avgVolatility, b.avgComplexity
      ];

      const dotProduct = aVec.reduce((sum, val, idx) => sum + val * bVec[idx], 0);
      const normA = Math.sqrt(aVec.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(bVec.reduce((sum, val) => sum + val * val, 0));
      return normA && normB ? dotProduct / (normA * normB) : 0;
    };

    const similarity = computeSimilarity(albumA, albumB);

    const getRecommendationsFor = (albumName: string) => {
      const target = processedData.albumSummaries.find(a => a.album === albumName);
      if (!target) return [];
      return processedData.albumSummaries
        .filter(a => a.album !== albumName)
        .map(a => ({
          album: a.album,
          shortName: a.meta.shortName,
          color: a.meta.color,
          sim: computeSimilarity(target, a)
        }))
        .sort((x, y) => y.sim - x.sim)
        .slice(0, 3);
    };

    const recsA = getRecommendationsFor(compareA);
    const recsB = getRecommendationsFor(compareB);

    return {
      albumA,
      albumB,
      similarity,
      recsA,
      recsB
    };
  }, [processedData, compareA, compareB]);

  const motifData = useMemo(() => {
    if (!processedData) return [];

    return MOTIFS.map(motif => {
      const total = processedData.songs.reduce((sum, song) => sum + (((song as Record<string, unknown>)[motif.key] as number) || 0), 0);
      const topSongs = [...processedData.songs]
        .sort((a, b) => (((b as Record<string, unknown>)[motif.key] as number) || 0) - (((a as Record<string, unknown>)[motif.key] as number) || 0))
        .filter(song => (((song as Record<string, unknown>)[motif.key] as number) || 0) > 0)
        .slice(0, 5);
      const albumCounts = ALBUM_ORDER.map(album => ({
        album,
        count: processedData.songs
          .filter(song => song.album === album)
          .reduce((sum, song) => sum + (((song as Record<string, unknown>)[motif.key] as number) || 0), 0),
      }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);

      return { ...motif, total, topSongs, albumCounts };
    });
  }, [processedData]);

  const activeMotifData = useMemo(() => {
    return motifData.find(motif => motif.key === activeMotif) || motifData[0] || null;
  }, [motifData, activeMotif]);

  // Selected Album for Profile Drawer
  const activeDrawerAlbum = useMemo(() => {
    if (!processedData || !selectedAlbumForDrawer) return null;
    return processedData.albumSummaries.find(a => a.album === selectedAlbumForDrawer) || null;
  }, [processedData, selectedAlbumForDrawer]);

  // Transition chips logic - generate for ALL consecutive album pairs
  const shiftChips = useMemo(() => {
    if (!processedData) return [];
    const list = [];
    for (let i = 0; i < processedData.albumSummaries.length - 1; i++) {
      const era1 = processedData.albumSummaries[i];
      const era2 = processedData.albumSummaries[i+1];
      const sentimentDelta = (era2.avgSentiment - era1.avgSentiment) * 100;
      const complexityDelta = (era2.avgComplexity - era1.avgComplexity) * 100;

      let shiftText = '☯️ Equilibrium';
      if (sentimentDelta > 5) {
        shiftText = '✨ Uplift';
      } else if (sentimentDelta < -5) {
        shiftText = '🥀 Descent';
      } else if (complexityDelta > 5) {
        shiftText = '📖 Introspective Shift';
      } else if (complexityDelta < -5) {
        shiftText = '🌱 Lyrical Simplicity';
      }

      list.push({
        from: era1.meta.shortName,
        to: era2.meta.shortName,
        sentimentDelta,
        complexityDelta,
        shiftText
      });
    }
    return list;
  }, [processedData]);

  if (isLoading || !processedData) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center font-headline italic text-2xl animate-pulse text-[#787770]">
        Accessing Lyrical Archives...
      </div>
    );
  }

  // Helper: Dominant Inferred Emotion Label
  const getDominantEmotionLabel = (a: EmotionSummary) => {
    const maxVal = Math.max(a.avgJoy, a.avgSadness, a.avgAnger, a.avgFear, a.avgSurprise);
    if (maxVal === a.avgJoy) return 'Joy & Optimism';
    if (maxVal === a.avgSadness) return 'Quiet Melancholy';
    if (maxVal === a.avgAnger) return 'Wounded Defiance';
    if (maxVal === a.avgFear) return 'Introspective Vulnerability';
    return 'Lyrical Surprise';
  };

  return (
    <div className="bg-[#F7F4EE] min-h-screen text-[#1F1B18] font-body selection:bg-[#C7A45D]/20 overflow-x-hidden">
      
      <style jsx global>{`
        nav.fixed.top-0 { z-index: 80 !important; }
        .chat-agent-button { display: none !important; }
      `}</style>

      <div className="pt-20">
        {/* HEADER */}
        <header className="px-16 pt-16 pb-12 flex justify-between items-start max-w-[1600px] mx-auto border-b border-[#E5E2E0]/40">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] mb-3 block text-[#8A8178] font-bold">
              Insights Lab — Observatory
            </span>
            <h1 className="font-headline text-6xl md:text-7xl italic leading-none tracking-tight text-[#1F1B18] mb-4">
              Lyrical Observatory
            </h1>
            <p className="max-w-2xl text-[#8A8178] text-sm leading-relaxed">
              A simple look at how Taylor Swift&apos;s albums feel over time. The Emotional Evolution Index, or EEI, is a 0 to 1 score: albums closer to 1 feel brighter, louder, and more expressive, while albums closer to 0 feel quieter, sadder, or more reflective.
            </p>
          </div>
        </header>

        <main className="px-16 py-16 space-y-28 max-w-[1600px] mx-auto">
          
          {/* SECTION 1: TIMELINE */}
          <section className="space-y-10">
            <div className="flex justify-between items-end border-b border-[#E5E2E0]/60 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E2E0] flex items-center justify-center text-xs font-bold tabular-nums">01</div>
                <div>
                  <h2 className="font-headline text-3xl uppercase tracking-tighter">The Emotional Evolution Index (EEI)</h2>
                  <p className="text-[11px] font-headline italic text-[#8A8178] uppercase tracking-widest mt-1">
                    Click any dot to open the album details.
                  </p>
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="bg-white/40 border border-[#E5E2E0] p-6 rounded-sm shadow-sm relative h-[480px]">
              <div className="absolute top-4 left-6 flex items-center gap-6 z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#C7A45D]" /> Higher means brighter and more expressive. Lower means quieter and more reflective.
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={processedData.albumSummaries}
                  margin={{ top: 50, right: 30, left: 30, bottom: 20 }}
                  onClick={(state: ChartClickState | null) => {
                    if (state && state.activeLabel) {
                      setSelectedAlbumForDrawer(state.activeLabel);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <XAxis 
                    dataKey="album" 
                    tickFormatter={(val) => ALBUM_META[val]?.shortName || val}
                    stroke="#8A8178"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 1]}
                    stroke="#8A8178"
                    fontSize={10}
                    tickFormatter={(val) => val === 1 ? 'Vibrant & Expressive' : val === 0 ? 'Reflective & Introspective' : val.toFixed(1)}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#E5E2E0', strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#F7F4EE] border border-[#E5E2E0] p-4 shadow-xl max-w-xs text-xs">
                            <p className="font-headline italic text-sm mb-1">{data.album} ({data.meta.year})</p>
                            <p className="text-[9px] uppercase tracking-widest text-[#8A8178] mb-2">{getDominantEmotionLabel(data)}</p>
                            <div className="space-y-1 font-mono text-[10px]">
                              <div className="flex justify-between">
                                <span>EEI Energy:</span>
                                <strong>{data.eei.toFixed(3)}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Sentiment:</span>
                                <strong>{(data.avgSentiment >= 0 ? '+' : '') + data.avgSentiment.toFixed(2)}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Complexity:</span>
                                <strong>{data.avgComplexity.toFixed(2)}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eei" 
                    stroke="#1F1B18" 
                    strokeWidth={1.5}
                    dot={(props: LineDotProps) => {
                      const { cx, cy, payload, index } = props;
                      const color = payload.meta.color;
                      return (
                        <circle 
                          key={`dot-${payload.album}-${index}`}
                          cx={cx} 
                          cy={cy} 
                          r={selectedAlbumForDrawer === payload.album ? 7 : 5}
                          fill={color} 
                          stroke="#1F1B18"
                          strokeWidth={selectedAlbumForDrawer === payload.album ? 2.5 : 1}
                          style={{ pointerEvents: 'auto' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlbumForDrawer(payload.album);
                          }}
                          className="cursor-pointer transition-all duration-300 hover:r-8"
                        />
                      );
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Shift Chips Rail - Shows Transitions for ALL Albums */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
              {shiftChips.map((chip, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/40 border border-[#E5E2E0]/50 p-2 rounded-sm text-center flex flex-col justify-center items-center shadow-xs"
                >
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#8A8178] mb-1">
                    {chip.from} → {chip.to}
                  </span>
                  <span className="text-[10px] font-bold text-[#1F1B18]">{chip.shiftText}</span>
                  <span className="text-[8px] text-[#8A8178] mt-0.5">
                    {chip.sentimentDelta > 0 ? '+' : ''}{chip.sentimentDelta.toFixed(0)}% Sentiment
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: COMPARISON LABORATORY */}
          <section className="space-y-10">
            <div className="flex justify-between items-end border-b border-[#E5E2E0]/60 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E2E0] flex items-center justify-center text-xs font-bold tabular-nums">02</div>
                <div>
                  <h2 className="font-headline text-3xl uppercase tracking-tighter">Comparison Laboratory</h2>
                  <p className="text-[11px] font-headline italic text-[#8A8178] uppercase tracking-widest mt-1">
                    Pick two albums and see how their mood, writing style, and repeated themes compare.
                  </p>
                </div>
              </div>
            </div>

            {/* DUAL SELECTOR */}
            <div className="flex flex-col md:flex-row gap-8 justify-between items-center bg-white/40 border border-[#E5E2E0] p-6 rounded-sm">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178]">Subject A</span>
                <select 
                  value={compareA} 
                  onChange={(e) => setCompareA(e.target.value)}
                  className="bg-[#F7F4EE] border border-[#E5E2E0] p-3 text-xs font-bold font-headline rounded-none focus:outline-none focus:border-[#C7A45D] flex-1 md:flex-none"
                >
                  {ALBUM_ORDER.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="text-[#8A8178] font-headline italic text-sm">versus</div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178]">Subject B</span>
                <select 
                  value={compareB} 
                  onChange={(e) => setCompareB(e.target.value)}
                  className="bg-[#F7F4EE] border border-[#E5E2E0] p-3 text-xs font-bold font-headline rounded-none focus:outline-none focus:border-[#C7A45D] flex-1 md:flex-none"
                >
                  {ALBUM_ORDER.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {comparisonData && (
              <div className="grid lg:grid-cols-3 gap-10">
                {/* 6 Metrics Comparison */}
                <div className="lg:col-span-2 bg-white/40 border border-[#E5E2E0] p-8 rounded-sm space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#8A8178] border-b border-[#E5E2E0]/40 pb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Metric Cross-Comparison
                  </h3>
                  
                  <div className="space-y-6">
                    {[
                      { label: 'Overall Mood', help: 'Higher feels more positive; lower feels heavier or sadder.', valA: comparisonData.albumA.avgSentiment, valB: comparisonData.albumB.avgSentiment, format: (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2) },
                      { label: 'Writing Density', help: 'Higher means the lyrics are wordier, more detailed, or more layered.', valA: comparisonData.albumA.avgComplexity, valB: comparisonData.albumB.avgComplexity, format: (v: number) => v.toFixed(2) },
                      { label: 'Mood Swings', help: 'Higher means the songs move more sharply between emotional highs and lows.', valA: comparisonData.albumA.avgVolatility, valB: comparisonData.albumB.avgVolatility, format: (v: number) => v.toFixed(2) },
                      { label: 'Joy and Hope Words', help: 'Counts bright words like happy, smile, hope, and love.', valA: comparisonData.albumA.avgJoy, valB: comparisonData.albumB.avgJoy, format: (v: number) => v.toFixed(2) },
                      { label: 'Sadness Words', help: 'Counts words linked to grief, tears, loneliness, and pain.', valA: comparisonData.albumA.avgSadness, valB: comparisonData.albumB.avgSadness, format: (v: number) => v.toFixed(2) },
                      { label: 'Anger and Defiance Words', help: 'Counts words linked to hurt, anger, betrayal, or fighting back.', valA: comparisonData.albumA.avgAnger, valB: comparisonData.albumB.avgAnger, format: (v: number) => v.toFixed(2) },
                    ].map(metric => {
                      const maxVal = Math.max(Math.abs(metric.valA), Math.abs(metric.valB), 0.01);
                      const widthA = `${(Math.abs(metric.valA) / maxVal) * 100}%`;
                      const widthB = `${(Math.abs(metric.valB) / maxVal) * 100}%`;

                      return (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-[#8A8178]">
                            <span>{metric.label}</span>
                            <div className="flex gap-4">
                              <span style={{ color: comparisonData.albumA.meta.color }}>A: {metric.format(metric.valA)}</span>
                              <span style={{ color: comparisonData.albumB.meta.color }}>B: {metric.format(metric.valB)}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#8A8178] leading-relaxed">{metric.help}</p>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-[#FAF9F6] relative overflow-hidden">
                              <div className="h-full transition-all duration-500" style={{ width: widthA, backgroundColor: comparisonData.albumA.meta.color }} />
                            </div>
                            <div className="h-1.5 bg-[#FAF9F6] relative overflow-hidden">
                              <div className="h-full transition-all duration-500" style={{ width: widthB, backgroundColor: comparisonData.albumB.meta.color }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Similarity Meter & Verdict Engine */}
                <div className="space-y-8">
                  {/* Similarity Meter */}
                  <div className="bg-white/40 border border-[#E5E2E0] p-8 rounded-sm text-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#8A8178] mb-6">How Similar They Feel</h3>
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="54" stroke="#E5E2E0" strokeWidth="2" fill="transparent" />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="54" 
                          stroke="#C7A45D" 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 54} 
                          strokeDashoffset={2 * Math.PI * 54 * (1 - comparisonData.similarity)} 
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-mono">{(comparisonData.similarity * 100).toFixed(1)}%</span>
                        <span className="text-[8px] uppercase tracking-widest text-[#8A8178] mt-1">Similarity</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#8A8178] italic px-4 font-medium">
                      This score compares mood, writing density, emotional swings, and repeated themes. Higher means the two albums give a more similar listening feeling.
                    </p>
                  </div>

                  {/* Verdict Engine */}
                  <div className="bg-white/40 border border-[#E5E2E0] p-8 rounded-sm relative">
                    <Quote className="absolute top-4 left-4 w-6 h-6 opacity-10 text-[#C7A45D]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#8A8178] mb-4 pl-4 font-bold">Plain-English Takeaway</h3>
                    <div className="text-xs leading-relaxed text-[#1F1B18] space-y-3 font-medium">
                      <p>
                        <span className="font-bold">{compareA}</span> and <span className="font-bold">{compareB}</span> feel <span className="font-bold font-mono">{(comparisonData.similarity * 100).toFixed(1)}%</span> similar based on the numbers here.
                      </p>
                      <p>
                        {comparisonData.albumB.avgSentiment > comparisonData.albumA.avgSentiment ? (
                          `${compareB} comes across a little brighter than ${compareA}, with more positive language overall.`
                        ) : (
                          `${compareB} comes across a little darker or more inward-looking than ${compareA}, with heavier emotional language overall.`
                        )}
                      </p>
                      <p>
                        {comparisonData.albumB.avgComplexity > comparisonData.albumA.avgComplexity ? (
                          `${compareB} also has denser writing, so its songs tend to feel a bit more layered or detailed.`
                        ) : (
                          `${compareB} uses a more direct writing style, so it may feel easier to read at a glance.`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Winner Categories / Deltas */}
            {comparisonData && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: 'Positivity Champion',
                    winner: comparisonData.albumA.avgSentiment > comparisonData.albumB.avgSentiment ? comparisonData.albumA : comparisonData.albumB,
                    desc: 'The album that feels more positive overall.',
                    metric: 'Brighter Mood'
                  },
                  {
                    title: 'More Layered Writing',
                    winner: comparisonData.albumA.avgComplexity > comparisonData.albumB.avgComplexity ? comparisonData.albumA : comparisonData.albumB,
                    desc: 'The album with denser or more detailed lyrics.',
                    metric: 'Writing Density'
                  },
                  {
                    title: 'More Emotional Swings',
                    winner: comparisonData.albumA.avgVolatility > comparisonData.albumB.avgVolatility ? comparisonData.albumA : comparisonData.albumB,
                    desc: 'The album that shifts more between highs and lows.',
                    metric: 'Mood Swings'
                  },
                  {
                    title: 'Storytelling Intensity',
                    winner: comparisonData.albumA.avgWordCount > comparisonData.albumB.avgWordCount ? comparisonData.albumA : comparisonData.albumB,
                    desc: 'The album with longer songs on average.',
                    metric: 'Word Count'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/40 border border-[#E5E2E0] p-6 rounded-sm relative group hover:bg-white transition-all shadow-xs">
                    <Award className="absolute top-4 right-4 w-5 h-5 opacity-20 text-[#C7A45D]" />
                    <span className="text-[9px] uppercase tracking-widest text-[#8A8178] block mb-2 font-bold">{item.title}</span>
                    <h4 className="font-headline text-lg italic mb-2 font-semibold" style={{ color: item.winner.meta.color }}>{item.winner.album}</h4>
                    <p className="text-xs text-[#8A8178] leading-relaxed mb-4 font-medium">{item.desc}</p>
                    <div className="h-px bg-[#E5E2E0]/40 w-full mb-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F1B18]">{item.metric} Winner</span>
                  </div>
                ))}
              </div>
            )}

            {/* Closest Era Recommendations */}
            {comparisonData && (
              <div className="grid md:grid-cols-2 gap-8 border-t border-[#E5E2E0]/40 pt-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178]">If you liked {compareA}, you would also like</h4>
                  <div className="space-y-2">
                    {comparisonData.recsA.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/40 border border-[#E5E2E0]/40 p-3 rounded-none">
                        <span className="text-xs font-bold" style={{ color: rec.color }}>{rec.album}</span>
                        <span className="text-[10px] font-bold font-mono text-[#8A8178]">{(rec.sim * 100).toFixed(1)}% match</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178]">If you liked {compareB}, you would also like</h4>
                  <div className="space-y-2">
                    {comparisonData.recsB.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/40 border border-[#E5E2E0]/40 p-3 rounded-none">
                        <span className="text-xs font-bold" style={{ color: rec.color }}>{rec.album}</span>
                        <span className="text-[10px] font-bold font-mono text-[#8A8178]">{(rec.sim * 100).toFixed(1)}% match</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3: LYRICAL MOTIF INDEX */}
          <section className="space-y-10">
            <div className="flex justify-between items-end border-b border-[#E5E2E0]/60 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E2E0] flex items-center justify-center text-xs font-bold tabular-nums">03</div>
                <div>
                  <h2 className="font-headline text-3xl uppercase tracking-tighter">Lyrical Motif Index</h2>
                  <p className="text-[11px] font-headline italic text-[#8A8178] uppercase tracking-widest mt-1">
                    Repeated words that show what each song keeps returning to.
                  </p>
                </div>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-[#8A8178]">
              Think of motifs as repeated clues. If an album uses words like love, night, pain, or forever many times, this section shows that pattern and points to the songs where it appears most.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {motifData.map(motif => {
                const isActive = motif.key === activeMotifData?.key;
                const maxTotal = Math.max(...motifData.map(item => item.total), 1);
                const barWidth = (motif.total / maxTotal) * 100;

                return (
                  <button
                    key={motif.key}
                    onClick={() => setActiveMotif(isActive ? null : motif.key)}
                    className="text-left border p-4 transition-all hover:-translate-y-0.5"
                    style={{
                      background: isActive ? '#1F1B18' : 'rgba(255,255,255,0.35)',
                      borderColor: isActive ? '#1F1B18' : '#E5E2E0',
                    }}
                  >
                    <span className="text-[9px] uppercase tracking-[0.3em] block mb-2 font-bold" style={{ color: isActive ? '#FAF9F6' : '#8A8178' }}>
                      {motif.label}
                    </span>
                    <span className="font-headline italic text-2xl block mb-3" style={{ color: isActive ? '#FAF9F6' : '#1F1B18' }}>
                      {motif.total}
                    </span>
                    <span className="h-px w-full block" style={{ background: isActive ? 'rgba(250,249,246,0.25)' : '#E5E2E0' }}>
                      <span className="h-full block" style={{ width: `${barWidth}%`, background: isActive ? '#C7A45D' : '#8A8178' }} />
                    </span>
                  </button>
                );
              })}
            </div>

            {activeMotifData && (
              <div className="bg-white/40 border border-[#E5E2E0] border-t-[#1F1B18] border-t-2 p-8 rounded-sm">
                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.35em] text-[#8A8178] block mb-3 font-bold">
                        What &quot;{activeMotifData.label}&quot; means here
                      </span>
                      <p className="font-headline italic text-xl leading-relaxed text-[#1F1B18]">
                        {activeMotifData.interp}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178] mb-4">Songs where it appears most</h3>
                      <div className="space-y-2">
                        {activeMotifData.topSongs.map(song => (
                          <button
                            key={song.title}
                            onClick={() => setActiveModalSong(song)}
                            className="w-full flex items-center justify-between gap-4 py-3 border-b border-[#E5E2E0] text-left group"
                          >
                            <span>
                              <span className="font-headline italic text-sm group-hover:underline">{song.title}</span>
                              <span className="ml-3 text-[9px] uppercase tracking-wider text-[#8A8178]">
                                {ALBUM_META[song.album]?.shortName || song.album}
                              </span>
                            </span>
                            <span className="text-xs font-mono text-[#8A8178] flex-shrink-0">
                              {(((song as Record<string, unknown>)[activeMotifData.key] as number) || 0)}x
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178] mb-4">Albums ranked by count</h3>
                    <div className="space-y-3">
                      {activeMotifData.albumCounts.slice(0, 8).map(({ album, count }) => {
                        const meta = ALBUM_META[album];
                        const topCount = activeMotifData.albumCounts[0]?.count || 1;
                        const pct = (count / topCount) * 100;

                        return (
                          <div key={album}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: meta?.color || '#8A8178' }}>
                                {meta?.shortName || album}
                              </span>
                              <span className="text-[10px] font-mono text-[#8A8178]">{count}</span>
                            </div>
                            <div className="h-px w-full bg-[#E5E2E0]">
                              <div className="h-full" style={{ width: `${pct}%`, background: meta?.color || '#8A8178' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* ERA PROFILE DRAWER */}
      <AnimatePresence>
        {activeDrawerAlbum && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlbumForDrawer(null)}
              className="fixed inset-x-0 top-20 bottom-0 bg-[#1F1B18] z-[9998] cursor-pointer"
            />
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
              className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-[480px] max-w-full bg-[#FAF9F6] border-l border-[#E5E2E0] shadow-2xl z-[9999] overflow-y-auto p-10 space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A8178] block mb-1 font-bold">
                    Era Archive Profile — {activeDrawerAlbum.meta.year}
                  </span>
                  <h2 className="font-headline text-3xl italic font-semibold" style={{ color: activeDrawerAlbum.meta.color }}>
                    {activeDrawerAlbum.album}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedAlbumForDrawer(null)}
                  className="p-1 hover:bg-[#E5E2E0]/40 rounded-full transition-colors"
                >
                  <Maximize2 className="w-5 h-5 transform rotate-45 text-[#8A8178]" />
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 border-y border-[#E5E2E0]/60 py-6 text-center">
                <div>
                  <span className="text-xl font-bold font-mono">{(activeDrawerAlbum.avgSentiment >= 0 ? '+' : '') + activeDrawerAlbum.avgSentiment.toFixed(2)}</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8178] block mt-1 font-bold">Avg Sentiment</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono">{activeDrawerAlbum.avgComplexity.toFixed(2)}</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8178] block mt-1 font-bold">Lyrical Density</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono">{activeDrawerAlbum.avgVolatility.toFixed(2)}</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8178] block mt-1 font-bold">Volatility</span>
                </div>
              </div>

              {/* Keyword Thematic Densities */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178]">Thematic Keyword Densities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Love references', val: activeDrawerAlbum.loveDensity * 1000 },
                    { label: 'Night imagery', val: activeDrawerAlbum.nightDensity * 1000 },
                    { label: 'Nature elements', val: activeDrawerAlbum.natureDensity * 1000 },
                    { label: 'Color palettes', val: activeDrawerAlbum.colorDensity * 1000 },
                    { label: 'Time & Memory', val: activeDrawerAlbum.timeDensity * 1000 },
                    { label: 'Relationships', val: activeDrawerAlbum.relDensity * 1000 },
                  ].map((theme, i) => (
                    <div key={i} className="bg-white/40 border border-[#E5E2E0]/40 p-3 rounded-none">
                      <span className="text-[9px] uppercase tracking-widest text-[#8A8178] block mb-1 font-bold">{theme.label}</span>
                      <div className="flex justify-between items-end">
                        <div className="h-1 bg-[#E5E2E0] w-24 overflow-hidden mb-1">
                          <div className="h-full bg-[#1F1B18]" style={{ width: `${Math.min(theme.val * 3, 100)}%` }} />
                        </div>
                        <span className="text-xs font-bold font-mono">{(theme.val).toFixed(1)}‰</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Songs */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178]">Key Lyrical Artifacts</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Most Positive Sentiment', song: activeDrawerAlbum.mostPositiveSong, val: activeDrawerAlbum.mostPositiveSong?.roberta_compound.toFixed(2), suffix: '' },
                    { label: 'Most Negative Sentiment', song: activeDrawerAlbum.mostNegativeSong, val: activeDrawerAlbum.mostNegativeSong?.roberta_compound.toFixed(2), suffix: '' },
                    { label: 'Most Complex Writing', song: activeDrawerAlbum.mostComplexSong, val: activeDrawerAlbum.mostComplexSong?.complexity.toFixed(2), suffix: ' score' },
                    { label: 'Most Emotionally Volatile', song: activeDrawerAlbum.mostVolatileSong, val: activeDrawerAlbum.mostVolatileSong?.volatility.toFixed(2), suffix: ' score' },
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => item.song && setActiveModalSong(item.song)}
                      className="flex justify-between items-center bg-white/60 hover:bg-white border border-[#E5E2E0]/60 p-3 rounded-none cursor-pointer transition-all hover:border-[#C7A45D]"
                    >
                      <div>
                        <span className="text-[8px] uppercase tracking-widest text-[#8A8178] block mb-0.5 font-bold">{item.label}</span>
                        <span className="text-xs font-bold font-headline italic">{item.song?.title || 'None found'}</span>
                      </div>
                      <span className="text-[10px] font-bold font-mono bg-[#F7F4EE] px-2 py-1 border border-[#E5E2E0]/50 rounded-sm">
                        {item.val}{item.suffix}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Report Card */}
              <div className="bg-[#FAF9F6] border border-[#E5E2E0] p-6 rounded-none relative">
                <Quote className="absolute top-4 left-4 w-5 h-5 opacity-10 text-[#C7A45D]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8178] mb-3 pl-4 font-bold">Observatory Note</h3>
                <p className="text-xs leading-relaxed text-[#1F1B18] font-medium">
                  {activeDrawerAlbum.album} ({activeDrawerAlbum.meta.year}) showcases an average sentiment index of <span className="font-bold">{activeDrawerAlbum.avgSentiment.toFixed(2)}</span> with {activeDrawerAlbum.songsCount} recorded song documents. The thematic analysis shows a distinct focus on <span className="font-bold">{(activeDrawerAlbum.loveDensity * 1000).toFixed(1)}‰ love metrics</span> and <span className="font-bold">{(activeDrawerAlbum.timeDensity * 1000).toFixed(1)}‰ temporal themes</span>, mapping out a unique coordinates matrix in the emotional atlas.
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EXHIBIT MODAL */}
      <ExhibitModal 
        song={activeModalSong}
        isOpen={activeModalSong !== null}
        onClose={() => setActiveModalSong(null)}
      />

    </div>
  );
}
