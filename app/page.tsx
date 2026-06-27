import Link from 'next/link';
import { ArrowRight, Search, BarChart3, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import BackgroundShader from '@/components/BackgroundShader';

export default function Home() {
  const eras = [
    {
      id: '01',
      name: 'Taylor Swift',
      year: '2006',
      acronym: 'TS',
      tagline: 'The Country Genesis',
      badgeColor: 'bg-[#d3e7de] text-[#43554e]',
      cardBg: 'bg-white',
      image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Taylor_Swift_-_Taylor_Swift.png',
      spotifyUrl: 'https://open.spotify.com/album/7mzrIsaAjnXihW3InKjlC3'
    },
    {
      id: '02',
      name: 'Fearless',
      year: '2008',
      acronym: 'F',
      tagline: 'Golden Storytelling',
      badgeColor: 'bg-[#f3e0c2] text-[#6a5d45]',
      cardBg: 'bg-white',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/86/Taylor_Swift_-_Fearless.png',
      spotifyUrl: 'https://open.spotify.com/album/4hDok0OAJd57SGIT8xuWJH'
    },
    {
      id: '03',
      name: 'Speak Now',
      year: '2010',
      acronym: 'SN',
      tagline: 'The Self-Written Fairytale',
      badgeColor: 'bg-[#f3dbf2] text-[#6b596b]',
      cardBg: 'bg-white',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Taylor_Swift_-_Speak_Now_cover.png',
      spotifyUrl: 'https://open.spotify.com/album/5AEDGbliTTfjOB8TSm1sxt'
    },
    {
      id: '04',
      name: 'Red',
      year: '2012',
      acronym: 'R',
      tagline: 'Autumnal Heartbreak',
      badgeColor: 'bg-red-100 text-red-800',
      cardBg: 'bg-white',
      image: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Taylor_Swift_-_Red.png',
      spotifyUrl: 'https://open.spotify.com/album/6kZ42qRrzov54LcAk4onW9'
    },
    {
      id: '05',
      name: '1989',
      year: '2014',
      acronym: '89',
      tagline: 'The Pop Renaissance',
      badgeColor: 'bg-blue-100 text-blue-800',
      cardBg: 'bg-white',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3nrrU0lK_NfcFjc5TnnV5nwL0sx4KKrgJRxyHe2mhK2kI82LDAcWecirP&s=10',
      spotifyUrl: 'https://open.spotify.com/album/1yGbNOtRIgdIiGHOEBaZWf'
    },
    {
      id: '06',
      name: 'Reputation',
      year: '2017',
      acronym: 'REP',
      tagline: 'The Dark Reinvention',
      badgeColor: 'bg-white/20 text-white',
      cardBg: 'bg-[#1b1c1a] text-white',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRdlaoIHsNSyToLCUuYDC0mkWgpCKgQKppomcPYocEacikIsq_Ztgd6Ds&s=10',
      spotifyUrl: 'https://open.spotify.com/album/6DEjYFkNZh67HP7R9PSZvv'
    },
    {
      id: '07',
      name: 'Lover',
      year: '2019',
      acronym: 'L',
      tagline: 'A love letter to love',
      badgeColor: 'bg-[#dbdad6] text-[#1b1c1a]',
      cardBg: 'bg-[#feecf2] text-neutral-800',
      image: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Taylor_Swift_-_Lover.png',
      spotifyUrl: 'https://open.spotify.com/album/6DEjYFkNZh67HP7R9PSZvv'
    },
    {
      id: '08',
      name: 'folklore', // Note: Title is stylistically kept in all lowercase
      year: '2020',
      acronym: 'F',
      tagline: 'In isolation my imagination has run wild',
      badgeColor: 'bg-stone-500/20 text-stone-200',
      cardBg: 'bg-[#2b2b2a] text-[#f4f4f0]',
      image: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Taylor_Swift_-_Folklore.png',
      spotifyUrl: 'https://spotify.com'

    },
    {
      id: '09',
      name: 'evermore', // Note: Title is stylistically kept in all lowercase
      year: '2020',
      acronym: 'E',
      tagline: 'We couldn’t stop writing songs',
      badgeColor: 'bg-amber-800/20 text-amber-200',
      cardBg: 'bg-[#36271c] text-[#f7f4eb]', // Warm, flannel brown and cream cottagecore aesthetic
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSI2PtTOlo-4kxOLqiWv6KzqE1CwefRbDA9Q&s',
      spotifyUrl: 'https://spotify.com'

    },
    {
      id: '10',
      name: 'Midnights',
      year: '2022',
      acronym: 'M',
      tagline: 'Meet me at midnight',
      badgeColor: 'bg-indigo-900/40 text-indigo-200',
      cardBg: 'bg-[#0f111a] text-[#e0e4f0]', // Dark, midnight blue and star-lit silver aesthetic
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYyLBAUSekHazkzbCq0tTIvSozxa25B0ovnA&s',
      spotifyUrl: 'https://spotify.com'

    },

    {
      id: '11',
      name: 'TTPD',
      year: '2024',
      acronym: 'TTPD',
      tagline: 'The Literary Confession',
      badgeColor: 'bg-[#dbdad6] text-[#1b1c1a]',
      cardBg: 'bg-[#faf9f5]',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX_PvJIaV6iOgb3GpLjl1Dhdz3WYcVC0OtBtKlQAz5BytNOt7BmICFrunp&s=10',
      spotifyUrl: 'https://open.spotify.com/album/5H7ixXZfsNMGbIE5OBSpcb'
    },
    {
      id: '12',
      name: 'The Life of a Showgirl',
      year: '2025',
      acronym: 'TLOAS', // Alternatively shortened by fans as "Showgirl"
      tagline: 'What was going on behind the scenes in my inner life',
      badgeColor: 'bg-orange-500/20 text-orange-200',
      cardBg: 'bg-[#18312a] text-[#fbf5e9]', // The album's mint green and Portofino orange-glitter aesthetic
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXJYxAm1P3XfODRxraq2DvnZunRGYS_smORA&s',
      spotifyUrl: 'https://open.spotify.com/album/4a6NzYL1YHRUgx9e3YZI6I'

    },

    {
      id: '14',
      name: 'Toy Story 5',
      year: '2026',
      acronym: 'TS5',
      tagline: 'Pure Pixar Nostalgia',
      badgeColor: 'bg-orange-100 text-orange-800',
      cardBg: 'bg-gradient-to-br from-white to-orange-50',
      isNew: true,
      image: 'https://images.fmdb.net/rAiphoHxfVLz3nFreD1Pbpp61TNC6kCdsR7yXSWIwRM/resize:fill:800:0:true/czM6Ly9mbWRiLXBy/b2QvcmVsZWFzZXMv/Ni85LzkvNC84Lzcv/Yy8zLzZhMzEyNWYx/MDVmZjU2OTI4MzQx/MDEuanBn',
      spotifyUrl: '#'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqxgs3tR4iB8qs-53rsIL5DCfFVUXLfgz10R1_oS6W6WjLbNClyimWYcHLviZpWkde-U0XRZVAMNp0ZTQAzbCbzzs7379c2pOsTsCX_Xa9Id9QOuqPE7Q3Ew_8Gv7tACtc45gOGlV2geYIQ0o-ZVpbcOxz2N3raYYjQ4logBM0sramvD8mQDBKnFwxF_8VimwSe1S1zofT_WeYAtmSKFGA0mTIOVVSRqE4DPGC3TgGaGM8zBLr6WnCBbofDds3Jkntvt9j8AFzlw')" }}></div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay">
            <BackgroundShader />
          </div>
        </div>

        <div className="relative z-10 text-center px-margin-mobile max-w-4xl">
          <h1 className="font-bodoni text-7xl md:text-8xl text-white mb-stack-sm reveal-text italic font-bold">
            The Swift Journal
          </h1>
          <p className="font-dm-sans text-xl md:text-2xl text-white/80 mb-stack-md max-w-2xl mx-auto reveal-text">
            Explore 179 songs across 14 albums through AI-powered emotional analysis. A cinematic archive for the dedicated listener.
          </p>
          <div className="flex flex-col md:flex-row gap-gutter justify-center reveal-text">
            <Link href="#archives" className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">
              Start Exploring
            </Link>
            <Link href="#insights" className="backdrop-blur-md bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
              View Analysis
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ChevronDown className="text-white w-12 h-12" />
        </div>
      </section>

      {/* The Eras Archive */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface" id="archives">
        <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-gutter">
          <div>
            <span className="text-primary font-dm-sans font-bold text-xs tracking-widest block mb-2 uppercase">Collection One</span>
            <h2 className="font-bodoni text-5xl md:text-6xl italic">Museum Exhibits</h2>
          </div>
          <p className="font-dm-sans text-on-surface-variant max-w-md text-lg">
            Every era defined by a distinct sonic landscape and aesthetic evolution. Select an exhibit to dive deep into the lyrical DNA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {eras.map((era) => (
            <a
              key={era.id}
              href={era.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`museum-card glassmorphism p-8 rounded-lg aspect-[3/4] flex flex-col justify-between group cursor-pointer ${era.cardBg}`}
            >
              <div className="flex justify-between items-start">
                <span className={`era-badge ${era.badgeColor}`}>Era {era.id} {era.isNew && "• NEW"}</span>
                <span className="font-dm-sans font-bold text-xs opacity-50 tracking-widest">{era.year}</span>
              </div>

              <div className="text-center py-stack-md flex-grow flex items-center justify-center">
                <img
                  className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-700"
                  src={era.image}
                  alt={era.name}
                />
              </div>

              <div>
                <h3 className="font-bodoni font-bold text-2xl mb-1">{era.name}</h3>
                <p className="font-dm-sans text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">{era.tagline}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Research & Insights Section */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-low border-y border-outline-variant/20" id="insights">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-1">
            <span className="text-primary font-dm-sans font-bold text-xs tracking-widest block mb-4 uppercase">Data Methodology</span>
            <h2 className="font-bodoni text-5xl mb-stack-md leading-tight">
              Decoding the <br />
              <span className="italic text-primary text-7xl inline-block mt-2">Lyrics</span>
            </h2>
            <p className="font-dm-sans text-on-surface-variant text-lg">
              We utilize advanced NLP models (RoBERTa) to map the emotional trajectory of every verse Taylor has ever written. Our research highlights the intersection of poetry and pop culture through a data-driven lens.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Research Card 1 */}
            <Link href="/search" className="bg-surface glassmorphism p-10 rounded-lg flex flex-col justify-between hover:shadow-xl transition-all border border-outline-variant/30 group">
              <div>
                <Search className="text-primary mb-6 w-10 h-10" />
                <h4 className="font-bodoni font-bold text-2xl mb-4">Keyword Explorer</h4>
                <p className="font-dm-sans text-on-surface-variant leading-relaxed">Deep-dive into recurring motifs: "Midnights", "Rain", and "Red". Track how themes evolve from 2006 to 2026.</p>
              </div>
              <div className="mt-stack-sm flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                Launch Explorer <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Research Card 2 */}
            <Link href="/sentiment" className="bg-surface glassmorphism p-10 rounded-lg flex flex-col justify-between hover:shadow-xl transition-all border border-outline-variant/30 group">
              <div>
                <BarChart3 className="text-primary mb-6 w-10 h-10" />
                <h4 className="font-bodoni font-bold text-2xl mb-4">Emotional Map</h4>
                <p className="font-dm-sans text-on-surface-variant leading-relaxed">Visualizing the emotional highs and lows. See the shift from teenage melancholy to adult introspection.</p>
              </div>
              <div className="mt-stack-sm flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                View Visualizations <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-[#2f312e] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <BackgroundShader />
        </div>
        <div className="relative z-10 text-center px-margin-mobile">
          <h2 className="font-bodoni text-6xl md:text-7xl text-white mb-stack-md italic font-bold">Ready to Dive Into <br />The Lyrics?</h2>
          <Link href="/search" className="bg-primary text-on-primary px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all transform hover:scale-110 inline-block shadow-2xl">
            Open The Vault
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
        <div>
          <div className="font-bodoni font-bold text-3xl text-on-surface mb-2">The Swift Journal</div>
          <p className="text-on-surface-variant font-dm-sans text-base">© 2026 The Swift Journal. Built for the Eras.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end">
          <Link className="text-on-surface-variant hover:text-primary font-dm-sans text-sm transition-all hover:underline decoration-primary/30 underline-offset-4" href="#">Editorial Policy</Link>
          <Link className="text-on-surface-variant hover:text-primary font-dm-sans text-sm transition-all hover:underline decoration-primary/30 underline-offset-4" href="#">Era Archive</Link>
          <Link className="text-on-surface-variant hover:text-primary font-dm-sans text-sm transition-all hover:underline decoration-primary/30 underline-offset-4" href="#">Data Methodology</Link>
          <Link className="text-on-surface-variant hover:text-primary font-dm-sans text-sm transition-all hover:underline decoration-primary/30 underline-offset-4" href="#">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
