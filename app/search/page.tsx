'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlayCircle, Star, ChevronRight, Hash, Clock, ArrowLeft } from 'lucide-react';
import ExhibitModal from '@/components/ExhibitModal';
import { Song } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Fan Favorite heuristics
const FAN_FAVORITES = [
  "Blank Space", "All Too Well", "Cruel Summer", "Love Story", "Shake It Off",
  "Anti-Hero", "Cardigan", "Willow", "August", "Champagne Problems",
  "Style", "Wildest Dreams", "Enchanted", "Delicate", "Don't Blame Me"
];

// Static Themes (Discovery Bento Grid)
const THEMES = [
  { id: 'heartbreak', title: 'Heartbreak', num: '01', sentiment: 'Sentiment', color: 'text-error', bg: 'bg-error-container/10', keywords: ['love', 'heart', 'baby', 'darling', 'kiss', 'lover', 'romance'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADXH2ayopw6pt6KWpmHQ0NleCSqOPLNPY0YykNcfglFBWJOXLtFlcZSyPWjLNpMXlC1S0EHfGdAHEmDT7nXhGMILNcT837ygMR-FtenPzg2aB6rymMYZtUXuNJimP1KACkrHWqQ6xlTK252kd29SLqfq8v5zBHV6SVt2kLIY9ptNj0csnJgCBOkhdRo8SEnhM-9UcImy39JiZq6W7i02LlY7hNFo6aoZ__QhtCrhfPAFA2SePY4kxogXruxhdwMh1SCOnor6n9F9k', desc: 'Fragments of shattered promises and the heavy silence of a room once filled with laughter.' },
  { id: 'midnights', title: 'Midnights', num: '02', sentiment: 'Hour', color: 'text-tertiary', bg: 'bg-tertiary-container/20', keywords: ['midnight', 'night', 'dark', 'moon', 'time'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7u6xCEgJn7SpQwgUpcFO-sNg35QO2aNZLId-Wn9gCB_saepN_E73IbvDuazeX0KWuharzC1eAznLVtZiAwxenOfhv1LLZv80zwlKwtcjxUmLBsfYlJDIEcNneGDsY992AzEt-lUARb9JaH7dsiVvyH3I0ktJ5xWTTiFocErPbipnIav9_PVziUdyIXh9322-iFchX72GfrOqz9gDTKO6XXR0cPCRWy5UZ_zC6oQYQ1RZY3ip9-cD3KQ_j2V8ksLhwAjs6mCKx8PE', desc: 'The stories we tell ourselves when the world is fast asleep.' },
  { id: 'dreams', title: 'Dreams', num: '03', sentiment: 'Vision', color: 'text-secondary', bg: 'bg-secondary-container/10', keywords: ['dream', 'fantasy', 'wonder', 'magic', 'impossible'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgUGkKKnrbJ94o869UPQXyaQFlnocYDjjN8HWp_ZzkV_azbdBZD6ljvSM9zsCoP4NrEtjPU2Cpqq7CoLrVtTlAZM6Uf5dxKR4z5U2PLzFTaP2kdajWLZNI3XLEDRVZKmn3RGgbvmTOx7WYmgiQXKm0DR78FJVadVVqvI-WBq_qQ-vhIl4yQUNA4_rg21Uldihrg_ZHFtBgfwe5IDPqrN-vFguOLbP-cqKaNWV4BsQg0xPUPTLnnjvV0auMTpFLmt5VCCeL3RNx4wE', desc: 'Where reality fades and the impossible begins to breathe.' },
  { id: 'time', title: 'Time', num: '04', sentiment: 'Continuum', color: 'text-primary', bg: 'bg-primary-container/20', keywords: ['forever', 'never', 'always', 'memory', 'time', 'past'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNwtWq9eIilWzNPkTc4BwydC6YpNc2hneAaul4ZNW73ZxiCk1-dSkOxH8JdDCQsvWam6hSYcFQsVuKtnb9Aye_rdf-9BtXbjy3yrZqHx67HZDkprECjGcNGb8OY18JWbpRmBmfcd_PuvwkELgDenLrUoiDmakMEsiWNFPyiP-00bTfjvEy9AQIxmsGVT7fxk3J_NP65BGN781MuvJFMpI57QzGpoVpqdXqoXeyrkdgC10-8zc5seRAqHQ638TNuMnc4BcZ17DvBKQ', desc: 'The relentless river that carries our memories from the past into the forever.' }
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);

  const [isVaultSearch, setIsVaultSearch] = useState(false);
  const [vaultResults, setVaultResults] = useState<{ title: string, score: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

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

  useEffect(() => {
    if (!isVaultSearch || !searchTerm.trim()) {
      setVaultResults([]);
      setIsBlocked(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch('/api/vault-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchTerm })
        });
        const data = await response.json();
        if (data.status === 'success') {
          setVaultResults(data.matches);
          setIsBlocked(false);
        } else if (data.status === 'blocked') {
          setVaultResults([]);
          setIsBlocked(true);
          setBlockMessage(data.message);
        }
      } catch (error) {
        console.error('Vault search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm, isVaultSearch]);

  // Reset expanded album when search term changes to show global results
  useEffect(() => {
    if (searchTerm) setExpandedAlbum(null);
  }, [searchTerm]);

  const filteredSongs = useMemo(() => {
    let baseResults = songs;

    // 1. Handle Vault Search results first if active
    if (isVaultSearch && vaultResults.length > 0) {
      const matchTitles = vaultResults.map(r => r.title.toLowerCase());
      baseResults = songs.filter(s => matchTitles.includes(s.title.toLowerCase()));
      // Sort by semantic score
      return [...baseResults].sort((a, b) => {
        const scoreA = vaultResults.find(r => r.title.toLowerCase() === a.title.toLowerCase())?.score || 0;
        const scoreB = vaultResults.find(r => r.title.toLowerCase() === b.title.toLowerCase())?.score || 0;
        return scoreB - scoreA;
      });
    }

    // 2. Fallback to Classic Search (Keyword matching)
    if (!searchTerm && selectedKeywords.length === 0) return baseResults;

    const term = searchTerm.toLowerCase().trim();
    // Use word-boundary regex to avoid matching partial words (e.g., "red" in "remembered")
    const wordRegex = term ? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : null;

    return baseResults.filter(song => {
      const inLyrics = wordRegex ? wordRegex.test(song.lyrics) : false;
      const inTitle = wordRegex ? wordRegex.test(song.title) : false;
      const inAlbum = wordRegex ? wordRegex.test(song.album) : false;

      const hasAllKeywords = selectedKeywords.length > 0
        ? selectedKeywords.every(keyword => {
          if (song[keyword] > 0) return true;
          return song.lyrics.toLowerCase().includes(keyword.toLowerCase());
        })
        : true;

      return (inLyrics || inTitle || inAlbum) && hasAllKeywords;
    });
  }, [searchTerm, selectedKeywords, songs, isVaultSearch, vaultResults]);

  // Group by Album logic
  const albumGroups = useMemo(() => {
    const groups: { [key: string]: { songs: Song[], year: number } } = {};
    filteredSongs.forEach(song => {
      if (!groups[song.album]) {
        groups[song.album] = { songs: [], year: song.year };
      }
      groups[song.album].songs.push(song);
    });
    return Object.entries(groups).sort((a, b) => b[1].year - a[1].year);
  }, [filteredSongs]);

  const handleThemeClick = (keywords: string[]) => {
    setSelectedKeywords(keywords);
    setExpandedAlbum(null);
    const exhibits = document.getElementById('exhibits-section');
    if (exhibits) exhibits.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-headline text-2xl italic animate-pulse">Opening the Vault...</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="pt-32 pb-24">
        {/* Hero & Search Sections (Omitted for brevity, kept exactly same as previous) */}
        <section className="max-w-container-max mx-auto px-margin-desktop text-center mb-20">
          <h1 className="font-headline text-6xl md:text-[64px] text-on-surface mb-6 uppercase tracking-[0.2em] opacity-90 leading-tight">
            THE LYRIC VAULT
          </h1>
          <p className="font-headline text-2xl text-on-surface-variant italic max-w-3xl mx-auto leading-relaxed">
            Explore {songs.length} songs and 14 eras of lyrical history.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-margin-mobile mb-32">
          <div className="relative group">
            <div className="absolute inset-0 bg-secondary-container/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative bg-surface/60 backdrop-blur-md border border-outline-variant/50 p-2 rounded-full flex items-center gap-2 shadow-sm">
              <div className="flex bg-surface-container rounded-full p-1 gap-1">
                <button
                  onClick={() => setIsVaultSearch(false)}
                  className={`px-6 py-2 rounded-full font-body text-xs font-bold uppercase tracking-widest transition-all duration-300 ${!isVaultSearch
                    ? 'bg-on-surface text-surface shadow-md scale-105'
                    : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                    }`}
                >
                  Classic Search
                </button>
                <button
                  onClick={() => setIsVaultSearch(true)}
                  className={`px-6 py-2 rounded-full font-body text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${isVaultSearch
                    ? 'bg-primary text-on-primary shadow-md scale-105'
                    : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                    }`}
                >
                  Vault Search
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                </button>
              </div>
              <input
                type="text"
                placeholder={isVaultSearch ? "Search by theme (e.g. 'growing up')..." : "Search for a song, album, or lyric..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value && selectedKeywords.length > 0) {
                    setSelectedKeywords([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const el = document.getElementById('exhibits-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex-grow bg-transparent border-none focus:ring-0 font-body text-on-surface px-4 py-2 placeholder:text-outline italic"
              />
              <div
                className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/90 transition-all cursor-pointer"
                onClick={() => {
                  const el = document.getElementById('exhibits-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined">search</span>}
              </div>
            </div>
          </div>
          {searchTerm && !isBlocked && (
            <div className="mt-4 text-center">
              <span className="font-body text-xs text-on-surface-variant">
                Found <span className="font-bold text-primary">{filteredSongs.length}</span> artifacts across <span className="font-bold text-primary">{albumGroups.length}</span> collections — <button onClick={() => { const el = document.getElementById('exhibits-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="underline text-primary hover:opacity-70 transition-opacity">View Results ↓</button>
              </span>
            </div>
          )}

          {/* Vault Search — Dedicated Ranked Results Panel */}
          <AnimatePresence>
            {isVaultSearch && isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 bg-error-container/30 backdrop-blur-sm border border-error/20 rounded-lg p-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-error mb-2">
                  <span className="material-symbols-outlined">warning</span>
                  <span className="font-body text-xs font-bold uppercase tracking-widest">Safety Notice</span>
                </div>
                <p className="font-body text-sm text-on-error-container">{blockMessage}</p>
              </motion.div>
            )}

            {isVaultSearch && vaultResults.length > 0 && !isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 bg-white/70 backdrop-blur-sm border border-outline-variant/30 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="px-8 py-5 border-b border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                    <span className="font-body text-xs font-bold uppercase tracking-[0.3em] text-on-surface">AI Vault Results</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{vaultResults.length} matches</span>
                  </div>
                  <span className="font-body text-[10px] text-outline italic">Ranked by semantic relevance</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {vaultResults.map((result, idx) => {
                    const song = songs.find(s => s.title.toLowerCase() === result.title.toLowerCase());
                    const confidencePct = Math.round(result.score * 100);
                    return (
                      <div key={result.title} className="flex items-center gap-6 px-8 py-4 hover:bg-surface-container-low/50 transition-colors group">
                        <span className="font-body text-xs font-bold text-outline/30 tabular-nums w-6">{idx + 1}</span>
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-headline text-lg italic group-hover:text-primary transition-colors">{result.title}</h4>
                            {FAN_FAVORITES.includes(result.title) && (
                              <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-yellow-500/20">
                                <Star className="w-2 h-2 fill-yellow-500" /> Fan Favorite
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-body text-[10px] text-outline uppercase tracking-widest">{song?.album ?? '—'} · {song?.year ?? ''}</span>
                            <div className="flex-grow h-[2px] bg-outline-variant/20 rounded-full max-w-[120px]">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${confidencePct}%` }}></div>
                            </div>
                            <span className="font-body text-[10px] text-primary font-bold tabular-nums">{confidencePct}%</span>
                          </div>
                        </div>
                        {song && (
                          <button
                            onClick={() => { setSelectedSong(song); setIsModalOpen(true); }}
                            className="font-body text-[9px] font-bold uppercase tracking-widest border border-outline-variant/50 px-4 py-2 hover:border-primary hover:text-primary transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            Analyse
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Discovery Themes (Bento Grid) */}
        <section className="max-w-container-max mx-auto px-margin-desktop mb-40">
          <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-6">
            <div>
              <span className="font-body text-xs font-bold uppercase tracking-[0.3em] text-outline">Discovery</span>
              <h2 className="font-headline text-3xl mt-2">Curated Themes</h2>
            </div>
            <button className="font-body text-sm italic hover:text-primary transition-colors flex items-center gap-2">
              View All Archives <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto">
            {THEMES.map((theme, idx) => (
              <div
                key={theme.id}
                onClick={() => handleThemeClick(theme.keywords)}
                className={`${idx % 3 === 0 ? 'md:col-span-8' : 'md:col-span-4'} group relative overflow-hidden ${theme.bg} border border-outline-variant/30 rounded-lg aspect-[16/9] md:aspect-auto cursor-pointer h-full`}
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url('${theme.img}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 md:p-10">
                  <span className={`font-body text-xs font-bold ${theme.color} uppercase tracking-widest mb-2 block`}>{theme.num} — {theme.sentiment}</span>
                  <h3 className="font-headline text-4xl mb-4">{theme.title}</h3>
                  <p className="font-body text-sm text-on-surface-variant max-w-md opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    {theme.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exhibits Section: ALbum Centric */}
        <section id="exhibits-section" className="bg-surface-container-low py-32 overflow-hidden min-h-[600px]">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-24">
              <h2 className="font-headline text-5xl md:text-6xl mb-4 italic">The Exhibits</h2>
              <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
                Discover songs organized by their era and album entry.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {albumGroups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="font-headline text-2xl italic text-outline mb-4">No artifacts found in the Vault matching your query.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedKeywords([]); }}
                    className="font-body text-xs font-bold uppercase tracking-widest border-b border-primary text-primary"
                  >
                    Reset Archive Search
                  </button>
                </motion.div>
              ) : !expandedAlbum ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {albumGroups.map(([albumName, data]) => (
                    <div
                      key={albumName}
                      onClick={() => setExpandedAlbum(albumName)}
                      className="group relative cursor-pointer"
                    >
                      <div className="deckled-edge bg-white p-10 shadow-sm border border-outline-variant/30 transition-all group-hover:rotate-[-1.5deg] group-hover:shadow-2xl h-[300px] flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center select-none pointer-events-none">
                          <span className="font-headline text-[180px] tracking-tighter uppercase">{albumName.charAt(0)}</span>
                        </div>
                        <div className="relative z-10 w-full">
                          <span className="font-body text-[10px] font-bold text-outline tracking-[0.4em] uppercase mb-6 block">Collection Era</span>
                          <h3 className="font-headline text-4xl italic leading-tight mb-2">{albumName}</h3>
                          <div className="h-[1px] w-12 bg-primary/20 mx-auto mt-6"></div>
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 px-10 flex justify-between items-center">
                          <span className="font-body text-[10px] font-bold text-outline tracking-widest uppercase">{data.year}</span>
                          <div className="flex flex-col items-end gap-2">
                            {data.songs.some(s => FAN_FAVORITES.includes(s.title)) && (
                              <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border border-yellow-500/20">
                                <Star className="w-2 h-2 fill-yellow-500" /> Top Tier
                              </span>
                            )}
                            <span className="font-body text-[10px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                              {data.songs.length} Entries <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white/80 p-12 md:p-20 shadow-2xl border border-outline-variant/20 rounded-sm paper-grain relative"
                >
                  <button
                    onClick={() => setExpandedAlbum(null)}
                    className="absolute top-10 left-10 flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Archives
                  </button>

                  <div className="text-center mb-20 pt-10">
                    <span className="font-body text-xs font-bold text-primary uppercase tracking-[0.5em] mb-4 block">Archive Collection</span>
                    <h3 className="font-headline text-6xl italic mb-6">{expandedAlbum}</h3>
                    <div className="h-[1px] w-32 bg-outline-variant/50 mx-auto"></div>
                  </div>

                  <div className="max-w-4xl mx-auto divide-y divide-outline-variant/20">
                    {albumGroups.find(([name]) => name === expandedAlbum)?.[1].songs.map((song, idx) => (
                      <div
                        key={song.title}
                        className="group flex flex-col md:flex-row justify-between items-center py-8 hover:bg-surface-container-low transition-colors px-6 -mx-6"
                      >
                        <div className="flex items-center gap-8 mb-6 md:mb-0">
                          <span className="font-body text-xs font-bold text-outline/30 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-headline text-2xl italic group-hover:text-primary transition-colors">{song.title}</h4>
                              {FAN_FAVORITES.includes(song.title) && (
                                <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-yellow-500/30 shadow-sm animate-pulse">
                                  <Star className="w-3 h-3 fill-yellow-500" /> Fan Favorite
                                </span>
                              )}
                            </div>
                            <p className="font-body text-xs text-outline tabular-nums mt-1 uppercase tracking-widest">
                              Sentiment: {song.roberta_compound > 0 ? '+' : ''}{song.roberta_compound.toFixed(2)} — {song.word_count} Words
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <PlayCircle className="w-6 h-6 text-outline/20 group-hover:text-primary transition-colors cursor-pointer" />
                          <button
                            onClick={() => {
                              setSelectedSong(song);
                              setIsModalOpen(true);
                            }}
                            className="font-body text-[10px] font-bold uppercase tracking-widest border border-primary px-8 py-3 hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                          >
                            Audit Lyrical DNA
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="w-full py-16 px-margin-desktop bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end max-w-container-max mx-auto">
          <div>
            <div className="font-headline text-3xl italic text-primary mb-4">The Archive</div>
            <p className="font-body text-sm text-on-surface-variant max-w-sm mb-6">
              A digital sanctum for lyrical preservation and intellectual study.
            </p>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-outline">
              <a className="hover:text-primary transition-colors" href="#">Guidelines</a>
              <a className="hover:text-primary transition-colors" href="#">Copyright</a>
              <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            </div>
          </div>
          <div className="text-right">
            <div className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-4">© 2024 Lyrical Archive. Curated with reverence.</div>
            <div className="flex justify-end gap-3">
              <div className="w-8 h-8 border border-outline-variant/50 rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-xs">public</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ExhibitModal
        song={selectedSong}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        keyword={searchTerm}
      />
    </div>
  );
}