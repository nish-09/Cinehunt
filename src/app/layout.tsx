import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CineHunt - Discover Movies',
  description: 'Explore the latest blockbusters, timeless classics, and hidden gems from around the world.',
  icons: {
    icon: [
      { url: '/assets/images/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/assets/images/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
    shortcut: '/assets/images/favicon.ico',
    apple: [
      { url: '/assets/images/favicon.ico', sizes: '180x180', type: 'image/x-icon' },
      { url: '/assets/images/favicon.ico', sizes: '152x152', type: 'image/x-icon' },
      { url: '/assets/images/favicon.ico', sizes: '120x120', type: 'image/x-icon' },
    ],
  },
  openGraph: {
    title: 'CineHunt - Discover Movies',
    description: 'Explore the latest blockbusters, timeless classics, and hidden gems from around the world.',
    images: ['/assets/images/favicon.ico'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineHunt - Discover Movies',
    description: 'Explore the latest blockbusters, timeless classics, and hidden gems from around the world.',
    images: ['/assets/images/favicon.ico'],
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
        <link rel="icon" type="image/x-icon" sizes="32x32" href="/assets/images/favicon.ico" />
        <link rel="icon" type="image/x-icon" sizes="16x16" href="/assets/images/favicon.ico" />
        <link rel="shortcut icon" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/images/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
