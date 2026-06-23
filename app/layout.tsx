import type { Metadata } from 'next'
import { Bodoni_Moda, DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import ChatAgent from '@/components/ChatAgent'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Swift Journal — A Digital Museum',
  description: 'Explore 179 songs across 14 albums through AI-powered emotional analysis. A cinematic archive for the dedicated listener.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bodoni.variable} ${dmSans.variable} scroll-smooth`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-dm-sans bg-background text-on-surface paper-grain overflow-x-hidden min-h-screen">
        <Header />
        <main className="relative z-10">
          {children}
        </main>
        <ChatAgent />
      </body>
    </html>
  )
}