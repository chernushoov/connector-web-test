import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import '@/styles/globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Connector - Find Work & Workers Instantly',
  description:
    'Connect with workers and employers in your area. Find instant jobs or hire help in seconds. Available in Israel.',
  keywords: [
    'work',
    'jobs',
    'workers',
    'employers',
    'instant hire',
    'Israel',
    'Tel Aviv',
    'freelance',
    'gig economy',
  ],
  authors: [{ name: 'Connector' }],
  creator: 'Connector',
  publisher: 'Connector',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ru_RU', 'he_IL', 'ar_SA'],
    url: 'https://connector.app',
    siteName: 'Connector',
    title: 'Connector - Find Work & Workers Instantly',
    description:
      'Connect with workers and employers in your area. Find instant jobs or hire help in seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Connector - Find Work & Workers Instantly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connector - Find Work & Workers Instantly',
    description:
      'Connect with workers and employers in your area. Find instant jobs or hire help in seconds.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Connector',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6B5CE7' },
    { media: '(prefers-color-scheme: dark)', color: '#6B5CE7' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
