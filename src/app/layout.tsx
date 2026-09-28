import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'GoFire Tech — Skills Today. Success Tomorrow.',
    template: '%s | GoFire Tech',
  },
  description:
    'GoFire Tech is India\'s premier outcome-driven technology career platform. Master Cybersecurity, AI, and Web Development with industry experts. Placement support guaranteed.',
  keywords: [
    'cybersecurity course',
    'AI training',
    'web development bootcamp',
    'tech career platform India',
    'ethical hacking course',
    'placement assistance',
    'GoFire Tech',
  ],
  authors: [{ name: 'GoFire Tech', url: 'https://gofiretech.com' }],
  creator: 'GoFire Tech',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://gofiretech.com',
    siteName: 'GoFire Tech',
    title: 'GoFire Tech — Skills Today. Success Tomorrow.',
    description:
      'India\'s premier outcome-driven technology career platform. Master Cybersecurity, AI, and Web Development.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GoFire Tech',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoFire Tech — Skills Today. Success Tomorrow.',
    description:
      'India\'s premier outcome-driven technology career platform.',
    images: ['/og-image.png'],
    creator: '@gofiretech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#060C14" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: { primary: '#E8001C', secondary: '#fff' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
