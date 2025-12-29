'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Search, BarChart3, TrendingUp, Sparkles, Home } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Keyword Search', href: '/search', icon: Search },
  { name: 'Sentiment', href: '/sentiment', icon: BarChart3 },
  { name: 'Trends', href: '/trends', icon: TrendingUp },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-purple-200/30 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                The Swift Journal
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Lyrics Analyzer</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}