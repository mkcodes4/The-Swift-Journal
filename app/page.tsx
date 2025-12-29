import Link from 'next/link';
import { ArrowRight, Music, BarChart3, Search, TrendingUp, Sparkles, Heart, Star } from 'lucide-react';

export default function Home() {
  const eras = [
    {
      name: 'Taylor Swift',
      acronym: 'TS',
      year: '2006',
      description: 'Country beginnings and teenage dreams',
      colors: 'from-blue-200 to-pink-200',
      gradient: 'from-sky-200/80 to-pink-200/80',
      hoverInfo: 'Most Positive Song: Our Song',
      image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Taylor_Swift_-_Taylor_Swift.png',
      spotifyUrl: 'https://open.spotify.com/album/7mzrIsaAjnXihW3InKjlC3'
    },
    {
      name: 'Fearless',
      acronym: 'F',
      year: '2008',
      description: 'Golden age of country pop',
      colors: 'from-yellow-200 to-orange-200',
      gradient: 'from-yellow-200/80 to-orange-200/80',
      hoverInfo: 'Most Streamed Track: Love Story',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/86/Taylor_Swift_-_Fearless.png',
      spotifyUrl: 'https://open.spotify.com/album/4hDok0OAJd57SGIT8xuWJH'
    },
    {
      name: 'Speak Now',
      acronym: 'SN',
      year: '2010',
      description: 'Self-written fairy tales',
      colors: 'from-purple-200 to-pink-200',
      gradient: 'from-purple-200/80 to-pink-200/80',
      hoverInfo: 'Most Emotional: Back to December',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Taylor_Swift_-_Speak_Now_cover.png',
      spotifyUrl: 'https://open.spotify.com/album/5AEDGbliTTfjOB8TSm1sxt'
    },
    {
      name: 'Red',
      acronym: 'R',
      year: '2012',
      description: 'Autumn leaves and heartbreak',
      colors: 'from-red-200 to-rose-200',
      gradient: 'from-red-200/80 to-rose-200/80',
      hoverInfo: 'Fan Favorite: All Too Well',
      image: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Taylor_Swift_-_Red.png',
      spotifyUrl: 'https://open.spotify.com/album/6kZ42qRrzov54LcAk4onW9'
    },
    {
      name: '1989',
      acronym: '89',
      year: '2014',
      description: 'Synth-pop reinvention',
      colors: 'from-pink-200 to-blue-200',
      gradient: 'from-pink-200/80 to-blue-200/80',
      hoverInfo: 'Most Upbeat: Shake It Off',
      image: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png',
      spotifyUrl: 'https://open.spotify.com/album/1yGbNOtRIgdIiGHOEBaZWf'
    },
    {
      name: 'Reputation',
      acronym: 'REP',
      year: '2017',
      description: 'Dark and powerful rebirth',
      colors: 'from-gray-800 to-green-300',
      gradient: 'from-gray-800/80 to-green-300/80',
      hoverInfo: 'Most Powerful: Look What You Made Me Do',
      image: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Taylor_Swift_-_Reputation.png',
      spotifyUrl: 'https://open.spotify.com/album/6DEjYFkNZh67HP7R9PSZvv'
    },
    {
      name: 'Lover',
      acronym: 'L',
      year: '2019',
      description: 'Pastel romance and activism',
      colors: 'from-pink-200 to-cyan-200',
      gradient: 'from-pink-200/80 to-cyan-200/80',
      hoverInfo: 'Most Romantic: Lover',
      image: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Taylor_Swift_-_Lover.png',
      spotifyUrl: 'https://open.spotify.com/album/1NAmidJlEaVgA3MpcPFYGq'
    },
    {
      name: 'Folklore',
      acronym: 'FOLK',
      year: '2020',
      description: 'Indie folk storytelling',
      colors: 'from-gray-300 to-green-200',
      gradient: 'from-gray-300/80 to-green-200/80',
      hoverInfo: 'Critical Acclaim: Cardigan',
      image: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Taylor_Swift_-_Folklore.png',
      spotifyUrl: 'https://open.spotify.com/album/1pzvBxYgT6OVwJLtHkrdQK'
    },
    {
      name: 'Evermore',
      acronym: 'E',
      year: '2020',
      description: 'Winter sister album',
      colors: 'from-orange-200 to-green-200',
      gradient: 'from-orange-200/80 to-green-200/80',
      hoverInfo: 'Fan Favorite: Willow',
      image: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Taylor_Swift_-_Evermore.png',
      spotifyUrl: 'https://open.spotify.com/album/6AORtDjduMM3bupSWzbTSG'
    },
    {
      name: 'Midnights',
      acronym: 'MN',
      year: '2022',
      description: 'Sleepless night stories',
      colors: 'from-indigo-900 to-blue-200',
      gradient: 'from-indigo-900/80 to-blue-200/80',
      hoverInfo: 'Record Breaker: Anti-Hero',
      image: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png',
      spotifyUrl: 'https://open.spotify.com/album/151w1FgRZfnKZA9FEcg9Z3'
    },
    {
      name: 'The Tortured Poets Department',
      acronym: 'TTPD',
      year: '2024',
      description: 'Poetic heartbreak anthology',
      colors: 'from-purple-900 to-gray-400',
      gradient: 'from-purple-900/80 to-gray-400/80',
      hoverInfo: 'Most Raw: Fortnight',
      image: 'https://upload.wikimedia.org/wikipedia/en/1/1b/The_Tortured_Poets_Department_The_Anthology.png',
      spotifyUrl: 'https://open.spotify.com/album/5H7ixXZfsNMGbIE5OBSpcb'
    },
    {
      name: 'The Life of a Showgirl',
      acronym: 'LS',
      year: '2025',
      description: 'Glamorous showbiz tales',
      colors: 'from-green-400 to-lime-200',
      gradient: 'from-green-400/80 to-lime-200/80',
      hoverInfo: 'Coming Soon...',
      image: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Taylor_Swift_%E2%80%93_The_Life_of_a_Showgirl_%28album_cover%29.png',
      spotifyUrl: 'https://open.spotify.com/album/1W57oNaAkGObOQKBTxg4e9'
    }
  ];

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Keyword Explorer',
      description: 'Find hidden patterns and recurring themes across all albums with real-time search',
      href: '/search',
      color: 'from-purple-500 to-pink-500',
      era: 'All Eras'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Sentiment Journey',
      description: 'Track emotional evolution through advanced RoBERTa AI sentiment analysis',
      href: '/sentiment',
      color: 'from-blue-500 to-teal-500',
      era: 'Emotional Map'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Era Timeline',
      description: 'Visualize lyrical trends and thematic shifts across 19 years of music',
      href: '/trends',
      color: 'from-orange-500 to-red-500',
      era: '2006-2025'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-50/30 to-blue-100/50"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Music className="w-20 h-20 text-purple-600 floating" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-500 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              The Swift Journal
            </span>
          </h1>
          
          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore <span className="text-purple-600 font-semibold">178 songs</span> across 
            <span className="text-pink-600 font-semibold"> 12 albums</span> with AI-powered 
            sentiment analysis and interactive visualizations
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link 
              href="/search"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 shadow-lg"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link 
              href="/sentiment"
              className="group border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-2xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center gap-3"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              View Analysis
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { number: '178', label: 'Songs', emoji: '🎵' },
              { number: '12', label: 'Albums', emoji: '💿' },
              { number: '19', label: 'Years', emoji: '📅' },
              { number: 'RoBERTa', label: 'AI Analysis', emoji: '🧠' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm border border-white/40 shadow-xl rounded-2xl p-4 text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <span>{stat.emoji}</span>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eras Showcase - FIXED DESIGN */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Journey Through The Eras
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          From country beginnings to poetic masterpieces, explore every chapter of Taylor's musical evolution
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {eras.map((era, index) => (
            <a
              key={index}
              href={era.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 cursor-pointer transform hover:scale-105 block"
            >
              {/* Background Image with Gradient Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('${era.image}')`
                }}
              >
                {/* Darker gradient overlay for better text visibility */}
                <div className={`absolute inset-0 bg-gradient-to-br ${era.gradient} opacity-70 group-hover:opacity-50 transition-opacity duration-500`}></div>
              </div>
              
              {/* Album Acronym Badge */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className={`w-24 h-24 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-2xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-black/50`}>
                  {era.acronym}
                </div>
              </div>
              
              {/* Bottom Info - Improved contrast */}
              <div className="absolute bottom-6 left-6 right-6 text-white z-10 transition-all duration-500 group-hover:translate-y-2">
                <h3 className="text-2xl font-bold mb-1 drop-shadow-2xl text-white">{era.name}</h3>
                <p className="text-white/95 font-medium drop-shadow-xl">{era.year}</p>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-6 z-20">
                <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                    {era.acronym}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{era.name}</h3>
                  <p className="text-white/90 mb-3">{era.year} • {era.description}</p>
                  <p className="text-white/80 text-sm italic">{era.hoverInfo}</p>
                </div>
              </div>
              
              {/* 3D Shadow Effect */}
              <div className="absolute inset-0 rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-3xl"></div>
            </a>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Discover Hidden Stories
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Advanced tools to explore Taylor's lyrical universe
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group block"
            >
              <div className="bg-white/90 backdrop-blur-sm border border-white/40 shadow-xl rounded-2xl p-8 h-full relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.color} text-white`}>
                  {feature.era}
                </div>
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all duration-300">
                  Explore Era 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 border-t border-pink-200 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Star className="w-12 h-12 text-pink-500 mx-auto mb-6 floating" />
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Dive Into the Lyrics?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          
          </p>
          <Link 
            href="/search"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Begin Your Journey
            <Music className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}