import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CineHunt - Discover Movies',
  description: 'Explore the latest blockbusters, timeless classics, and hidden gems from around the world.',
  icons: {
    icon: '/assets/images/logo.png',
    shortcut: '/assets/images/logo.png',
    apple: '/assets/images/logo.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'CineHunt - Discover Movies',
    description: 'Explore the latest blockbusters, timeless classics, and hidden gems from around the world.',
    images: ['/assets/images/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineHunt - Discover Movies',
    description: 'Explore the latest blockbusters, timeless classics, and hidden gems from around the world.',
    images: ['/assets/images/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/images/logo.png" />
        <link rel="apple-touch-icon" href="/assets/images/logo.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
