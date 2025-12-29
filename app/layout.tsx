import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'Taylor Swift Lyrics Analyzer - Explore Her Musical Journey',
  description: 'Dive deep into Taylor Swift\'s lyrics with AI-powered sentiment analysis, keyword exploration, and interactive visualizations across all eras.',
  keywords: 'Taylor Swift, lyrics analysis, sentiment analysis, music analytics, Swiftie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans ts-gradient min-h-screen">
        <Header />
        <div className="relative">
          {/* Floating sparkles */}
          <div className="fixed inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute sparkle floating"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                }}
              />
            ))}
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}