'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Keyword', href: '/search' },
  { name: 'Insights', href: '/sentiment' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] px-margin-mobile md:px-margin-desktop py-5 transition-all duration-700 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center max-w-container-max mx-auto left-0 right-0 ${isScrolled ? 'py-3' : ''}`}>
      <Link href="/" className="font-headline text-2xl md:text-3xl font-medium text-primary tracking-tight">
        TS ARCHIVE
      </Link>

      <div className="hidden md:flex gap-10 items-center">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`font-body text-[15px] transition-colors ${pathname === item.href
              ? 'text-primary border-b border-primary pb-1'
              : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-primary text-2xl hover:bg-parchment/10 transition-all p-2 rounded-full">
          menu
        </button>
      </div>
    </nav>
  );
}
